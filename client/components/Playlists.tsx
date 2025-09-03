import React, { useEffect, useContext } from 'react';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists } = playlistState;
    const bearerToken = useBearerToken();

    return playlists?.length > 0 ? <>show playlists</> : <>create a playlist</>;
};

export default Playlists;
