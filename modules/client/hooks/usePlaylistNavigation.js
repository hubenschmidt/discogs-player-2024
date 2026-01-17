import { useContext } from 'react';
import { PlaylistContext } from '../context/playlistContext';
import { NavContext } from '../context/navContext';
import { SearchContext } from '../context/searchContext';

export const usePlaylistNavigation = () => {
    const { dispatchPlaylist } = useContext(PlaylistContext);
    const { dispatchNav } = useContext(NavContext);
    const { dispatchSearch } = useContext(SearchContext);

    const openPlaylist = (playlistId) => {
        dispatchPlaylist({ type: 'SET_ACTIVE_PLAYLIST_ID', payload: playlistId });
        dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: true });
        dispatchNav({ type: 'SET_NAV_KEY', payload: null });
        dispatchSearch({ type: 'SET_SHELF_COLLECTION_OVERRIDE', payload: false });
        dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null });
    };

    const closePlaylist = () => {
        dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: false });
    };

    const clearActivePlaylist = () => {
        dispatchPlaylist({ type: 'SET_ACTIVE_PLAYLIST_ID', payload: null });
        dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: null });
        dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: false });
    };

    return { openPlaylist, closePlaylist, clearActivePlaylist };
};
