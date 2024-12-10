import { Request } from 'express';
const db = require('../models');

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

const syncData = async (model: any, data: any[]) => {
    return await model.bulkCreate(data, { ignoreDuplicates: true });
};

export const syncReleases = async (releases: any[]) => {
    return syncData(db.Release, releases);
};

export const syncArtists = async (artists: any[]) => {
    return syncData(db.Artist, artists);
};

export const syncLabels = async (labels: any[]) => {
    return syncData(db.Label, labels);
};

export const syncGenres = async (genres: any[]) => {
    return syncData(db.Genre, genres);
};

export const syncStyles = async (styles: any[]) => {
    return syncData(db.Style, styles);
};

export const getCollection = async (req: Request) => {
    try {
        const username = req.params.username;
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
        const offset = (page - 1) * limit;

        // Extract order query parameters and sanitize them
        const order = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'; // Default to DESC
        const orderBy = (req.query.orderBy as string) || 'Release_Id'; // Default column is 'Release_Id'

        // Validate that `orderBy` is a valid column in the Release table
        const validOrderColumns = ['Release_Id', 'Date_Added', 'Title', 'Year'];
        if (!validOrderColumns.includes(orderBy)) {
            throw new Error(`Invalid orderBy column: ${orderBy}`);
        }

        // Find user and their collection
        const user = await db.User.findOne({
            where: { Username: username },
            include: [
                {
                    model: db.Collection,
                },
            ],
        });

        if (!user || !user.Collection) {
            throw new Error(`User or Collection not found for username: ${username}`);
        }

        // Find releases with pagination and ordering, including genres and styles
        const releases = await db.Release.findAndCountAll({
            where: {
                Collection_Id: user.Collection.Collection_Id,
            },
            offset: offset,
            limit: limit,
            order: [[orderBy, order]],
            include: [
                {
                    model: db.Artist,
                    order: [['Name', 'DESC']],
                },
                {
                    model: db.Label,
                    order: [['Name', 'DESC']],
                },
                {
                    model: db.Genre,
                    order: [['Name', 'DESC']],
                },
                {
                    model: db.Style,
                    order: [['Name', 'DESC']],
                },
            ],
        });

        return {
            user: {
                username: user.Username,
            },
            totalReleases: releases.count,
            currentPage: page,
            totalPages: Math.ceil(releases.count / limit),
            releases: releases,
        };
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
};
