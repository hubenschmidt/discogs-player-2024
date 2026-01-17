import React, { useContext } from 'react';
import { Button } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';

// components/Playlists.jsx (exported helper)
const PlaylistCreateButton = () => {
    const { dispatchPlaylist } = useContext(PlaylistContext);
    return (
        <Button
            mb="-10"
            variant="light"
            color="white"
            onClick={() =>
                dispatchPlaylist({
                    type: 'SET_PLAYLIST_CREATE_OPEN',
                    payload: true,
                })
            }
        >
            Create
        </Button>
    );
};

export default PlaylistCreateButton;
