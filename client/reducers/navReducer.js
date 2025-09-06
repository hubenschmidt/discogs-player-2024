export const SET_NAV_KEY = 'SET_NAV_KEY';
export const SET_PLAYLIST_OPEN = 'SET_PLAYLIST_OPEN';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_NAV_KEY:
                return setNavKey(state, action.payload);
            case SET_PLAYLIST_OPEN:
                return setPlaylistOpen(state, action.payload);
            default:
                return state;
        }
    };
};

const setNavKey = (state, payload) => {
    return {
        ...state,
        navKey: payload,
    };
};

const setPlaylistOpen = (state, payload) => {
    return {
        ...state,
        playlistOpen: payload,
    };
};
