export const SET_SELECTED_DISCOGS_RELEASE = 'SET_SELECTED_DISCOGS_RELEASE';
export const SET_CONTINUOUS_PLAY = 'SET_CONTINUOUS_PLAY';
export const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SELECTED_DISCOGS_RELEASE:
                return setSelectedDiscogsRelease(state, action.payload);
            case SET_CONTINUOUS_PLAY:
                return setContinuousPlay(state, action.payload);
            case SET_SELECTED_VIDEO:
                return setSelectedVideo(state, action.payload);
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

const setContinuousPlay = (state, payload) => {
    return {
        ...state,
        continuousPlay: payload,
    };
};

const setSelectedVideo = (state, payload) => {
    return {
        ...state,
        selectedVideo: payload,
    };
};
