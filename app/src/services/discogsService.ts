import { Request } from 'express';
import discogsClient from '../lib/discogsClient';
import { createUser, createCollection, syncReleases, syncArtists, syncGenres, syncStyles } from '../repositories';

export const syncCollection = async (req: Request) => {
    const collection = await getCollection(req);
    const [user, userCreated] = await createUser(req.params.username);
    const [userCollection, collectionCreated] = await createCollection(user.User_Id);

    const extractData = (key: string, transformFn: (data: any, item: any) => any) =>
        collection.flatMap((item: any) =>
            (item.basic_information[key] || []).map((data: any) => transformFn(data, item)),
        );

    const releases = collection.map((item: any) => ({
        Release_Id: item.id,
        Title: item.basic_information.title,
        Year: item.basic_information.year,
        Thumb: item.basic_information.thumb,
        Cover_Image: item.basic_information.cover_image,
        Date_Added: item.date_added,
    }));

    const artists = extractData('artists', (artist: any, item: any) => ({
        Artist_Id: artist.id,
        Name: artist.name,
        Release_Id: item.id,
    }));

    const genres = extractData('genres', (genre: string, item: any) => ({
        Name: genre,
        Release_Id: item.id,
    }));

    const styles = extractData('styles', (style: string, item: any) => ({
        Name: style,
        Release_Id: item.id,
    }));

    const [releasesSynced, artistsSynced, genresSynced, stylesSynced] = await Promise.all([
        syncReleases(releases),
        syncArtists(artists),
        syncGenres(genres),
        syncStyles(styles),
    ]);

    return {
        user: {
            username: req.params.username,
            created: userCreated,
        },
        collection: {
            created: collectionCreated,
        },
        synced: {
            releases: releasesSynced,
            artists: artistsSynced,
            genres: genresSynced,
            styles: stylesSynced,
        },
    };
};

export const getCollection = async (req: Request) => {
    const folderId = 0; // Use default folder
    const perPage = 150;
    const endpoint = `users/${req.params.username}/collection/folders/${folderId}/releases`;

    const firstResponse = await discogsClient(`${endpoint}?page=1&per_page=${perPage}`, 'get', null);
    const { pages: totalPages } = firstResponse.data.pagination;

    let collection = firstResponse.data.releases;

    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(discogsClient(`${endpoint}?page=${page}&per_page=${perPage}`, 'get', null));
    }

    const responses = await Promise.all(pagePromises); // fetch all pages in parallel

    responses.forEach(({ data }) => {
        collection = collection.concat(data.releases);
    });

    return collection;
};

export const getUser = async (req: Request) => {
    const endpoint = `users/${req.params.username}`;
    const user = await discogsClient(endpoint, 'get', null);
    return user;
};

export const getRelease = async (req: Request) => {
    const endpoint = `releases/${req.params.release_id}`;
    const release = await discogsClient(endpoint, 'get', null);
    return release;
};
