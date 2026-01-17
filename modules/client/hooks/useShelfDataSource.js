import { useContext } from 'react';
import { SearchContext } from '../context/searchContext';
import { PlaylistContext } from '../context/playlistContext';

export const useShelfDataSource = () => {
    const { searchState } = useContext(SearchContext);
    const { playlistState } = useContext(PlaylistContext);

    const { searchSelection, shelfCollectionOverride } = searchState;
    const { playlistOpen } = playlistState;

    const showSearchShelf = !!(
        searchSelection?.Artist_Id ||
        searchSelection?.Label_Id ||
        searchSelection?.Release_Id
    );

    const shelfShowsPlaylist = playlistOpen && !showSearchShelf && !shelfCollectionOverride;

    return {
        showSearchShelf,
        shelfShowsPlaylist,
        searchSelection,
        shelfCollectionOverride,
        playlistOpen,
    };
};
