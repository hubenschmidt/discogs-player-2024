import React, { useEffect, useContext } from 'react';
import { getPlaylists } from '../api';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists } = playlistState;
    const bearerToken = useBearerToken();

    // useEffect(() => {
    //     getPlaylists(userState?.username, bearerToken)
    //         .then(res => {
    //             dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res });
    //         })
    //         .catch(err => console.log(err));
    // }, []);

    return playlists?.length > 0 ? <>show playlists</> : <>create a playlist</>;
};

export default Playlists;
