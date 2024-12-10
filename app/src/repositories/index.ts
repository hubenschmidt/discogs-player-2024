const db = require('../models');
import { Request } from 'express';

export const createUser = async (username: string) => {
    return await db.User.findOrCreate({
        where: { Username: username },
        defaults: { Username: username },
    });
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

export const getCollection = async (req: Request) => {
    try {
        const { username, genre, style } = req.params;
        const resolvedGenre = genre && genre !== ':genre' ? genre : null;
        const resolvedStyle = style && style !== ':style' ? style : null;
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

        // Fetch releases with pagination and optional genre filtering
        const releases = await db.Release.findAndCountAll({
            distinct: true, // Prevent duplicates
            include: [
                {
                    model: db.Collection,
                    where: { Collection_Id: user.Collection.Collection_Id }, // Filter by user's collection
                    through: { attributes: [] }, // Exclude join table attributes
                },
                {
                    model: db.Genre,
                    ...(resolvedGenre && {
                        where: {
                            Name: genre,
                        },
                        required: true, // Include only releases with the specified genre
                    }),
                    through: { attributes: [] }, // Exclude join table attributes
                },
                {
                    model: db.Style,
                    ...(resolvedStyle && {
                        where: {
                            Name: style,
                        },
                        required: true, // Include only releases with the specified genre
                    }),
                    through: { attributes: [] }, // Exclude join table attributes
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
