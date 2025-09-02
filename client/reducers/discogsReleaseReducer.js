import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';
export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE';
export const SET_PREVIEW_RELEASE = 'SET_PREVIEW_RELEASE';
export const SET_SELECTED_DISCOGS_RELEASE = 'SET_SELECTED_DISCOGS_RELEASE';
export const SET_PREVIEW_DISCOGS_RELEASE = 'SET_PREVIEW_DISCOGS_RELEASE';
export const SET_CONTINUOUS_PLAY = 'SET_CONTINUOUS_PLAY';
export const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';
export const SET_NEXT_VIDEO = 'SET_NEXT_VIDEO';
export const SET_PREV_VIDEO = 'SET_PREV_VIDEO';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SELECTED_RELEASE:
                return setSelectedRelease(state, action.payload);
            case SET_PREVIEW_RELEASE:
                return setPreviewRelease(state, action.payload);
            case SET_SELECTED_DISCOGS_RELEASE:
                return setSelectedDiscogsRelease(state, action.payload);
            case SET_PREVIEW_DISCOGS_RELEASE:
                return setPreviewDiscogsRelease(state, action.payload);
            case SET_CONTINUOUS_PLAY:
                return setContinuousPlay(state, action.payload);
            case SET_SELECTED_VIDEO:
                return setSelectedVideo(state, action.payload);
            case SET_NEXT_VIDEO:
                return setNextVideo(state);
            case SET_PREV_VIDEO:
                return setPrevVideo(state);
            default:
                return state;
        }
    };
};

const setSelectedRelease = (state, payload) => {
    return {
        ...state,
        selectedRelease: payload,
    };
};

const setPreviewRelease = (state, payload) => {
    return { ...state, previewRelease: payload };
};

const setSelectedDiscogsRelease = (state, payload) => {
    return {
        ...state,
        selectedDiscogsRelease: payload,
    };
};

const setPreviewDiscogsRelease = (state, payload) => {
    return {
        ...state,
        previewDiscogsRelease: payload,
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

const setNextVideo = state => {
    const videos = state.selectedDiscogsRelease?.videos;
    if (!videos || videos.length === 0) return state;

    const currentIndex = videos.findIndex(
        video => video.uri === state.selectedVideo.uri,
    );

    // Advance if not last, otherwise loop back
    const nextIndex =
        currentIndex !== -1 && currentIndex < videos.length - 1
            ? currentIndex + 1
            : 0;

    return {
        ...state,
        selectedVideo: videos[nextIndex],
    };
};

const setPrevVideo = state => {
    const videos = state.selectedDiscogsRelease?.videos;
    if (!videos || videos.length === 0) return state;

    const currentIndex = videos.findIndex(
        video => video.uri === state.selectedVideo.uri,
    );

    // Go back if not first, otherwise loop to last
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;

    return {
        ...state,
        selectedVideo: videos[prevIndex],
    };
};
