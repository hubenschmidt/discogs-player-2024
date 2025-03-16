import axios from 'axios';
import { getBaseUrl } from './get-base-url';

export const requestHandler = (method, uri, data = null, { headers }) => {
    return axios({
        method: method,
        url: `${getBaseUrl()}${uri}`,
        data: data,
        headers: headers,
    })
        .then(response => response)
        .catch(error => {
            throw error;
        });
};
