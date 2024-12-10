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
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 25;
        const offset = (page - 1) * limit;

        // Extract order query parameters and sanitize them
        const order =
            (req.query.order as string)?.toUpperCase() === 'ASC'
                ? 'ASC'
                : 'DESC';
        const orderBy = (req.query.orderBy as string) || 'Release_Id';

        // Validate that `orderBy` is a valid column in the Release table
        const validOrderColumns = ['Release_Id', 'Date_Added', 'Title', 'Year'];
        if (!validOrderColumns.includes(orderBy)) {
            throw new Error(`Invalid orderBy column: ${orderBy}`);
        }

        // Find the user and their collections
        const user = await db.User.findOne({
            where: { Username: username },
            include: [
                {
                    model: db.Collection,
                    include: [
                        {
                            model: db.Release, // Include releases through the join table
                        },
                    ],
                },
            ],
        });

        // Find releases with pagination and ordering through ReleaseCollection
        const releases = await db.Release.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: db.Collection,
                    where: {
                        Collection_Id: user.Collection.Collection_Id,
                    },
                    through: { attributes: [] }, // Exclude attributes from the join table
                },
                {
                    model: db.Artist,
                },
                {
                    model: db.Label,
                },
                {
                    model: db.Genre,
                },
                {
                    model: db.Style,
                },
            ],
            offset: offset,
            limit: limit,
            order: [[orderBy, order]],
        });

        return {
            user: {
                username: user.Username,
            },
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
