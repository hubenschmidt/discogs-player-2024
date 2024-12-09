import { Request, Response, NextFunction } from 'express';
import discogsClient from '../lib/discogsClient';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const endpoint = `/users/${req.params.username}`;
        const user = await discogsClient(endpoint, 'get', null);
        res.status(200).json(user.data);
    } catch (error) {
        console.error(`Error getting user ${req.params.username}:`, error);
        next(error);
    }
};

export const getCollection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const folderId = 0; // Use default folder
        const perPage = 100; // Max items per page according to Discogs API
        const endpoint = `users/${req.params.username}/collection/folders/${folderId}/releases`;

        // Fetch the first page to get total pages and initial data
        const firstResponse = await discogsClient(`${endpoint}?page=1&per_page=${perPage}`, 'get', null);
        const { pages: totalPages } = firstResponse.data.pagination;

        // Start with the first page's releases
        let allRecords = firstResponse.data.releases;

        // Generate promises for the remaining pages
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
            pagePromises.push(discogsClient(`${endpoint}?page=${page}&per_page=${perPage}`, 'get', null));
        }

        // Fetch all pages in parallel
        const responses = await Promise.all(pagePromises);

        // Concatenate all releases from the responses
        responses.forEach(({ data }) => {
            allRecords = allRecords.concat(data.releases);
        });

        console.log(`Fetched ${allRecords.length} records from collection.`);
        res.status(200).json(allRecords);
    } catch (error) {
        console.error('Error getting record collection:', error);
        next(error);
    }
};

export const getRelease = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const endpoint = `releases/${req.params.release_id}`;
        const release = await discogsClient(endpoint, 'get', null);
        res.status(200).json(release.data);
    } catch (error) {
        console.error('Error fetching release:', error);
        next(error);
    }
};
