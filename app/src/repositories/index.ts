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
    return db.Release.bulkCreate(releases, {
        ignoreDuplicates: true, // Prevents error for existing records
    });
};

export const syncArtists = async (artists: any[]) => {
    return db.Artist.bulkCreate(artists, {
        ignoreDuplicates: true, // Prevents error for existing records
    });
};

export const syncGenres = async (genres: any[]) => {
    return db.Genre.bulkCreate(genres, {
        ignoreDuplicates: true, // Prevents error for existing records
    });
};

export const syncStyles = async (styles: any[]) => {
    return db.Style.bulkCreate(styles, {
        ignoreDuplicates: true, // Prevents error for existing records
    });
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
