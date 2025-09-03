const db = require('../models');
import { Request } from 'express';
import { Op } from 'sequelize';
import { Transaction } from 'sequelize';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';

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

export const createPlaylist = async (req: Request, user: any, video?: any) => {
    const [playlist, created] = await db.Playlist.create({
        User_Id: user.User_Id,
        Name: req.body.name,
        Description: req.body.Description ?? null,
    });
    return { playlist, created };
};

export const addVideoToPlaylist = async (
    req: Request,
    user: any,
    video: any,
) => {};

export const updatePlaylistMeta = async () => {};

export const getPlayist = async (req: Request, user: any) => {};

export const getAllPlaylists = async (req: Request, user: any) => {};

export const updateVideoPlayCount = async (req: Request, user: any) => {
    const { release_id } = req.params;
    const { uri, title, duration } = req.body;

    return db.sequelize.transaction(async (t: Transaction) => {
        // Normalize URI (YouTube videoId preferred)
        const extractedUri = extractYouTubeVideoId(uri);

        // Ensure Video exists
        const [video] = await db.Video.findOrCreate({
            where: { URI: extractedUri },
            defaults: {
                URI: extractedUri,
                Title: title,
                Duration: duration,
            },
            transaction: t,
        });
        const plainVideo = video.get(); // extract plain object

        // Ensure ReleaseVideo join exists
        let releaseVideo = null;
        if (release_id) {
            const [rv] = await db.ReleaseVideo.findOrCreate({
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
            releaseVideo = rv;
        }

        // Ensure UserVideo join exists
        const [uv] = await db.UserVideo.findOrCreate({
            where: { User_Id: user.User_Id, Video_Id: video.Video_Id },
            defaults: {
                User_Id: user.User_Id,
                Video_Id: video.Video_Id,
                Play_Count: 0,
            },
            transaction: t,
        });

        // Increment user-specific Play_Count
        await uv.increment('Play_Count', { by: 1, transaction: t });

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
        const { username, genre, style } = req.params;

        // Resolve single or multiple genres and styles
        const resolvedGenres =
            genre && genre !== ':genre' ? genre.split(',') : null;
        const resolvedStyles =
            style && style !== ':style' ? style.split(',') : null;

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 25;
        const offset = (page - 1) * limit;

        // Extract and sanitize order query parameters
        const order =
            (req.query.order as string)?.toUpperCase() === 'ASC'
                ? 'ASC'
                : 'DESC';
        const orderBy = (req.query.orderBy as string) || 'Release_Id';

        // Validate the `orderBy` column
        const validOrderColumns = ['Release_Id', 'Date_Added', 'Title', 'Year'];
        if (!validOrderColumns.includes(orderBy)) {
            throw new Error(`Invalid orderBy column: ${orderBy}`);
        }

        // Fetch the user and their collections
        const user = await db.User.findOne({
            where: { Username: username },
            include: [{ model: db.Collection }],
        });

        const releaseWhere: any = {};
        if (req.query.releaseId) releaseWhere.Release_Id = req.query.releaseId;

        // Fetch releases with pagination and optional genre and style filtering
        const releases = await db.Release.findAndCountAll({
            distinct: true, // Prevent duplicates
            where: releaseWhere,
            include: [
                {
                    model: db.Collection,
                    where: {
                        Collection_Id: user.Collection.Collection_Id,
                    },
                    through: { attributes: [] },
                },
                {
                    model: db.Genre,
                    ...(resolvedGenres && {
                        where: {
                            Name: { [Op.in]: resolvedGenres }, // Filter by an array of genres
                        },
                        required: true,
                    }),
                    through: { attributes: [] },
                },
                {
                    model: db.Style,
                    ...(resolvedStyles && {
                        where: {
                            Name: { [Op.in]: resolvedStyles }, // Filter by an array of styles
                        },
                        required: true,
                    }),
                    through: { attributes: [] },
                },
                {
                    model: db.Artist,
                    ...(req.query.artistId && {
                        where: {
                            Artist_Id: { [Op.in]: [req.query.artistId] },
                        },
                    }),
                    through: { attributes: [] },
                },
                {
                    model: db.Label,
                    ...(req.query.labelId && {
                        where: {
                            Label_Id: { [Op.in]: [req.query.labelId] },
                        },
                    }),
                    through: { attributes: [] },
                },
            ],
            offset: offset,
            limit: limit,
            order: [[orderBy, order]],
        });

        return {
            user: { username },
            totalReleases: releases.count,
            currentPage: page,
            totalPages: Math.ceil(releases.count / limit),
            releases: releases.rows,
        };
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
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
