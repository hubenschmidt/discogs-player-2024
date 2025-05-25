import { requestHandler } from '../lib/request-handler';
import { AxiosResponse } from 'axios';
import { CollectionResponse } from '../interfaces';

interface CollectionParams {
    username: string;
    genre?: string;
    style?: string;
    page?: number;
    limit?: number;
    order?: string;
    orderBy?: string;
}

export const syncCollection = async username => {
    const uri = `/api/discogs/sync-collection/${username}`;
    const response = await requestHandler('GET', uri, null, { headers: null });
    return response.data;
};

export const getCollection = async (
    params: CollectionParams,
): Promise<CollectionResponse> => {
    const { username, genre, style, page, limit, order, orderBy } = params;

    let uri = `/api/app/collection/${username}`;
    if (genre) {
        uri += `/${genre}`;
    }
    if (style) {
        uri += `/${style}`;
    }

    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (limit !== undefined) queryParams.append('limit', limit.toString());
    if (order !== undefined) queryParams.append('order', order);
    if (orderBy !== undefined) queryParams.append('orderBy', orderBy);

    const queryString = queryParams.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    // If requestHandler returns an AxiosResponse<CollectionResponse>,
    // you can just do:
    const response: AxiosResponse<CollectionResponse> = await requestHandler(
        'GET',
        uri,
        null,
        { headers: null },
    );

    // Return the data directly so the calling code gets CollectionResponse
    return response.data;
};

export const getDiscogsRelease = async (releaseId: number): Promise<any> => {
    const uri = `/api/discogs/release/${releaseId}`;

    const response: AxiosResponse<any> = await requestHandler(
        'GET',
        uri,
        null,
        { headers: null },
    );

    // Return the data directly so the calling code gets ReleaseResponse
    return response.data;
};
