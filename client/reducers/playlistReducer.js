export const SET_SHOW_PLAYLIST_VIEW = 'SET_SHOW_PLAYLIST_VIEW';
export const SET_PLAYLISTS = 'SET_PLAYLISTS';
export const PLAYLISTS_PAGE_REQUESTED = 'PLAYLISTS_PAGE_REQUESTED';
export const PLAYLISTS_PAGE_SIZE_REQUESTED = 'PLAYLISTS_PAGE_SIZE_REQUESTED';
export const PLAYLISTS_LOADING = 'PLAYLISTS_LOADING';
export const SET_ADD_MODAL = 'SET_ADD_MODAL';
export const SET_SELECTED_PLAYLIST = 'SET_SELECTED_PLAYLIST';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SHOW_PLAYLIST_VIEW:
                return setShowPlaylistView(state, action.payload);
            case SET_PLAYLISTS:
                return setPlaylists(state, action.payload);
            case PLAYLISTS_PAGE_REQUESTED:
                return playlistsPageRequested(state, action.payload);
            case PLAYLISTS_PAGE_SIZE_REQUESTED:
                return playlistsPageSizeRequested(state, action.payload);
            case PLAYLISTS_LOADING:
                return playlistsLoading(state, action.payload);
            case SET_ADD_MODAL:
                return setAddModal(state, action.payload);
            case SET_SELECTED_PLAYLIST:
                return setSelectedPlaylist(state, action.payload);
            default:
                return state;
        }
    };
};

const setShowPlaylistView = (state, payload) => {
    return {
        ...state,
        showPlaylistView: payload,
    };
};

const setPlaylists = (state, payload) => {
    return {
        ...state,
        playlists: payload,
    };
};

const playlistsPageRequested = (state, payload) => {
    return {
        ...state,
        pendingPage: payload.page,
        isLoadingPlaylists: true,
    };
};

const playlistsPageSizeRequested = (state, payload) => ({
    ...state,
    pendingLimit: payload.limit,
    pendingPage: payload.page ?? 1, // reset to page 1 on size change
    isLoadingPlaylists: true,
});

const playlistsLoading = (state, payload) => {
    return {
        ...state,
        isLoadingPlaylists: payload,
    };
};

const setAddModal = (state, payload) => {
    return {
        ...state,
        addModalOpen: payload,
    };
};

const setSelectedPlaylist = (state, payload) => {
    return {
        ...state,
        selectedPlaylist: payload,
    };
};
