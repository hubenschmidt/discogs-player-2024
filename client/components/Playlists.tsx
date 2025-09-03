import React, { useEffect, useContext } from 'react';
import { getPlaylists } from '../api';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    useEffect(() => {
        getPlaylists(userState?.username, bearerToken)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }, []);

    return 'this is a playlist viewer';
};

export default Playlists;
