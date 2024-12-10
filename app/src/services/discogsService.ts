import { Request } from 'express';
import discogsClient from '../lib/discogsClient';
import {
    createUser,
    createCollection,
    syncReleaseArtists,
    syncLabels,
    syncReleaseLabels,
    syncGenres,
    syncStyles,
    syncData,
} from '../repositories';
const db = require('../models');

export const syncCollection = async (req: Request) => {
    const discogsCol = await fetchCollection(req);

    // Fetch or create user and collection
    const [user, userCreated] = await createUser(req.params.username);
    const [collection, collectionCreated] = await createCollection(
        user.User_Id,
    );

    const releasesSynced = await syncData(
        db.Release,
        discogsCol.map((el: any) => ({
            Release_Id: el.id,
            Title: el.basic_information.title,
            Year: el.basic_information.year,
            Thumb: el.basic_information.thumb,
            Cover_Image: el.basic_information.cover_image,
            Date_Added: el.date_added,
            Collection_Id: collection.Collection_Id,
        })),
    );

    // Sync artists
    const artistsPromise = syncData(
        db.Artist,
        discogsCol.flatMap((el: any) =>
            el.basic_information.artists.map((artist: any) => ({
                Artist_Id: artist.id,
                Name: artist.name,
            })),
        ),
    );

    // Sync Release-Artist associations
    const releaseArtistsPromise = syncReleaseArtists(
        discogsCol.flatMap((el: any) =>
            el.basic_information.artists.map((artist: any) => ({
                Release_Id: el.id,
                Artist_Id: artist.id,
            })),
        ),
    );

    // Prepare and sync other data
    const labelsPromise = syncLabels(
        discogsCol.flatMap((el: any) =>
            el.basic_information.labels.map((label: any) => ({
                Label_Id: label.id,
                Name: label.name,
                Cat_No: label.catno,
            })),
        ),
    );

    const releaselabelsPromise = syncReleaseLabels(
        discogsCol.flatMap((el: any) =>
            el.basic_information.labels.map((label: any) => ({
                Release_Id: el.id,
                Label_Id: label.id,
            })),
        ),
    );

    const genresPromise = syncGenres(
        discogsCol.flatMap((el: any) =>
            el.basic_information.genres.map((genre: any) => ({
                Name: genre,
            })),
        ),
    );

    const stylesPromise = syncStyles(
        discogsCol.flatMap((el: any) =>
            el.basic_information.styles.map((style: any) => ({
                Name: style,
            })),
        ),
    );

    // Await all dependent tasks to complete
    const [
        artistsSynced,
        releaseArtistsSynced,
        labelsSynced,
        releaseLabelsSynced,
        genresSynced,
        stylesSynced,
    ] = await Promise.all([
        artistsPromise,
        releaseArtistsPromise,
        labelsPromise,
        releaselabelsPromise,
        genresPromise,
        stylesPromise,
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
            releases: releasesSynced.length,
            artists: artistsSynced.length,
            releaseArtists: releaseArtistsSynced.length,
            labels: labelsSynced.length,
            releaseLabels: releaseLabelsSynced.length,
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
    const firstResponse = await discogsClient(
        `${endpoint}?page=1&per_page=${perPage}`,
        'get',
        null,
    );
    const { pages: totalPages } = firstResponse.data.pagination;

    // Start with the first page's releases
    let collection = firstResponse.data.releases;

    // Generate promises for the remaining pages
    const pagePromises = [];
    for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
            discogsClient(
                `${endpoint}?page=${page}&per_page=${perPage}`,
                'get',
                null,
            ),
        );
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
