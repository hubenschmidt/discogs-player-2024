const db = require('../models');
import { Request } from 'express';
import { Op } from 'sequelize';

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

export const syncData = async (model: string, data: any[]) => {
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

    return userEntry;
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

        // Fetch releases with pagination and optional genre and style filtering
        const releases = await db.Release.findAndCountAll({
            distinct: true, // Prevent duplicates
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
                    through: { attributes: [] },
                },
                {
                    model: db.Label,
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
        return { releases, artists, labels };
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
