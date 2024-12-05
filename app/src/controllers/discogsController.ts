import { makeDiscogsApiCall } from '../lib/oauth';

export const fetchRecordCollection = async (username: string, folderId: number = 0): Promise<any[]> => {
    const endpoint = `/users/${username}/collection/folders/${folderId}/releases`;
    let page = 1;
    const perPage = 50; // Max per-page value for Discogs API
    let allRecords: any[] = [];
    let totalPages = 1;

    try {
        do {
            const params = { page, per_page: perPage };
            const response = await makeDiscogsApiCall(endpoint, params);

            // Add the current page of records to the collection
            allRecords = allRecords.concat(response.releases);

            // Update pagination info
            totalPages = response.pagination.pages;
            page += 1;
        } while (page <= totalPages);

        console.log(`Fetched ${allRecords.length} records from collection.`);
        return allRecords;
    } catch (error) {
        console.error('Error fetching record collection:', error);
        throw error;
    }
};

/**
 * Fetch a single record by its release ID and include linked videos.
 * @param releaseId - The ID of the release to fetch.
 * @returns The release details, including linked videos.
 */
export const fetchOneRecordWithLinkedVideos = async (releaseId: number): Promise<any> => {
    const endpoint = `/releases/${releaseId}`;

    try {
        const recordDetails = await makeDiscogsApiCall(endpoint);
        console.log(`Fetched details for release ID ${releaseId}:`, recordDetails);

        // Filter the videos if needed (e.g., return only YouTube links)
        const videos = recordDetails.videos || [];
        const filteredVideos = videos.filter((video: any) => video.uri.includes('youtube.com'));

        return { ...recordDetails, videos: filteredVideos };
    } catch (error) {
        console.error(`Error fetching record with release ID ${releaseId}:`, error);
        throw error;
    }
};

// Define the query parameters interface
interface FetchRecordsByGenreQuery {
    username?: string;
    folderId?: string;
    genre?: string;
}
