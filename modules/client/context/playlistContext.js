import { createContext, useReducer } from 'react';
import playlistReducer from '../reducers/playlistReducer';

const initialState = {
    playlists: null,
    addModalOpen: false,
    selectedPlaylist: null,
    playlistDetail: null,
    orderBy: 'updatedAt',
    order: 'DESC',
    page: 1,
    limit: null,
    playlistVideosPage: 1,
    playlistVideosLimit: null,
    playlistVideosOrderBy: 'updatedAt',
    playlistVideosOrder: 'DESC',
    activePlaylistId: null,
    version: 0,
    playlistsVersion: 0,
    createOpen: false,
};

export const PlaylistContext = createContext(initialState);

export const PlaylistProvider = props => {
    const reducer = playlistReducer(initialState);
    const [playlistState, dispatchPlaylist] = useReducer(reducer, initialState);

    return (
        <PlaylistContext.Provider value={{ playlistState, dispatchPlaylist }}>
            {props.children}
        </PlaylistContext.Provider>
    );
};
