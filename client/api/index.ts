import { requestHandler } from '../lib/request-handler';
import { Axios, AxiosResponse } from 'axios';
import { CollectionResponse } from '../interfaces';
import type { BearerToken } from '../types/types';

interface CollectionParams {
    username: string;
    genre?: string;
    style?: string;
    page?: number;
    limit?: number;
    order?: string;
    orderBy?: string;
    releaseId?: string;
    artistId?: string;
    labelId?: string;
}

export const getUser = async (email: string, token: BearerToken) => {
    const uri = `/api/app/user/${email}`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const fetchDiscogsRequestToken = async (token: BearerToken) => {
    const uri = `/api/discogs/fetch-request-token`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};
/**
These all need to use `getBearerTokenHeader` and take an accessToken param like the above
 */
export const fetchDiscogsAccessToken = async (
    email: string,
    oauth_token: string | string[],
    oauth_verifier: string | string[],
    token: BearerToken,
) => {
    const uri = `/api/discogs/fetch-access-token`;
    const body = { email, oauth_token, oauth_verifier };

    const response = await requestHandler('POST', uri, body, token);
    return response.data;
};

export const syncCollection = async (username: string, token: BearerToken) => {
    const uri = `/api/discogs/sync-collection/${username}`;
    const response = await requestHandler('GET', uri, null, token);
    return response.data;
};

export const searchCollection = async (
    query: string,
    type: string | undefined,
    username: string,
    token: BearerToken,
): Promise<any> => {
    const params = new URLSearchParams({
        searchQuery: query,
    });

    if (type) {
        params.append('type', type);
    }

    const uri = `/api/app/search/${encodeURIComponent(
        username,
    )}?${params.toString()}`;

    const response = await requestHandler('GET', uri, null, token);
    return response.data as any;
};

export const getCollection = async (
    params: CollectionParams,
    token: BearerToken,
): Promise<CollectionResponse> => {
    const {
        username,
        genre,
        style,
        page,
        limit,
        order,
        orderBy,
        releaseId,
        artistId,
        labelId,
    } = params;

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
    if (artistId !== undefined)
        queryParams.append('artistId', artistId.toString());
    if (releaseId !== undefined)
        queryParams.append('releaseId', releaseId.toString());
    if (labelId !== undefined)
        queryParams.append('labelId', labelId.toString());

    const queryString = queryParams.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    const response: AxiosResponse<CollectionResponse> = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};

export const getDiscogsRelease = async (
    releaseId: number,
    token: BearerToken,
): Promise<any> => {
    const uri = `/api/discogs/release/${releaseId}`;

    const response: AxiosResponse<any> = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );

    return response.data;
};

export const updateVideoPlayCount = async (
    releaseId: number,
    selectedVideo: any,
    username: string,
    token: BearerToken,
): Promise<any> => {
    const uri = `/api/app/${username}/release/${releaseId}/video`;
    const response: AxiosResponse<any> = await requestHandler(
        'POST',
        uri,
        selectedVideo,
        token,
    );

    return response.data;
};

export const getPlaylists = async (
    username: string,
    token: BearerToken,
): Promise<any> => {
    const uri = `/api/app/${username}/playlist/all`;
    const response: AxiosResponse<any> = await requestHandler(
        'GET',
        uri,
        null,
        token,
    );
    return response.data;
};
