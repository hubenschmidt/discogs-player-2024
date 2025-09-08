export const SET_SHOW_PLAYLIST_VIEW = 'SET_SHOW_PLAYLIST_VIEW';
export const SET_PLAYLISTS = 'SET_PLAYLISTS';
export const SET_PLAYLISTS_PAGE = 'SET_PLAYLISTS_PAGE';
export const SET_PLAYLISTS_LIMIT = 'SET_PLAYLISTS_LIMIT';
export const SET_ADD_MODAL = 'SET_ADD_MODAL';
export const SET_SELECTED_PLAYLIST = 'SET_SELECTED_PLAYLIST';
export const SET_PLAYLIST_DETAIL = 'SET_PLAYLIST_DETAIL';
export const SET_PLAYLISTS_SORT = 'SET_PLAYLISTS_SORT';
// export const PLAYLIST_VIDEOS_PAGE_REQUESTED = 'PLAYLIST_VIDEOS_PAGE_REQUESTED';
// export const PLAYLIST_VIDEOS_LIMIT_REQUESTED =

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_PLAYLISTS:
                return setPlaylists(state, action.payload);
            case SET_PLAYLISTS_PAGE:
                return setPlaylistsPage(state, action.payload);
            case SET_PLAYLISTS_LIMIT:
                return setPlaylistsLimit(state, action.payload);
            case SET_ADD_MODAL:
                return setAddModal(state, action.payload);
            case SET_SELECTED_PLAYLIST:
                return setSelectedPlaylist(state, action.payload);
            case SET_PLAYLIST_DETAIL:
                return setPlaylistDetail(state, action.payload);
            case SET_PLAYLISTS_SORT:
                return setPlaylistSort(state, action.payload);
            // case PLAYLIST_VIDEOS_PAGE_REQUESTED:
            //     return playlist
            default:
                return state;
        }
    };
};

const setPlaylists = (state, payload) => {
    return {
        ...state,
        playlists: payload,
    };
};

const setPlaylistsPage = (state, payload) => {
    console.log(payload);
    return {
        ...state,
        page: payload.page,
    };
};

const setPlaylistsLimit = (state, payload) => ({
    ...state,
    limit: payload.limit,
    page: payload.page,
});

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

const setPlaylistDetail = (state, payload) => {
    return {
        ...state,
        playlistDetail: payload,
    };
};

const setPlaylistSort = (state, payload) => {
    return {
        ...state,
        orderBy: payload.orderBy,
        order: payload.order,
        page: payload.page ?? 1, // reset page
    };
};
