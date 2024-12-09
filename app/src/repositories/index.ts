const db = require('../models');

export const createUser = async (username: string) => {
    const user = await db.User.findOrCreate({
        where: { Username: username },
        defaults: { Username: username },
    });
    return user;
};

export const createCollection = async (userId: number) => {
    return db.Collection.findOrCreate({
        where: { User_Id: userId },
        defaults: { User_Id: userId },
    });
};

export const syncReleases = async (releases: any[]) => {
    const syncedReleases = await db.Release.bulkCreate(releases, {
        ignoreDuplicates: true, // Prevent updating existing records
    });

    // Count new records (where isNewRecord is true)
    const newRecords = syncedReleases.filter((release: any) => release.isNewRecord).length;

    return {
        totalRecords: syncedReleases.length,
        newRecords,
    };
};

export const syncArtists = async (artists: any[]) => {
    const syncedArtists = await db.Artist.bulkCreate(artists, {
        ignoreDuplicates: true,
    });

    const newRecords = syncedArtists.filter((artist: any) => artist.isNewRecord).length;

    return {
        totalRecords: syncedArtists.length,
        newRecords,
    };
};
export const syncGenres = async (genres: any[]) => {
    const syncedGenres = await db.Genre.bulkCreate(genres, {
        ignoreDuplicates: true,
    });

    const newRecords = syncedGenres.filter((artist: any) => artist.isNewRecord).length;

    return {
        totalRecords: syncedGenres.length,
        newRecords,
    };
};

export const syncStyles = async (styles: any[]) => {
    const syncedStyles = await db.Style.bulkCreate(styles, {
        ignoreDuplicates: true, // Prevents error for existing records
    });

    const newRecords = syncedStyles.filter((artist: any) => artist.isNewRecord).length;

    return {
        totalRecords: syncedStyles.length,
        newRecords,
    };
};

// create User if not exists

// create Collection if not exists

// bulkCreate Releases.. this should be a bulk upsert, only creating the record if it doesnt already exist

// bulkCreate Artists.. this should be a bulk upsert

// bulkCreate Genres.. this should be a bulk upsert

// bulkCreate Styles.. this should be a bulk upsert

// [
//     {
//         "id": 26560,
//         "instance_id": 283636043,
//         "date_added": "2018-03-02T18:28:58-08:00",
//         "rating": 0,
//         "basic_information": {
//             "id": 26560,
//             "master_id": 23050,
//             "master_url": "https://api.discogs.com/masters/23050",
//             "resource_url": "https://api.discogs.com/releases/26560",
//             "thumb": "https://i.discogs.com/hRjeg1z3yUtD1oB8GeFU7qqCoHjbmU85gd88JZXn578/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI2NTYw/LTEyNTkwNDEwNTIu/anBlZw.jpeg",
//             "cover_image": "https://i.discogs.com/sC-51ZWi4zIShFHX4QKfvsajskLhBW61-0CrhHJVP2k/rs:fit/g:sm/q:90/h:600/w:600/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTI2NTYw/LTEyNTkwNDEwNTIu/anBlZw.jpeg",
//             "title": "X-Mix (Jack The Box - The Tracks)",
//             "year": 1998,
//             "formats": [
//                 {
//                     "name": "Vinyl",
//                     "qty": "2",
//                     "descriptions": [
//                         "LP",
//                         "Compilation"
//                     ]
//                 }
//             ],
//             "artists": [
//                 {
//                     "name": "Hardfloor",
//                     "anv": "",
//                     "join": "",
//                     "role": "",
//                     "tracks": "",
//                     "id": 858,
//                     "resource_url": "https://api.discogs.com/artists/858"
//                 }
//             ],
//             "labels": [
//                 {
//                     "name": "!K7",
//                     "catno": "!K7068LP",
//                     "entity_type": "1",
//                     "entity_type_name": "Label",
//                     "id": 30192,
//                     "resource_url": "https://api.discogs.com/labels/30192"
//                 }
//             ],
//             "genres": [
//                 "Electronic"
//             ],
//             "styles": [
//                 "Acid House",
//                 "Techno",
//                 "Acid"
//             ]
//         },
//         "folder_id": 1
//     },
// ]
