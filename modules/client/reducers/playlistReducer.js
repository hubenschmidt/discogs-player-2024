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
export const SET_PLAYLIST_CREATE_OPEN = 'SET_PLAYLIST_CREATE_OPEN';
export const SET_PLAYLIST_OPEN = 'SET_PLAYLIST_OPEN';

const setPlaylists = (state, payload) => ({
    ...state,
    playlists: payload,
});

const setPlaylistsPage = (state, payload) => ({
    ...state,
    page: payload.page,
});

const setPlaylistsLimit = (state, payload) => ({
    ...state,
    limit: payload.limit,
    page: payload.page,
});

const setAddModal = (state, payload) => ({
    ...state,
    addModalOpen: payload,
});

const setSelectedPlaylist = (state, payload) => ({
    ...state,
    selectedPlaylist: payload,
});

const setPlaylistDetail = (state, payload) => ({
    ...state,
    playlistDetail: payload,
});

const setPlaylistSort = (state, payload) => ({
    ...state,
    orderBy: payload.orderBy,
    order: payload.order,
    page: payload.page ?? 1,
});

const setPlaylistVideosPage = (state, payload) => ({
    ...state,
    playlistVideosPage: payload.playlistVideosPage,
});

const setPlaylistVideosLimit = (state, payload) => ({
    ...state,
    playlistVideosLimit: payload.playlistVideosLimit,
    playlistVideosPage: payload.playlistVideosPage,
});

const setActivePlaylistId = (state, payload) => ({
    ...state,
    activePlaylistId: payload,
});

const setPlaylistVersion = (state) => ({
    ...state,
    version: state.version + 1,
});

const setPlaylistsVersion = (state) => ({
    ...state,
    playlistsVersion: state.playlistsVersion + 1,
});

const setPlaylistCreateOpen = (state, payload) => ({
    ...state,
    createOpen: payload,
});

const setPlaylistOpen = (state, payload) => ({
    ...state,
    playlistOpen: payload,
});

const actionHandlers = {
    [SET_PLAYLISTS]: setPlaylists,
    [SET_PLAYLISTS_PAGE]: setPlaylistsPage,
    [SET_PLAYLISTS_LIMIT]: setPlaylistsLimit,
    [SET_ADD_MODAL]: setAddModal,
    [SET_SELECTED_PLAYLIST]: setSelectedPlaylist,
    [SET_PLAYLIST_DETAIL]: setPlaylistDetail,
    [SET_PLAYLISTS_SORT]: setPlaylistSort,
    [SET_PLAYLIST_VIDEOS_PAGE]: setPlaylistVideosPage,
    [SET_PLAYLIST_VIDEOS_LIMIT]: setPlaylistVideosLimit,
    [SET_ACTIVE_PLAYLIST_ID]: setActivePlaylistId,
    [SET_PLAYLIST_VERSION]: setPlaylistVersion,
    [SET_PLAYLISTS_VERSION]: setPlaylistsVersion,
    [SET_PLAYLIST_CREATE_OPEN]: setPlaylistCreateOpen,
    [SET_PLAYLIST_OPEN]: setPlaylistOpen,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
