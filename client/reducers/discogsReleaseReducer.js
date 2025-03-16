export const SET_SELECTED_DISCOGS_RELEASE = 'SET_SELECTED_DISCOGS_RELEASE';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SELECTED_DISCOGS_RELEASE:
                return setSelectedDiscogsRelease(state, action.payload);
            default:
                return state;
        }
    };
};

const setSelectedDiscogsRelease = (state, payload) => {
    return {
        ...state,
        selectedDiscogsRelease: payload,
    };
};
