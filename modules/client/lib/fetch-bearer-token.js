import axios from 'axios';

export const fetchBearerToken = () =>
    axios
        .get('/api/get-token')
        .then(res => {
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
