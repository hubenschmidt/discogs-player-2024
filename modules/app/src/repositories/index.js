const db = require('../models');
const { Op } = require('sequelize');
const { extractYouTubeVideoId } = require('../lib/extract-youtube-video-id');
const { parsePaging, toPagedResponse } = require('../lib/pagination');
const { formatDate } = require('../lib/format-date');
const { formatDuration } = require('../lib/format-duration');

const createRequestToken = async (token, secret) => {
    const requestTokenEntry = await db.RequestToken.create({
        OAuth_Request_Token: token,
        OAuth_Request_Token_Secret: secret,
    });
    return requestTokenEntry.get();
};

const getRequestToken = async oauthToken => {
    const requestTokenEntry = await db.RequestToken.findOne({
        where: { OAuth_Request_Token: oauthToken },
    });
    return requestTokenEntry;
};

const createUser = async user => {
    const [userEntry, created] = await db.User.findOrCreate({
        where: { Username: user.username },
        defaults: {
            User_Id: user.id,
            Username: user.username,
            Email: user.email,
            OAuth_Access_Token: user.accessToken,
            OAuth_Access_Token_Secret: user.accessTokenSecret,
        },
    });
    return userEntry.get();
};

const deleteUser = async userId => {
    return await db.User.destroy({
        where: { User_Id: userId },
    });
};

const createCollection = async userId => {
    return await db.Collection.findOrCreate({
        where: { User_Id: userId },
        defaults: { User_Id: userId },
    });
};

const createHistoryEntry = async (releaseId, user, video) => {
    return await db.History.create({
        User_Id: user.User_Id,
        Video_Id: video.Video_Id,
        Release_Id: releaseId,
        Played_At: new Date(),
    });
};

const getHistory = async (query, user) => {
    const { page, limit, offset, order, orderBy } = parsePaging(query, {
        defaultLimit: 50,
        maxLimit: 250,
        defaultOrderBy: 'playedAt',
        allowedOrderBy: {
            playedAt: 'playedAt',
            playCount: 'playCount',
            videoTitle: 'videoTitle',
            releaseTitle: 'releaseTitle',
            duration: 'duration',
            artistName: 'artistName',
            labelName: 'labelName',
            genreName: 'genreName',
            styleName: 'styleName',
        },
        defaultOrder: 'DESC',
    });

    const ORDER_MAP = {
        playedAt: [['Played_At', order]],
        playCount: [
            [
                { model: db.Video, as: 'Video' },
                { model: db.UserVideo, as: 'UserVideo' },
                'Play_Count',
                order,
            ],
        ],
        videoTitle: [[{ model: db.Video, as: 'Video' }, 'Title', order]],
        duration: [[{ model: db.Video, as: 'Video' }, 'Duration', order]],
        releaseTitle: [[{ model: db.Release, as: 'Release' }, 'Title', order]],
        artistName: [
            [
                { model: db.Release, as: 'Release' },
                { model: db.Artist, as: 'Artists' },
                'Name',
                order,
            ],
        ],
        labelName: [
            [
                { model: db.Release, as: 'Release' },
                { model: db.Label, as: 'Labels' },
                'Name',
                order,
            ],
        ],
        genreName: [
            [
                { model: db.Release, as: 'Release' },
                { model: db.Genre, as: 'Genres' },
                'Name',
                order,
            ],
        ],
        styleName: [
            [
                { model: db.Release, as: 'Release' },
                { model: db.Style, as: 'Styles' },
                'Name',
                order,
            ],
        ],
    };

    const orderClause = ORDER_MAP[orderBy] ?? ORDER_MAP.playedAt;

    const { count, rows } = await db.History.findAndCountAll({
        where: { User_Id: user.User_Id },
        attributes: ['History_Id', 'Played_At'],
        include: [
            {
                model: db.Video,
                as: 'Video',
                attributes: ['Video_Id', 'URI', 'Title', 'Duration'],
                include: [
                    {
                        model: db.UserVideo,
                        attributes: ['Play_Count'],
                        where: { User_Id: user.User_Id },
                    },
                ],
            },
            {
                model: db.Release,
                as: 'Release',
                attributes: ['Title'],
                include: [
                    {
                        model: db.Artist,
                        as: 'Artists',
                        attributes: ['Name'],
                        through: { attributes: [] },
                    },
                    {
                        model: db.Label,
                        as: 'Labels',
                        attributes: ['Name'],
                        through: { attributes: [] },
                    },
                    {
                        model: db.Genre,
                        as: 'Genres',
                        attributes: ['Name'],
                        through: { attributes: [] },
                    },
                    {
                        model: db.Style,
                        as: 'Styles',
                        attributes: ['Name'],
                        through: { attributes: [] },
                    },
                ],
            },
        ],
        subQuery: false,
        distinct: true,
        offset,
        limit,
        order: orderClause,
    });

    return toPagedResponse(
        count,
        page,
        limit,
        rows.map(r => r.get({ plain: true })),
    );
};

const deletePlaylist = async (playlistId, user) => {
    const deleted = await db.Playlist.destroy({
        where: { Playlist_Id: playlistId },
        User_Id: user?.User_Id,
    });

    return {
        deleted: deleted > 0,
        playlistId: Number(playlistId),
    };
};

const createPlaylist = async ({ name, description }, user, video) => {
    const playlist = await db.Playlist.create({
        User_Id: user.User_Id,
        Name: name,
        Description: description,
    });
    if (video) {
        await db.PlaylistVideo.create({
            Playlist_Id: playlist.Playlist_Id,
            Video_Id: video.Video_Id,
        });
    }

    return playlist.get();
};

const updatePlaylistMeta = async () => {};

const toYoutubeUrl = raw => {
    if (!raw) return raw ?? null;
    return /^[A-Za-z0-9_-]{11}$/.test(raw)
        ? `https://www.youtube.com/watch?v=${raw}`
        : raw;
};

const getPlaylist = async (playlistId, query, user) => {
    const pid = Number(playlistId);
    const locale = query.locale || 'en-US';
    const tz = query.tz || undefined;

    const { page, limit, offset, order, orderBy } = parsePaging(query, {
        defaultLimit: 25,
        maxLimit: 100,
        defaultOrderBy: 'updatedAt',
        allowedOrderBy: {
            addedAt: 'addedAt',
            title: 'Title',
            updatedAt: 'updatedAt',
            createdAt: 'createdAt',
        },
        defaultOrder: 'ASC',
    });

    const relPage = Math.max(parseInt(query.relPage ?? String(page)) || 1, 1);
    const relLimit = Math.max(
        1,
        Math.min(parseInt(query.relLimit ?? String(limit)) || limit, 100),
    );
    const relOffset = (relPage - 1) * relLimit;

    const playlistCore = await db.Playlist.findOne({
        where: { Playlist_Id: pid, User_Id: user.User_Id },
        attributes: [
            'Playlist_Id',
            'User_Id',
            'Name',
            'Description',
            'Tracks_Count',
            'createdAt',
            'updatedAt',
        ],
    });
    if (!playlistCore) return { error: 'Playlist not found' };

    const videoOrderMap = {
        Title: [[{ model: db.Video, as: 'Video' }, 'Title', order]],
        updatedAt: [[{ model: db.Video, as: 'Video' }, 'updatedAt', order]],
        createdAt: [[{ model: db.Video, as: 'Video' }, 'createdAt', order]],
    };
    const videoOrder = videoOrderMap[orderBy] ?? [
        [{ model: db.Video, as: 'Video' }, 'updatedAt', 'DESC'],
    ];

    const videosJoin = await db.PlaylistVideo.findAndCountAll({
        where: { Playlist_Id: pid },
        include: [
            {
                model: db.Video,
                as: 'Video',
                required: true,
            },
        ],
        order: videoOrder,
        limit,
        offset,
    });

    const totalVideos = videosJoin.count;
    const videosRaw = videosJoin.rows.map(pv =>
        pv.Video?.get ? pv.Video.get({ plain: true }) : pv.Video,
    );

    let videosWithRelease = videosRaw;

    const videoIds = videosRaw.map(v => v.Video_Id);

    const rvLinks = await db.ReleaseVideo.findAll({
        where: { Video_Id: { [Op.in]: videoIds } },
        attributes: ['Video_Id', 'Release_Id'],
        raw: true,
    });

    const v2r = new Map();
    const releaseIds = new Set();
    for (const row of rvLinks) {
        if (!v2r.has(row.Video_Id)) {
            v2r.set(row.Video_Id, row.Release_Id);
            releaseIds.add(row.Release_Id);
        }
    }

    let releasesAllPlain = [];
    if (releaseIds.size) {
        const releasesAll = await db.Release.findAll({
            where: { Release_Id: { [Op.in]: Array.from(releaseIds) } },
            include: [
                { model: db.Genre, through: { attributes: [] } },
                { model: db.Style, through: { attributes: [] } },
                { model: db.Artist, through: { attributes: [] } },
                { model: db.Label, through: { attributes: [] } },
            ],
        });

        releasesAllPlain = releasesAll.map(r =>
            r.get ? r.get({ plain: true }) : r,
        );
    }

    const r2release = new Map();
    for (const r of releasesAllPlain) r2release.set(r.Release_Id, r);

    videosWithRelease = videosRaw.map(v => {
        const rid = v2r.get(v.Video_Id) ?? null;
        const releaseObj = rid ? (r2release.get(rid) ?? null) : null;

        return {
            ...v,
            Release_Id: rid,
            Thumb: releaseObj?.Thumb ?? null,
            release: releaseObj,
        };
    });

    let releasesPaged = [];
    let releasesCount = 0;

    if (videosWithRelease.length) {
        const releaseIdsOrdered = [];
        const seen = new Set();
        for (const v of videosWithRelease) {
            const rid = v?.Release_Id;
            if (Number.isInteger(rid) && !seen.has(rid)) {
                seen.add(rid);
                releaseIdsOrdered.push(rid);
            }
        }

        releasesCount = releaseIdsOrdered.length;

        const sliceStart = relOffset;
        const sliceEnd = relOffset + relLimit;
        const pagedIds = releaseIdsOrdered.slice(sliceStart, sliceEnd);

        if (pagedIds.length) {
            const relRows = await db.Release.findAll({
                where: { Release_Id: { [Op.in]: pagedIds } },
                include: [
                    { model: db.Genre, through: { attributes: [] } },
                    { model: db.Style, through: { attributes: [] } },
                    { model: db.Artist, through: { attributes: [] } },
                    { model: db.Label, through: { attributes: [] } },
                ],
            });

            const rank = new Map();
            pagedIds.forEach((id, i) => rank.set(id, i));

            relRows.sort(
                (a, b) =>
                    (rank.get(a.Release_Id) ?? 0) -
                    (rank.get(b.Release_Id) ?? 0),
            );

            releasesPaged = relRows.map(r =>
                r.get ? r.get({ plain: true }) : r,
            );
        }
    }

    const playlistPlain = playlistCore.get
        ? playlistCore.get({ plain: true })
        : playlistCore;
    const playlist = {
        ...playlistPlain,
        createdAtFormatted: formatDate(playlistPlain.createdAt, locale, tz),
        updatedAtFormatted: formatDate(playlistPlain.updatedAt, locale, tz),
    };

    const videosEnriched = videosWithRelease.map(v => ({
        ...v,
        title: v.Title,
        uri: toYoutubeUrl(v.URI),
        createdAtFormatted: formatDate(v.createdAt, locale, tz),
        updatedAtFormatted: formatDate(v.updatedAt, locale, tz),
        durationFormatted: formatDuration(v.Duration),
    }));

    const releasesEnriched = releasesPaged.map(r => ({
        ...r,
        dateAddedFormatted: formatDate(r.Date_Added, locale, tz),
        createdAtFormatted: formatDate(r.createdAt, locale, tz),
        updatedAtFormatted: formatDate(r.updatedAt, locale, tz),
    }));

    return {
        playlist,
        videos: toPagedResponse(totalVideos, page, limit, videosEnriched),
        releases: toPagedResponse(
            releasesCount,
            relLimit,
            relPage,
            releasesEnriched,
        ),
    };
};

const getVideo = async uri => {
    const extractedUri = extractYouTubeVideoId(uri);
    return await db.Video.findOne({
        where: { URI: extractedUri },
        raw: true,
    });
};

const updateVideoPlayCount = async (
    releaseId,
    { uri, title, duration },
    user,
) => {
    return db.sequelize.transaction(async t => {
        const extractedUri = extractYouTubeVideoId(uri);

        const [video] = await db.Video.findOrCreate({
            where: { URI: extractedUri },
            defaults: {
                URI: extractedUri,
                Title: title,
                Duration: duration,
            },
            transaction: t,
        });
        const plainVideo = video.get();

        await db.ReleaseVideo.findOrCreate({
            where: {
                Release_Id: releaseId,
                Video_Id: plainVideo.Video_Id,
            },
            defaults: {
                Release_Id: releaseId,
                Video_Id: plainVideo.Video_Id,
            },
            transaction: t,
        });

        const [userVideo] = await db.UserVideo.findOrCreate({
            where: { User_Id: user.User_Id, Video_Id: video.Video_Id },
            defaults: {
                User_Id: user.User_Id,
                Video_Id: video.Video_Id,
                Play_Count: 0,
            },
            transaction: t,
        });

        await userVideo.increment('Play_Count', { by: 1, transaction: t });

        const updates = {};
        if (title && title !== video.Title) updates.Title = title;
        if (duration && duration !== video.Duration)
            updates.Duration = duration;
        if (Object.keys(updates).length) {
            await video.update(updates, { transaction: t });
        }

        return await video.get();
    });
};

const syncData = async (model, data, primaryKey) => {
    if (primaryKey) {
        await db[model].destroy({
            where: {
                [primaryKey]: { [Op.notIn]: data.map(d => d[primaryKey]) },
            },
        });
    }

    return await db[model].bulkCreate(data, { ignoreDuplicates: true });
};

const getUser = async ({ email, username } = {}) => {
    const orConditions = [];
    if (email) orConditions.push({ Email: email });
    if (username) orConditions.push({ Username: username });

    const userEntry = await db.User.findOne({
        where: {
            [Op.or]: orConditions,
        },
    });

    return userEntry?.get();
};

const getCollection = async (username, query) => {
    try {
        const { page, limit, offset, order, orderBy } = parsePaging(query, {
            defaultLimit: 25,
            maxLimit: 100,
            defaultOrderBy: 'Date_Added',
            allowedOrderBy: {
                Release_Id: 'Release_Id',
                Date_Added: 'Date_Added',
                Title: 'Title',
                Year: 'Year',
            },
            defaultOrder: 'DESC',
        });

        const randomize =
            typeof query.randomize === 'string'
                ? query.randomize.toLowerCase() === 'true'
                : !!query.randomize;

        const genresQ = parseStringList(query.genre);
        const stylesQ = parseStringList(query.style);
        const yearsQ = parseStringList(query.year);
        const yearsFilter = (yearsQ ?? [])
            .map(y => Number(y))
            .filter(n => Number.isFinite(n));

        const user = await db.User.findOne({
            where: { Username: username },
            include: [{ model: db.Collection }],
        });

        const releaseWhere = {};
        const releaseIdsList = parseStringList(query.releaseIds);
        if (releaseIdsList?.length) {
            releaseWhere.Release_Id = { [Op.in]: releaseIdsList.map(Number) };
        } else if (query.releaseId) {
            releaseWhere.Release_Id = query.releaseId;
        }
        if (yearsFilter.length) releaseWhere.Year = { [Op.in]: yearsFilter };

        const orderClause = randomize
            ? db.sequelize.random()
            : [[orderBy, order]];

        const { count, rows } = await db.Release.findAndCountAll({
            distinct: true,
            where: releaseWhere,
            attributes: [
                'Release_Id',
                'Title',
                'Date_Added',
                'Year',
                'Cover_Image',
                'Thumb',
            ],
            include: [
                {
                    model: db.Collection,
                    where: {
                        Collection_Id: user.Collection.Collection_Id,
                    },
                    attributes: [],
                    through: { attributes: [] },
                },
                {
                    model: db.Genre,
                    ...(genresQ?.length && {
                        where: { Name: { [Op.in]: genresQ } },
                        required: true,
                    }),
                    attributes: ['Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Style,
                    ...(stylesQ?.length && {
                        where: { Name: { [Op.in]: stylesQ } },
                        required: true,
                    }),
                    attributes: ['Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Artist,
                    ...(query.artistId && {
                        where: { Artist_Id: { [Op.in]: [query.artistId] } },
                    }),
                    attributes: ['Artist_Id', 'Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Label,
                    ...(query.labelId && {
                        where: { Label_Id: { [Op.in]: [query.labelId] } },
                    }),
                    attributes: ['Label_Id', 'Name', 'Cat_No'],
                    through: { attributes: [] },
                },
            ],
            offset,
            limit,
            order: orderClause,
        });

        return toPagedResponse(
            count,
            page,
            limit,
            rows.map(r => r.get({ plain: true })),
        );
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
};

const getPlaylists = async (query, user) => {
    const { page, limit, offset, order, orderBy } = parsePaging(query, {
        defaultLimit: 25,
        maxLimit: 100,
        defaultOrderBy: 'updatedAt',
        allowedOrderBy: {
            Name: 'Name',
            updatedAt: 'updatedAt',
            createdAt: 'createdAt',
            Playlist_Id: 'Playlist_Id',
        },
        defaultOrder: 'DESC',
    });

    const locale = query.locale || 'en-US';
    const tz = query.tz || undefined;

    const { count, rows } = await db.Playlist.findAndCountAll({
        where: { User_Id: user.User_Id },
        order: [
            [orderBy, order],
            ['updatedAt', 'DESC'],
        ],
        limit,
        offset,
        distinct: true,
        include: {
            model: db.Video,
            attributes: [
                'Video_Id',
                'URI',
                'Title',
                'Duration',
                'createdAt',
                'updatedAt',
            ],
            through: { attributes: [] },
            eparate: true,
            order: [['updatedAt', 'DESC']],
        },
    });

    const items = rows.map(r => {
        const p = r.get({ plain: true });
        return {
            ...p,
            createdAtFormatted: formatDate(p.createdAt, locale, tz),
            updatedAtFormatted: formatDate(p.updatedAt, locale, tz),
            Videos: (p.Videos ?? []).map(v => ({
                ...v,
                createdAtFormatted: formatDate(v.createdAt, locale, tz),
                updatedAtFormatted: formatDate(v.updatedAt, locale, tz),
                durationFormatted: formatDuration(v.Duration),
            })),
        };
    });

    return toPagedResponse(count, page, limit, items);
};

const getStylesByGenre = async genre => {
    if (!genre) {
        throw new Error('Genre name is required');
    }

    const styles = await db.Style.findAll({
        attributes: ['Name'],
        where: {
            Name: {
                [Op.in]: db.sequelize.literal(`(
                    SELECT DISTINCT rs."Style_Name"
                    FROM "ReleaseStyle" rs
                    INNER JOIN "ReleaseGenre" rg ON rs."Release_Id" = rg."Release_Id"
                    WHERE rg."Genre_Name" = ${db.sequelize.escape(genre)}
                )`),
            },
        },
        order: [['Name', 'ASC']],
        raw: true,
    });

    return styles;
};

const search = async (username, query) => {
    const { searchQuery, type } = query;

    const ilikeWildcard = `%${searchQuery}%`;

    if (type === undefined) {
        const [releases, artists, labels] = await Promise.all([
            db.Release.findAll({
                where: { Title: { [Op.iLike]: ilikeWildcard } },
                include: [
                    {
                        model: db.Collection,
                        required: true,
                        include: [
                            {
                                model: db.User,
                                required: true,
                                where: { Username: username },
                            },
                        ],
                    },
                ],
            }),
            db.Artist.findAll({
                where: { Name: { [Op.iLike]: ilikeWildcard } },
                include: [
                    {
                        model: db.Release,
                        required: true,
                        include: [
                            {
                                model: db.Collection,
                                required: true,
                                include: [
                                    {
                                        model: db.User,
                                        required: true,
                                        where: { Username: username },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
            db.Label.findAll({
                where: { Name: { [Op.iLike]: ilikeWildcard } },
                include: [
                    {
                        model: db.Release,
                        required: true,
                        include: [
                            {
                                model: db.Collection,
                                required: true,
                                include: [
                                    {
                                        model: db.User,
                                        required: true,
                                        where: { Username: username },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }),
        ]);

        return [
            ...releases.map(r => ({ ...r.toJSON(), type: 'release' })),
            ...artists.map(a => ({ ...a.toJSON(), type: 'artist' })),
            ...labels.map(l => ({ ...l.toJSON(), type: 'label' })),
        ];
    }

    const searchModels = {
        artist: { model: db.Artist, field: 'Name' },
        release: { model: db.Release, field: 'Title' },
        label: { model: db.Label, field: 'Name' },
    };

    const config = searchModels[type];
    if (!config) return [];

    const include =
        type === 'release'
            ? [
                  {
                      model: db.Collection,
                      required: true,
                      include: [
                          {
                              model: db.User,
                              required: true,
                              where: { Username: username },
                          },
                      ],
                  },
              ]
            : [
                  {
                      model: db.Release,
                      required: true,
                      include: [
                          {
                              model: db.Collection,
                              required: true,
                              include: [
                                  {
                                      model: db.User,
                                      required: true,
                                      where: { Username: username },
                                  },
                              ],
                          },
                      ],
                  },
              ];

    return config.model.findAll({
        where: { [config.field]: { [Op.iLike]: ilikeWildcard } },
        include,
    });
};

const deleteFromPlaylist = async (playlistId, uri) => {
    return db.sequelize.transaction(async t => {
        const video = await db.Video.findOne({
            where: { URI: uri },
            transaction: t,
        });

        const playlistVideo = await db.PlaylistVideo.findOne({
            where: {
                Playlist_Id: playlistId,
                Video_Id: video.Video_Id,
            },
            transaction: t,
        });

        await playlistVideo.destroy({ transaction: t });

        if (db.Playlist?.rawAttributes?.Tracks_Count) {
            await db.Playlist.increment(
                { Tracks_Count: -1 },
                { where: { Playlist_Id: playlistId }, transaction: t },
            );
        }

        const videoPlain = video.get ? video.get({ plain: true }) : video;
        return {
            removed: true,
            playlistId,
            playlistVideo: playlistVideo.get
                ? playlistVideo.get({ plain: true })
                : { Playlist_Id: playlistId, Video_Id: video.Video_Id },
            video: videoPlain,
        };
    });
};

const addToPlaylist = async (playlistId, uri) => {
    const extractedUri = extractYouTubeVideoId(uri);

    return db.sequelize.transaction(async t => {
        const video = await db.Video.findOne({
            where: { URI: extractedUri },
            transaction: t,
            raw: true,
        });

        const [playlistVideo, created] = await db.PlaylistVideo.findOrCreate({
            where: {
                Playlist_Id: playlistId,
                Video_Id: video.Video_Id,
            },
            defaults: {
                Playlist_Id: playlistId,
                Video_Id: video.Video_Id,
            },
            transaction: t,
        });

        return {
            added: created,
            playlistId: playlistId,
            playlistVideo: playlistVideo.get({ plain: true }),
            video: video.get ? video.get({ plain: true }) : video,
        };
    });
};

// ── Curator / Chat ──────────────────────────────────────────────────

const createChatSession = async (userId, title) => {
    const session = await db.ChatSession.create({
        User_Id: userId,
        Title: title ?? null,
    });
    return session.get({ plain: true });
};

const getChatSessions = async userId => {
    const sessions = await db.ChatSession.findAll({
        where: { User_Id: userId },
        order: [['updatedAt', 'DESC']],
        raw: true,
    });
    return sessions;
};

const getChatMessages = async sessionId => {
    const messages = await db.ChatMessage.findAll({
        where: { ChatSession_Id: sessionId },
        order: [['createdAt', 'ASC']],
        raw: true,
    });
    return messages;
};

const createChatMessage = async (
    sessionId,
    role,
    content,
    toolCalls,
    toolCallId,
) => {
    const msg = await db.ChatMessage.create({
        ChatSession_Id: sessionId,
        Role: role,
        Content: content,
        Tool_Calls: toolCalls ?? null,
        Tool_Call_Id: toolCallId ?? null,
    });
    return msg.get({ plain: true });
};

const getCollectionForAI = async (username, filters) => {
    const user = await db.User.findOne({
        where: { Username: username },
        include: [{ model: db.Collection }],
    });
    if (!user?.Collection) return [];

    const releaseWhere = {};
    if (filters?.yearFrom || filters?.yearTo) {
        releaseWhere.Year = {};
        if (filters.yearFrom) releaseWhere.Year[Op.gte] = filters.yearFrom;
        if (filters.yearTo) releaseWhere.Year[Op.lte] = filters.yearTo;
    }

    const genreInclude = {
        model: db.Genre,
        attributes: ['Name'],
        through: { attributes: [] },
    };
    if (filters?.genres?.length) {
        genreInclude.where = { Name: { [Op.in]: filters.genres } };
        genreInclude.required = true;
    }

    const styleInclude = {
        model: db.Style,
        attributes: ['Name'],
        through: { attributes: [] },
    };
    if (filters?.styles?.length) {
        styleInclude.where = { Name: { [Op.in]: filters.styles } };
        styleInclude.required = true;
    }

    const artistInclude = {
        model: db.Artist,
        attributes: ['Artist_Id', 'Name'],
        through: { attributes: [] },
    };
    if (filters?.artistId) {
        artistInclude.where = { Artist_Id: filters.artistId };
        artistInclude.required = true;
    }

    const labelInclude = {
        model: db.Label,
        attributes: ['Label_Id', 'Name'],
        through: { attributes: [] },
    };
    if (filters?.labelId) {
        labelInclude.where = { Label_Id: filters.labelId };
        labelInclude.required = true;
    }

    const rows = await db.Release.findAll({
        where: releaseWhere,
        attributes: ['Release_Id', 'Title', 'Year'],
        include: [
            {
                model: db.Collection,
                where: { Collection_Id: user.Collection.Collection_Id },
                attributes: [],
                through: { attributes: [] },
            },
            genreInclude,
            styleInclude,
            artistInclude,
            labelInclude,
            {
                model: db.Video,
                attributes: ['Video_Id', 'URI', 'Title', 'Duration'],
                through: { attributes: [] },
            },
        ],
        distinct: true,
        limit: filters?.limit ?? 50,
    });

    return rows.map(r => r.get({ plain: true }));
};

const getReleaseWithVideos = async releaseId => {
    const release = await db.Release.findOne({
        where: { Release_Id: releaseId },
        include: [
            {
                model: db.Genre,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Style,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Artist,
                attributes: ['Artist_Id', 'Name'],
                through: { attributes: [] },
            },
            {
                model: db.Label,
                attributes: ['Label_Id', 'Name', 'Cat_No'],
                through: { attributes: [] },
            },
            {
                model: db.Video,
                attributes: ['Video_Id', 'URI', 'Title', 'Duration'],
                through: { attributes: [] },
            },
        ],
    });
    return release?.get({ plain: true }) ?? null;
};

const createStagedPlaylist = async (sessionId, userId, name, description) => {
    const staged = await db.StagedPlaylist.create({
        ChatSession_Id: sessionId,
        User_Id: userId,
        Name: name,
        Description: description ?? null,
        Status: 'draft',
    });
    return staged.get({ plain: true });
};

const createStagedPlaylistVideo = async (
    stagedPlaylistId,
    videoId,
    releaseId,
    position,
    rationale,
) => {
    const entry = await db.StagedPlaylistVideo.create({
        StagedPlaylist_Id: stagedPlaylistId,
        Video_Id: videoId,
        Release_Id: releaseId,
        Position: position,
        AI_Rationale: rationale ?? null,
    });
    return entry.get({ plain: true });
};

const getStagedPlaylist = async stagedPlaylistId => {
    const staged = await db.StagedPlaylist.findOne({
        where: { StagedPlaylist_Id: stagedPlaylistId },
        include: [
            {
                model: db.StagedPlaylistVideo,
                as: 'Videos',
                include: [
                    {
                        model: db.Video,
                        attributes: ['Video_Id', 'URI', 'Title', 'Duration'],
                    },
                    {
                        model: db.Release,
                        attributes: ['Release_Id', 'Title', 'Year', 'Thumb'],
                        include: [
                            {
                                model: db.Artist,
                                attributes: ['Name'],
                                through: { attributes: [] },
                            },
                        ],
                    },
                ],
                order: [['Position', 'ASC']],
            },
        ],
    });
    return staged?.get({ plain: true }) ?? null;
};

const confirmStagedPlaylist = async (stagedPlaylistId, userId) => {
    return db.sequelize.transaction(async t => {
        const staged = await db.StagedPlaylist.findOne({
            where: {
                StagedPlaylist_Id: stagedPlaylistId,
                User_Id: userId,
                Status: 'draft',
            },
            include: [{ model: db.StagedPlaylistVideo, as: 'Videos' }],
            transaction: t,
        });
        if (!staged) return null;

        const playlist = await db.Playlist.create(
            {
                User_Id: userId,
                Name: staged.Name,
                Description: staged.Description,
            },
            { transaction: t },
        );

        const videos = staged.Videos ?? [];
        for (const sv of videos) {
            await db.PlaylistVideo.findOrCreate({
                where: {
                    Playlist_Id: playlist.Playlist_Id,
                    Video_Id: sv.Video_Id,
                },
                defaults: {
                    Playlist_Id: playlist.Playlist_Id,
                    Video_Id: sv.Video_Id,
                },
                transaction: t,
            });
        }

        await staged.update({ Status: 'confirmed' }, { transaction: t });

        return playlist.get({ plain: true });
    });
};

const discardStagedPlaylist = async (stagedPlaylistId, userId) => {
    const staged = await db.StagedPlaylist.findOne({
        where: { StagedPlaylist_Id: stagedPlaylistId, User_Id: userId },
    });
    if (!staged) return null;
    await staged.update({ Status: 'discarded' });
    return staged.get({ plain: true });
};

const updateStagedPlaylistVideos = async (stagedPlaylistId, videoIds) => {
    return db.sequelize.transaction(async t => {
        await db.StagedPlaylistVideo.destroy({
            where: { StagedPlaylist_Id: stagedPlaylistId },
            transaction: t,
        });

        for (let i = 0; i < videoIds.length; i++) {
            await db.StagedPlaylistVideo.create(
                {
                    StagedPlaylist_Id: stagedPlaylistId,
                    Video_Id: videoIds[i],
                    Position: i,
                },
                { transaction: t },
            );
        }

        return getStagedPlaylist(stagedPlaylistId);
    });
};

const parseStringList = input => {
    if (input == null) return null;

    if (typeof input === 'string') {
        const trimmed = input.trim();
        return trimmed
            .split(',')
            .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
            .filter(Boolean);
    }

    return null;
};

const getExplorer = async (username, query) => {
    const genresQ = parseStringList(query.genre);
    const stylesQ = parseStringList(query.style);
    const yearsQ = parseStringList(query.year);

    const yearsFilter = (yearsQ ?? [])
        .map(y => Number(y))
        .filter(n => Number.isFinite(n));

    const user = await db.User.findOne({
        where: { Username: username },
        attributes: ['User_Id'],
        include: [{ model: db.Collection, attributes: ['Collection_Id'] }],
    });

    const collectionId = user?.Collection?.Collection_Id;
    if (!collectionId) {
        return { Years: [], Genres: [], Styles: [] };
    }

    const whereCollection = { Collection_Id: collectionId };

    const releaseNestedIncludesForYears = [
        {
            model: db.Collection,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: whereCollection,
        },
    ];

    if (genresQ?.length) {
        releaseNestedIncludesForYears.push({
            model: db.Genre,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: { Name: { [Op.in]: genresQ } },
        });
    }

    if (stylesQ?.length) {
        releaseNestedIncludesForYears.push({
            model: db.Style,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: { Name: { [Op.in]: stylesQ } },
        });
    }

    const years = await db.Release.findAll({
        attributes: ['Year'],
        where: { Year: { [Op.not]: null } },
        include: releaseNestedIncludesForYears,
        group: ['Release.Year'],
        order: [['Year', 'ASC']],
        raw: true,
    });

    const releaseIncludeWithOptionalYear = (extraNested = []) => ({
        model: db.Release,
        attributes: [],
        required: true,
        through: { attributes: [] },
        ...(yearsFilter.length
            ? { where: { Year: { [Op.in]: yearsFilter } } }
            : {}),
        include: [
            {
                model: db.Collection,
                attributes: [],
                required: true,
                through: { attributes: [] },
                where: whereCollection,
            },
            ...extraNested,
        ],
    });

    const genreListExtraNested = [];
    if (stylesQ?.length) {
        genreListExtraNested.push({
            model: db.Style,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: { Name: { [Op.in]: stylesQ } },
        });
    }

    const genres = await db.Genre.findAll({
        attributes: ['Name'],
        include: [releaseIncludeWithOptionalYear(genreListExtraNested)],
        group: ['Genre.Name'],
        order: [['Name', 'ASC']],
        raw: true,
    });

    const stylesListExtraNested = [];
    if (genresQ?.length) {
        stylesListExtraNested.push({
            model: db.Genre,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: { Name: { [Op.in]: genresQ } },
        });
    }

    const styles = await db.Style.findAll({
        attributes: ['Name'],
        include: [releaseIncludeWithOptionalYear(stylesListExtraNested)],
        group: ['Style.Name'],
        order: [['Name', 'ASC']],
        raw: true,
    });

    return {
        Years: years.map(y => y.Year),
        Genres: genres.map(g => g.Name),
        Styles: styles.map(s => s.Name),
    };
};

const getReleasesForEmbedding = async username => {
    const user = await db.User.findOne({
        where: { Username: username },
        include: [{ model: db.Collection, attributes: ['Collection_Id'] }],
    });
    if (!user?.Collection) return [];

    const rows = await db.Release.findAll({
        attributes: ['Release_Id', 'Title', 'Year', 'Notes', 'Country', 'Tracklist', 'Extraartists'],
        include: [
            {
                model: db.Collection,
                where: { Collection_Id: user.Collection.Collection_Id },
                attributes: [],
                through: { attributes: [] },
            },
            {
                model: db.ReleaseEmbedding,
                attributes: [],
                required: false,
            },
            {
                model: db.Artist,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Label,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Genre,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Style,
                attributes: ['Name'],
                through: { attributes: [] },
            },
            {
                model: db.Video,
                attributes: ['Title'],
                through: { attributes: [] },
            },
        ],
        where: { '$ReleaseEmbedding.Release_Id$': null },
    });

    return rows.map(r => r.get({ plain: true }));
};

const searchByVector = async (embedding, username, limit = 15) => {
    const vectorStr = `[${embedding.join(',')}]`;
    const [ranked] = await db.sequelize.query(
        `SELECT re."Release_Id",
                1 - (re."Embedding" <=> $1::vector) AS similarity
         FROM "ReleaseEmbedding" re
         JOIN "ReleaseCollection" rc ON rc."Release_Id" = re."Release_Id"
         JOIN "Collection" c ON c."Collection_Id" = rc."Collection_Id"
         JOIN "User" u ON u."User_Id" = c."User_Id"
         WHERE u."Username" = $2
         ORDER BY re."Embedding" <=> $1::vector
         LIMIT $3`,
        { bind: [vectorStr, username, limit] },
    );
    if (!ranked.length) return [];

    const ids = ranked.map(r => r.Release_Id);
    const releases = await db.Release.findAll({
        where: { Release_Id: ids },
        include: [
            { model: db.Artist, through: { attributes: [] } },
            { model: db.Label, through: { attributes: [] } },
            { model: db.Genre, through: { attributes: [] } },
            { model: db.Style, through: { attributes: [] } },
        ],
    });

    const releaseMap = Object.fromEntries(releases.map(r => [r.Release_Id, r.toJSON()]));
    return ranked.map(r => ({ ...releaseMap[r.Release_Id], similarity: r.similarity })).filter(r => r.Release_Id);
};

const upsertReleaseEmbedding = async (releaseId, embeddingText, embedding) => {
    const vectorStr = `[${embedding.join(',')}]`;
    await db.sequelize.query(
        `INSERT INTO "ReleaseEmbedding" ("Release_Id", "Embedding_Text", "Embedding", "Embedded_At")
         VALUES ($1, $2, $3::vector, NOW())
         ON CONFLICT ("Release_Id")
         DO UPDATE SET "Embedding_Text" = $2, "Embedding" = $3::vector, "Embedded_At" = NOW()`,
        { bind: [releaseId, embeddingText, vectorStr] },
    );
};

const deleteStaleEmbeddings = async (username) => {
    const [, meta] = await db.sequelize.query(
        `DELETE FROM "ReleaseEmbedding" re
         USING "Release" r, "ReleaseCollection" rc, "Collection" c, "User" u
         WHERE re."Release_Id" = r."Release_Id"
           AND rc."Release_Id" = r."Release_Id"
           AND c."Collection_Id" = rc."Collection_Id"
           AND u."User_Id" = c."User_Id"
           AND u."Username" = $1
           AND r."Enriched_At" IS NOT NULL
           AND re."Embedded_At" < r."Enriched_At"`,
        { bind: [username] },
    );
    const deleted = meta?.rowCount ?? 0;
    if (deleted) console.log(`[embedding] deleted ${deleted} stale embeddings for ${username}`);
    return deleted;
};

const getUnenrichedReleaseIds = async (username) => {
    const [results] = await db.sequelize.query(
        `SELECT r."Release_Id"
         FROM "Release" r
         JOIN "ReleaseCollection" rc ON rc."Release_Id" = r."Release_Id"
         JOIN "Collection" c ON c."Collection_Id" = rc."Collection_Id"
         JOIN "User" u ON u."User_Id" = c."User_Id"
         WHERE u."Username" = $1 AND r."Enriched_At" IS NULL
         ORDER BY r."Release_Id" ASC`,
        { bind: [username] },
    );
    return results.map(r => r.Release_Id);
};

const updateReleaseEnrichment = async (releaseId, { notes, country, tracklist, extraartists }) => {
    await db.Release.update(
        {
            Notes: notes,
            Country: country,
            Tracklist: tracklist,
            Extraartists: extraartists,
            Enriched_At: new Date(),
        },
        { where: { Release_Id: releaseId } },
    );
};

module.exports = {
    createRequestToken,
    getRequestToken,
    createUser,
    deleteUser,
    createCollection,
    createHistoryEntry,
    getHistory,
    deletePlaylist,
    createPlaylist,
    updatePlaylistMeta,
    getPlaylist,
    getVideo,
    updateVideoPlayCount,
    syncData,
    getUser,
    getCollection,
    getPlaylists,
    getStylesByGenre,
    search,
    deleteFromPlaylist,
    addToPlaylist,
    createChatSession,
    getChatSessions,
    getChatMessages,
    createChatMessage,
    getCollectionForAI,
    getReleaseWithVideos,
    createStagedPlaylist,
    createStagedPlaylistVideo,
    getStagedPlaylist,
    confirmStagedPlaylist,
    discardStagedPlaylist,
    updateStagedPlaylistVideos,
    getExplorer,
    getReleasesForEmbedding,
    searchByVector,
    upsertReleaseEmbedding,
    deleteStaleEmbeddings,
    getUnenrichedReleaseIds,
    updateReleaseEnrichment,
};
