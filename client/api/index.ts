import { requestHandler } from '../lib/request-handler';

export const getCollection = params => {
    const { username, genre, style, page, limit, order, orderBy } = params;

    // Build the base URL with username, and optionally add genre and style
    let uri = `/api/app/collection/${username}`;
    if (genre) {
        uri += `/${genre}`;
    }
    if (style) {
        uri += `/${style}`;
    }

    // Create query parameters only for defined values
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page);
    if (limit !== undefined) queryParams.append('limit', limit);
    if (order !== undefined) queryParams.append('order', order);
    if (orderBy !== undefined) queryParams.append('orderBy', orderBy);

    const queryString = queryParams.toString();
    if (queryString) {
        uri += `?${queryString}`;
    }

    return requestHandler('GET', uri, null, { headers: null });
};
