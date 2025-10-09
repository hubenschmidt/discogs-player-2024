import axios from 'axios';
import type { BearerToken } from '../types/types';

export const fetchBearerToken = (): Promise<BearerToken> =>
    axios
        .get<{ accessToken: string }>('/api/get-token')
        .then(res => {
            console.log(res, 'res from fetchBearerToken');
            return {
                headers: {
                    Authorization: `Bearer ${res.data.accessToken}`,
                },
            };
        })
        .catch(err => {
            console.error(err);
            // Rethrow so the returned Promise rejects instead of resolving to void
            throw err;
        });
