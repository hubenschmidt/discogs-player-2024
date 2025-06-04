import axios from 'axios';

export const getAuth0AccessToken = () =>
    axios
        .get('/api/get-token')
        .then(res => res.data.accessToken)
        .catch(err => {
            console.error(err);
        });
