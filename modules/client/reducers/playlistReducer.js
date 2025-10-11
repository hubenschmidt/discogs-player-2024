export const SET_SHOW_PLAYLIST_VIEW = 'SET_SHOW_PLAYLIST_VIEW';
export const SET_PLAYLISTS = 'SET_PLAYLISTS';
export const SET_PLAYLISTS_PAGE = 'SET_PLAYLISTS_PAGE';
export const SET_PLAYLISTS_LIMIT = 'SET_PLAYLISTS_LIMIT';
export const SET_ADD_MODAL = 'SET_ADD_MODAL';
export const SET_SELECTED_PLAYLIST = 'SET_SELECTED_PLAYLIST';
export const SET_PLAYLIST_DETAIL = 'SET_PLAYLIST_DETAIL';
export const SET_PLAYLISTS_SORT = 'SET_PLAYLISTS_SORT';
export const SET_PLAYLIST_VIDEOS_PAGE = 'SET_PLAYLIST_VIDEOS_PAGE';
export const SET_PLAYLIST_VIDEOS_LIMIT = 'SET_PLAYLIST_VIDEOS_LIMIT';
export const SET_ACTIVE_PLAYLIST_ID = 'SET_ACTIVE_PLAYLIST_ID';
export const SET_PLAYLIST_VERSION = 'SET_PLAYLIST_VERSION';
export const SET_PLAYLISTS_VERSION = 'SET_PLAYLISTS_VERSION';

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
            case SET_PLAYLIST_VIDEOS_PAGE:
                return setPlaylistVideosPage(state, action.payload);
            case SET_PLAYLIST_VIDEOS_LIMIT:
                return setPlaylistVideosLimit(state, action.payload);
            case SET_ACTIVE_PLAYLIST_ID:
                return setActivePlaylistId(state, action.payload);
            case SET_PLAYLIST_VERSION:
                return setPlaylistVersion(state, action.payload);
            case SET_PLAYLISTS_VERSION:
                return setPlaylistsVersion(state, action.payload);
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

const setPlaylistVideosPage = (state, payload) => {
    return {
        ...state,
        playlistVideosPage: payload.playlistVideosPage,
    };
};

const setPlaylistVideosLimit = (state, payload) => {
    return {
        ...state,
        playlistVideosLimit: payload.playlistVideosLimit,
        playlistVideosPage: payload.playlistVideosPage,
    };
};

const setActivePlaylistId = (state, payload) => {
    return {
        ...state,
        activePlaylistId: payload,
    };
};

const setPlaylistVersion = (state, payload) => {
    return {
        ...state,
        version: state.version + 1,
    };
};

const setPlaylistsVersion = (state, payload) => ({
    ...state,
    playlistsVersion: state.playlistsVersion + 1,
});
