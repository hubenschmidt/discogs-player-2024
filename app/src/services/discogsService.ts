import { Request } from 'express';
import discogsClient from '../lib/discogsClient';
import { createUser, createCollection, syncReleases, syncArtists, syncGenres, syncStyles } from '../repositories';

export const syncCollection = async (req: Request) => {
    const collection = await fetchCollection(req);
    const [user, userCreated] = await createUser(req.params.username);
    const [userCollection, collectionCreated] = await createCollection(user.User_Id);

    const releases = collection.map((item: any) => ({
        Release_Id: item.id,
        Title: item.basic_information.title,
        Year: item.basic_information.year,
        Thumb: item.basic_information.thumb,
        Cover_Image: item.basic_information.cover_image,
        Date_Added: item.date_added,
    }));
    const releasesSynced = await syncReleases(releases);

    const artists = collection.flatMap((item: any) =>
        item.basic_information.artists.map((artist: any) => ({
            Artist_Id: artist.id,
            Name: artist.name,
            Release_Id: item.id,
        })),
    );
    const artistsSynced = await syncArtists(artists);

    const genres = collection.flatMap((item: any) =>
        item.basic_information.genres.map((genre: any) => ({
            Name: genre,
            Release_Id: item.id,
        })),
    );
    const genresSynced = await syncGenres(genres);

    const styles = collection.flatMap((item: any) =>
        item.basic_information.styles.map((style: any) => ({
            Name: style,
            Release_Id: item.id,
        })),
    );
    const stylesSynced = await syncStyles(styles);

    return {
        user: {
            username: req.params.username,
            created: userCreated,
        },
        collection: {
            created: collectionCreated,
        },
        synced: {
            releases: releasesSynced.length,
            artists: artistsSynced.length,
            genres: genresSynced.length,
            styles: stylesSynced.length,
        },
    };
};

export const fetchCollection = async (req: Request) => {
    const folderId = 0; // Use default folder
    const perPage = 150;
    const endpoint = `users/${req.params.username}/collection/folders/${folderId}/releases`;

    // Fetch the first page to get total pages and initial data
    const firstResponse = await discogsClient(`${endpoint}?page=1&per_page=${perPage}`, 'get', null);
    const { pages: totalPages } = firstResponse.data.pagination;

    // Start with the first page's releases
    let collection = firstResponse.data.releases;

    // Generate promises for the remaining pages
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(discogsClient(`${endpoint}?page=${page}&per_page=${perPage}`, 'get', null));
    }

    // Fetch all pages in parallel
    const responses = await Promise.all(pagePromises);

    // Concatenate all releases from the responses
    responses.forEach(({ data }) => {
        collection = collection.concat(data.releases);
    });

    return collection;
};

export const fetchUser = async (req: Request) => {
    const endpoint = `users/${req.params.username}`;
    const user = await discogsClient(endpoint, 'get', null);
    return user;
};

export const fetchRelease = async (req: Request) => {
    const endpoint = `releases/${req.params.release_id}`;
    const release = await discogsClient(endpoint, 'get', null);
    return release;
};
