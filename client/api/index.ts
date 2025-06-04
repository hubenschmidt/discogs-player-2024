import { requestHandler } from '../lib/request-handler';
import { getBearerTokenHeader } from '../lib/get-bearer-token-header';
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

export const fetchRequestToken = async accessToken => {
    const uri = `/api/discogs/fetch-request-token`;
    const headers = getBearerTokenHeader(accessToken);
    const response = await requestHandler('GET', uri, null, headers);
    return response.data;
};
/**
These all need to use `getBearerTokenHeader` and take an accessToken param like the above
 */
export const fetchAccessToken = async (
    oauth_token: string | string[],
    oauth_verifier: string | string[],
) => {
    const uri = `/api/discogs/fetch-access-token`;
    const body = { oauth_token, oauth_verifier };

    const response = await requestHandler('POST', uri, body, { headers: null });
    return response.data;
};

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

    const response: AxiosResponse<CollectionResponse> = await requestHandler(
        'GET',
        uri,
        null,
        { headers: null },
    );

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

    return response.data;
};
