const db = require('../models');

const syncEntities = async (model: any, entities: any[]) => {
    const synced = await model.bulkCreate(entities, { ignoreDuplicates: true });
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
    return syncEntities(db.Release, releases);
};

export const syncArtists = async (artists: any[]) => {
    return syncEntities(db.Artist, artists);
};

export const syncGenres = async (genres: any[]) => {
    return syncEntities(db.Genre, genres);
};

export const syncStyles = async (styles: any[]) => {
    return syncEntities(db.Style, styles);
};
