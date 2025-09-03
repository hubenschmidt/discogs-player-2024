export const SET_SHOW_PLAYLIST_VIEW = 'SET_SHOW_PLAYLIST_VIEW';
export const SET_PLAYLISTS = 'SET_PLAYLISTS';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SHOW_PLAYLIST_VIEW:
                return setShowPlaylistView(state, action.payload);
            case SET_PLAYLISTS:
                return setPlaylists(state, action.payload);
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
