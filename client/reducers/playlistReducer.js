export const SET_OPEN_PLAYLIST_VIEW = 'SET_OPEN_PLAYLIST_VIEW';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_OPEN_PLAYLIST_VIEW:
                return setOpenPlaylistView(state, action.payload);
            default:
                return state;
        }
    };
};

const setOpenPlaylistView = (state, payload) => {
    return {
        ...state,
        showPlaylistView: payload,
    };
};
