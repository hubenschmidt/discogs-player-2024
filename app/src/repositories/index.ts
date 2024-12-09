import { Request } from 'express';
const db = require('../models');

const syncData = async (model: any, data: any[]) => {
    const synced = await model.bulkCreate(data, { ignoreDuplicates: true });
    const newRecords = synced.filter((entity: any) => entity.isNewRecord).length;

    return {
        totalRecords: synced.length,
        newRecords,
    };
};

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

export const syncReleases = async (releases: any[]) => {
    return syncData(db.Release, releases);
};

export const syncArtists = async (artists: any[]) => {
    return syncData(db.Artist, artists);
};

export const syncGenres = async (genres: any[]) => {
    return syncData(db.Genre, genres);
};

export const syncStyles = async (styles: any[]) => {
    return syncData(db.Style, styles);
};

export const getCollection = async (req: Request) => {
    const userId = req.params.userId; // Assuming you have the user ID in the request params

    try {
        // Fetch the user's collection along with related releases and their associated data
        const collections = await db.Collection.findAll({
            where: { User_Id: userId },
            include: [
                {
                    model: db.Release,
                    through: { attributes: [] }, // Exclude junction table details
                    include: [
                        { model: db.Artist, attributes: ['Name'] },
                        { model: db.Genre, attributes: ['Name'] },
                        { model: db.Style, attributes: ['Name'] },
                    ],
                },
            ],
        });

        return collections;
    } catch (error) {
        console.error('Error fetching collection:', error);
        throw error;
    }
};
