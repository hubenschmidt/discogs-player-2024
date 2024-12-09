import { Request } from 'express';
import discogsClient from '../lib/discogsClient';

export const getUser = async (req: Request) => {
    console.log('getUser called in services');
    const endpoint = `users/${req.params.username}`;
    const user = await discogsClient(endpoint, 'get', null);
    return user;
};

export const getCollection = async (req: Request) => {
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

export const getRelease = async (req: Request) => {
    const endpoint = `releases/${req.params.release_id}`;
    const release = await discogsClient(endpoint, 'get', null);
    return release;
};
