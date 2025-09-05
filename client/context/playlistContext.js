import { createContext, useReducer } from 'react';
import playlistReducer from '../reducers/playlistReducer';

const initialState = {
    showPlaylistView: false,
    playlists: null,
    addModalOpen: false,
    selectedPlaylist: null,
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
