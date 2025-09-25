const db = require('../models');
import { Request } from 'express';
import { Model, Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';
import { parsePaging, toPagedResponse } from '../lib/pagination';
import { formatDate } from '../lib/format-date';
import { formatDuration } from '../lib/format-duration';

export interface AuthenticatedRequest extends Request {
    user: any;
}

export const createRequestToken = async (token: string, secret: string) => {
    const requestTokenEntry = await db.RequestToken.create({
        OAuth_Request_Token: token,
        OAuth_Request_Token_Secret: secret,
    });
    return requestTokenEntry.get();
};

export const getRequestToken = async (req: Request) => {
    const {
        body: { oauth_token },
    } = req;
    const requestTokenEntry = await db.RequestToken.findOne({
        where: { OAuth_Request_Token: oauth_token },
    });
    return requestTokenEntry;
};

interface DiscogsUserIdentity {
    id: number;
    username: string;
    email: string;
    accessToken: string;
    accessTokenSecret: string;
}

export const createUser = async (user: DiscogsUserIdentity) => {
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

export const createCollection = async (userId: number) => {
    return await db.Collection.findOrCreate({
        where: { User_Id: userId },
        defaults: { User_Id: userId },
    });
};

export const createHistoryEntry = async (
    req: Request,
    user: any,
    video: any,
) => {
    const { release_id } = req.params;
    return await db.History.create({
        User_Id: user.User_Id,
        Video_Id: video.Video_Id,
        Release_Id: release_id,
        Played_At: new Date(),
    });
};

export const getHistory = async (req: Request, user: any) => {
    // Accept the same sort keys the frontend emits
    const { page, limit, offset, order, orderBy } = parsePaging(req, {
        defaultLimit: 50,
        maxLimit: 250,
        defaultOrderBy: 'playedAt', // <-- frontend default
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

    // map UI keys -> Sequelize path order (must match "as" aliases above)
    const ORDER_MAP: Record<string, any[]> = {
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
                        where: { User_Id: user.User_Id }, // constrain to the current user
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
        rows.map((r: any) => r.get({ plain: true })),
    );
};

export const createPlaylist = async (req: Request, user: any, video?: any) => {
    const playlist = await db.Playlist.create({
        User_Id: user.User_Id,
        Name: req.body.name,
        Description: req.body.description,
    });
    if (video) {
        await db.PlaylistVideo.create({
            Playlist_Id: playlist.Playlist_Id,
            Video_Id: video.Video_Id,
        });
    }

    return playlist.get();
};

export const updatePlaylistMeta = async () => {};

// helper: make a full YouTube URL when the DB stores the 11-char videoId
const toYoutubeUrl = (raw?: string | null) => {
    if (!raw) return raw ?? null;
    // common case: 11-char YouTube ID
    return /^[A-Za-z0-9_-]{11}$/.test(raw)
        ? `https://www.youtube.com/watch?v=${raw}`
        : raw;
};

export const getPlaylist = async (req: Request, user: any) => {
    const pid = Number(req.params.playlistId);

    // allow client to choose formatting; fallback to en-US/no TZ
    const locale = (req.query.locale as string) || 'en-US';
    const tz = (req.query.tz as string) || undefined;

    // ---- 1) Base paging for VIDEOS
    const { page, limit, offset, order, orderBy } = parsePaging(req, {
        defaultLimit: 25,
        maxLimit: 100,
        defaultOrderBy: 'updatedAt',
        allowedOrderBy: {
            // exposed -> column (we translate below)
            addedAt: 'addedAt', // PlaylistVideo.createdAt
            title: 'Title', // Video.Title
            updatedAt: 'updatedAt', // Video.updatedAt
            createdAt: 'createdAt', // Video.createdAt
        },
        defaultOrder: 'ASC',
    });

    // Optional separate paging for RELEASES (defaults to same as videos)
    const relPage = Math.max(
        parseInt((req.query.relPage as string) ?? String(page)) || 1,
        1,
    );
    const relLimit = Math.max(
        1,
        Math.min(
            parseInt((req.query.relLimit as string) ?? String(limit)) || limit,
            100,
        ),
    );
    const relOffset = (relPage - 1) * relLimit;

    // ---- 2) Fetch the playlist core (no eager yet)
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

    // ---- 3) Paged VIDEOS via the join table (no separate:)
    const videoOrder: any[] = (() => {
        switch (orderBy) {
            case 'Title':
                return [[{ model: db.Video, as: 'Video' }, 'Title', order]];
            case 'updatedAt':
                return [[{ model: db.Video, as: 'Video' }, 'updatedAt', order]];
            case 'createdAt':
                return [[{ model: db.Video, as: 'Video' }, 'createdAt', order]];
            default:
                return [
                    [{ model: db.Video, as: 'Video' }, 'updatedAt', 'DESC'],
                ];
        }
    })();

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

    const totalVideos = videosJoin.count as number;
    const videosRaw = videosJoin.rows.map((pv: any) =>
        pv.Video?.get ? pv.Video.get({ plain: true }) : pv.Video,
    );

    // ---- 5) attach FULL release object to each video
    let videosWithRelease = videosRaw;

    const videoIds = videosRaw.map((v: any) => v.Video_Id);

    // 1) Video -> Release_Id (first match wins)
    const rvLinks: Array<{ Video_Id: number; Release_Id: number }> =
        await db.ReleaseVideo.findAll({
            where: { Video_Id: { [Op.in]: videoIds } },
            attributes: ['Video_Id', 'Release_Id'],
            raw: true,
        });

    const v2r = new Map<number, number>();
    const releaseIds = new Set<number>();
    for (const row of rvLinks) {
        if (!v2r.has(row.Video_Id)) {
            v2r.set(row.Video_Id, row.Release_Id);
            releaseIds.add(row.Release_Id);
        }
    }

    // 2) Fetch FULL releases for all collected releaseIds (NOT just Thumb)
    let releasesAllPlain: any[] = [];
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

        releasesAllPlain = releasesAll.map((r: any) =>
            r.get ? r.get({ plain: true }) : r,
        );
    }

    // 3) Map Release_Id -> full release object
    const r2release = new Map<number, any>();
    for (const r of releasesAllPlain) r2release.set(r.Release_Id, r);

    // 4) Attach Release_Id, Thumb (convenience), and full release object to each video
    videosWithRelease = videosRaw.map((v: any) => {
        const rid = v2r.get(v.Video_Id) ?? null;
        const releaseObj = rid ? r2release.get(rid) ?? null : null;

        return {
            ...v,
            Release_Id: rid, // keep for downstream paging logic on VinylShelf
            Thumb: releaseObj?.Thumb ?? null, // quick access
            release: releaseObj, // <-- full release object embedded
        };
    });

    // ---- 4) Paged RELEASES in the same order as the matching videos' Release_Id
    let releasesPaged: any[] = [];
    let releasesCount = 0;

    if (videosWithRelease.length) {
        // 1) Build an ordered list of Release_Id (drop nulls, dedupe but keep first occurrence)
        const releaseIdsOrdered: number[] = [];
        const seen = new Set<number>();
        for (const v of videosWithRelease) {
            const rid = v?.Release_Id;
            if (Number.isInteger(rid) && !seen.has(rid)) {
                seen.add(rid);
                releaseIdsOrdered.push(rid);
            }
        }

        releasesCount = releaseIdsOrdered.length;

        // 2) Page that ordered id list
        const sliceStart = relOffset;
        const sliceEnd = relOffset + relLimit;
        const pagedIds = releaseIdsOrdered.slice(sliceStart, sliceEnd);

        if (pagedIds.length) {
            // 3) Fetch only these releases (+ associations)
            const relRows = await db.Release.findAll({
                where: { Release_Id: { [Op.in]: pagedIds } },
                include: [
                    { model: db.Genre, through: { attributes: [] } },
                    { model: db.Style, through: { attributes: [] } },
                    { model: db.Artist, through: { attributes: [] } },
                    { model: db.Label, through: { attributes: [] } },
                ],
                // no order here — we'll reorder manually to match pagedIds
            });

            // 4) Reorder to match pagedIds
            const rank = new Map<number, number>();
            pagedIds.forEach((id, i) => rank.set(id, i));

            relRows.sort(
                (a: any, b: any) =>
                    (rank.get(a.Release_Id) ?? 0) -
                    (rank.get(b.Release_Id) ?? 0),
            );

            releasesPaged = relRows.map((r: any) =>
                r.get ? r.get({ plain: true }) : r,
            );
        }
    }

    // ---- 5) Shape response using rows-first helper

    // ---- enrich with formatted fields (playlist, videos, releases)
    const playlistPlain = playlistCore.get
        ? playlistCore.get({ plain: true })
        : playlistCore;
    const playlist = {
        ...playlistPlain,
        createdAtFormatted: formatDate(playlistPlain.createdAt, locale, tz),
        updatedAtFormatted: formatDate(playlistPlain.updatedAt, locale, tz),
    };

    const videosEnriched = videosWithRelease.map((v: any) => ({
        ...v,
        // lowercase aliases for frontend compatibility
        title: v.Title,
        uri: toYoutubeUrl(v.URI),
        createdAtFormatted: formatDate(v.createdAt, locale, tz),
        updatedAtFormatted: formatDate(v.updatedAt, locale, tz),
        durationFormatted: formatDuration(v.Duration),
    }));

    const releasesEnriched = releasesPaged.map((r: any) => ({
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

export const getVideo = async (req: Request) => {
    const uri = extractYouTubeVideoId(req.body.video.uri);
    return await db.Video.findOne({
        where: { URI: uri },
        raw: true,
    });
};

export const updateVideoPlayCount = async (req: Request, user: any) => {
    const { release_id } = req.params;
    const { uri, title, duration } = req.body;

    return db.sequelize.transaction(async (t: Transaction) => {
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
        const plainVideo = video.get(); // convert to pojo so video.update can be used on video model below

        await db.ReleaseVideo.findOrCreate({
            where: {
                Release_Id: release_id,
                Video_Id: plainVideo.Video_Id,
            },
            defaults: {
                Release_Id: release_id,
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

        // Optionally update Video metadata if it changed
        const updates: Record<string, any> = {};
        if (title && title !== video.Title) updates.Title = title;
        if (duration && duration !== video.Duration)
            updates.Duration = duration;
        if (Object.keys(updates).length) {
            await video.update(updates, { transaction: t });
        }

        return await video.get();
    });
};

export const syncData = async (
    model: string,
    data: any[],
    primaryKey?: string,
) => {
    if (primaryKey) {
        await db[model].destroy({
            where: {
                [primaryKey]: { [Op.notIn]: data.map(d => d[primaryKey]) },
            },
        });
    }

    return await db[model].bulkCreate(data, { ignoreDuplicates: true });
};

export const getUser = async (req: Request) => {
    // Pull both possible lookup values from query or params
    const email =
        (req.params.email as string) ||
        (req.query.email as string) ||
        undefined;
    const username =
        (req.params.username as string) ||
        (req.query.username as string) ||
        undefined;

    // Build an array of conditions—for each non-null field, push { field: value }
    const orConditions: Record<string, string>[] = [];
    if (email) orConditions.push({ Email: email });
    if (username) orConditions.push({ Username: username });

    // Find a user matching any of those conditions
    const userEntry = await db.User.findOne({
        where: {
            [Op.or]: orConditions,
        },
    });

    return userEntry?.get();
};

export const getCollection = async (req: Request) => {
    try {
        const { page, limit, offset, order, orderBy } = parsePaging(req, {
            defaultLimit: 25,
            maxLimit: 100,
            defaultOrderBy: 'Date_Added',
            allowedOrderBy: {
                Release_Id: 'Release_Id',
                Date_Added: 'Date_Added',
                Title: 'Title',
                Year: 'Year',
                // updatedAt: 'updatedAt',
                // createdAt: 'createdAt',
            },
            defaultOrder: 'DESC',
        });

        const { username } = req.params;
        const genresQ = parseStringList(req.query.genre);
        const stylesQ = parseStringList(req.query.style);

        // Fetch the user and their collections
        const user = await db.User.findOne({
            where: { Username: username },
            include: [{ model: db.Collection }],
        });

        const releaseWhere: any = {};
        if (req.query.releaseId) releaseWhere.Release_Id = req.query.releaseId;

        // Fetch releases with pagination and optional genre and style filtering
        const { count, rows } = await db.Release.findAndCountAll({
            distinct: true, // Prevent duplicates
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
                        where: {
                            Name: { [Op.in]: genresQ }, // Filter by an array of genres
                        },
                        required: true,
                    }),
                    attributes: ['Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Style,
                    ...(stylesQ?.length && {
                        where: {
                            Name: { [Op.in]: stylesQ }, // Filter by an array of styles
                        },
                        required: true,
                    }),
                    attributes: ['Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Artist,
                    ...(req.query.artistId && {
                        where: {
                            Artist_Id: { [Op.in]: [req.query.artistId] },
                        },
                    }),
                    attributes: ['Artist_Id', 'Name'],
                    through: { attributes: [] },
                },
                {
                    model: db.Label,
                    ...(req.query.labelId && {
                        where: {
                            Label_Id: { [Op.in]: [req.query.labelId] },
                        },
                    }),
                    attributes: ['Label_Id', 'Name', 'Cat_No'],
                    through: { attributes: [] },
                },
            ],
            offset: offset,
            limit: limit,
            order: [[orderBy, order]],
        });

        return toPagedResponse(
            count,
            page,
            limit,
            rows.map((r: any) => r.get({ plain: true })),
        );
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
};

export const getPlaylists = async (req: Request, user: any) => {
    const { page, limit, offset, order, orderBy } = parsePaging(req, {
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

    // allow client to control formatting
    const locale = (req.query.locale as string) || 'en-US';
    const tz = (req.query.tz as string) || undefined;

    const { count, rows } = await db.Playlist.findAndCountAll({
        where: { User_Id: user.User_Id },
        order: [
            [orderBy, order],
            ['updatedAt', 'DESC'], // stable tie-breaker
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
            through: { attributes: [] }, // hide join table fields
            eparate: true,
            order: [['updatedAt', 'DESC']],
        },
    });

    const items = rows.map((r: any) => {
        const p = r.get({ plain: true });
        return {
            ...p,
            createdAtFormatted: formatDate(p.createdAt, locale, tz),
            updatedAtFormatted: formatDate(p.updatedAt, locale, tz),
            Videos: (p.Videos ?? []).map((v: any) => ({
                ...v,
                createdAtFormatted: formatDate(v.createdAt, locale, tz),
                updatedAtFormatted: formatDate(v.updatedAt, locale, tz),
                durationFormatted: formatDuration(v.Duration),
            })),
        };
    });

    return toPagedResponse(count, page, limit, items);
};

export const getStylesByGenre = async (req: Request) => {
    try {
        const { genre } = req.params;
        // Ensure the genre name is provided
        if (!genre) {
            throw new Error('Genre name is required');
        }

        // Query styles linked to the given genre
        const styles = await db.Style.findAll({
            include: [
                {
                    model: db.Release, // Link through releases
                    include: [
                        {
                            model: db.Genre,
                            where: { Name: genre }, // Filter by genre name
                            through: { attributes: [] }, // Exclude join table attributes
                        },
                    ],
                    through: { attributes: [] }, // Exclude join table attributes
                },
            ],
        });

        return styles;
    } catch (error) {
        console.error('Error fetching styles by genre:', error);
        throw error;
    }
};

export const search = async (req: Request) => {
    const { searchQuery, type } = req.query;
    const { username } = req.params;

    const ilikeWildcard = `%${searchQuery}%`;

    // Filter by username added to each query (assumes each table has a `username` field)
    if (type === undefined) {
        const [releases, artists, labels] = await Promise.all([
            db.Release.findAll({
                where: {
                    Title: { [Op.iLike]: ilikeWildcard },
                },
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
                where: {
                    Name: { [Op.iLike]: ilikeWildcard },
                },
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
                where: {
                    Name: { [Op.iLike]: ilikeWildcard },
                },
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

        // flatten and normalize response
        return [
            ...releases.map((r: any) => ({ ...r.toJSON(), type: 'release' })),
            ...artists.map((a: any) => ({ ...a.toJSON(), type: 'artist' })),
            ...labels.map((l: any) => ({ ...l.toJSON(), type: 'label' })),
        ];
    }

    if (type === 'artist') {
        return db.Artist.findAll({
            where: {
                Name: { [Op.iLike]: ilikeWildcard },
            },
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
        });
    }

    if (type === 'release') {
        return db.Release.findAll({
            where: {
                Title: { [Op.iLike]: ilikeWildcard },
            },
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
        });
    }

    if (type === 'label') {
        return db.Label.findAll({
            where: {
                Name: { [Op.iLike]: ilikeWildcard },
            },
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
        });
    }

    return [];
};

export const addToPlaylist = async (req: Request) => {
    const { playlistId, uri } = req.body;
    const extractedUri = extractYouTubeVideoId(uri);

    return db.sequelize.transaction(async (t: Transaction) => {
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
            added: created, // false if it already existed
            playlistId: playlistId,
            playlistVideo: playlistVideo.get({ plain: true }),
            video: video.get ? video.get({ plain: true }) : video,
        };
    });
};

type ExplorerRow = { Name: string; Year?: string };

const parseStringList = (input: any): string[] | null => {
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

type NameRow = { Name: string };
type YearRow = { Year: number | string };

export const getExplorer = async (req: Request) => {
    const { username } = req.params;
    const genresQ = parseStringList(req.query.genre); // e.g. ['Electronic']

    // 1) Fetch user + their collection id first
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

    // Build the nested includes we'll reuse (optionally constrain by Genre)
    const releaseNestedIncludes: any[] = [
        {
            model: db.Collection,
            attributes: [],
            required: true,
            through: { attributes: [] },
            where: whereCollection,
        },
    ];

    if (genresQ?.length) {
        releaseNestedIncludes.push({
            model: db.Genre,
            attributes: [],
            required: true, // only releases that have these genres
            through: { attributes: [] },
            where: { Name: { [Op.in]: genresQ } },
        });
    }

    // 2) DISTINCT Years for releases in the user's collection (optionally filtered by genresQ)
    const years = (await db.Release.findAll({
        attributes: ['Year'], // 👈 only the grouped column
        where: { Year: { [Op.not]: null } }, // optional: skip null years
        include: releaseNestedIncludes,
        group: ['Release.Year'],
        order: [['Year', 'ASC']],
        raw: true,
    })) as YearRow[];

    // 3) DISTINCT Genres for releases in the user's collection
    const genres = (await db.Genre.findAll({
        attributes: ['Name'],
        include: [
            {
                model: db.Release,
                attributes: [],
                required: true, // inner join
                through: { attributes: [] },
                include: [
                    {
                        model: db.Collection,
                        attributes: [],
                        required: true,
                        through: { attributes: [] },
                        where: whereCollection,
                    },
                ],
            },
        ],
        group: ['Genre.Name'],
        order: [['Name', 'ASC']],
        raw: true,
    })) as NameRow[];

    // 4) DISTINCT Styles (optionally filtered by genresQ)
    const styles = (await db.Style.findAll({
        attributes: ['Name'],
        include: [
            {
                model: db.Release,
                attributes: [],
                required: true,
                through: { attributes: [] },
                include: releaseNestedIncludes, // 👈 same conditional genre filter
            },
        ],
        group: ['Style.Name'],
        order: [['Name', 'ASC']],
        raw: true,
    })) as NameRow[];

    return {
        Years: years.map(y => y.Year),
        Genres: genres.map(g => g.Name),
        Styles: styles.map(s => s.Name),
    };
};
