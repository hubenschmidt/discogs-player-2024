export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE';
export const SET_PREVIEW_RELEASE = 'SET_PREVIEW_RELEASE';
export const SET_SELECTED_DISCOGS_RELEASE = 'SET_SELECTED_DISCOGS_RELEASE';
export const SET_PREVIEW_DISCOGS_RELEASE = 'SET_PREVIEW_DISCOGS_RELEASE';
export const SET_CONTINUOUS_PLAY = 'SET_CONTINUOUS_PLAY';
export const SET_SELECTED_VIDEO = 'SET_SELECTED_VIDEO';
export const SET_NEXT_VIDEO = 'SET_NEXT_VIDEO';
export const SET_PREV_VIDEO = 'SET_PREV_VIDEO';
export const SET_PLAYBACK_QUEUE = 'SET_PLAYBACK_QUEUE';
export const SET_NEXT_IN_QUEUE = 'SET_NEXT_IN_QUEUE';
export const SET_PREV_IN_QUEUE = 'SET_PREV_IN_QUEUE';
export const SET_IS_PLAYING = 'SET_IS_PLAYING';
export const MERGE_STATE = 'MERGE_STATE';

const setSelectedRelease = (state, payload) => ({
    ...state,
    selectedRelease: payload,
});

const setPreviewRelease = (state, payload) => ({
    ...state,
    previewRelease: payload,
});

const setSelectedDiscogsRelease = (state, payload) => ({
    ...state,
    selectedDiscogsRelease: payload,
});

const setPreviewDiscogsRelease = (state, payload) => ({
    ...state,
    previewDiscogsRelease: payload,
});

const setContinuousPlay = (state, payload) => ({
    ...state,
    continuousPlay: payload,
});

const setSelectedVideo = (state, payload) => ({
    ...state,
    selectedVideo: payload,
    ...(state.playbackMode === 'playlist' && payload?.release
        ? { selectedRelease: payload.release }
        : {}),
});

const setPrevVideo = (state) => {
    const videos = state.selectedDiscogsRelease?.videos;
    if (!videos || videos.length === 0) return state;

    const currentIndex = videos.findIndex(
        video => video.uri === state.selectedVideo.uri,
    );
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;

    return {
        ...state,
        selectedVideo: videos[prevIndex],
    };
};

const setPlaybackQueue = (state, payload) => {
    const { items, startIndex = 0, mode } = payload;
    const safeIndex = Math.max(0, Math.min(startIndex, (items?.length ?? 1) - 1));
    const nextVideo = items?.[safeIndex] ?? null;

    return {
        ...state,
        playbackMode: mode,
        queue: items ?? [],
        queueIndex: safeIndex,
        selectedVideo: nextVideo,
        ...(mode === 'playlist' && nextVideo?.release
            ? { selectedRelease: nextVideo.release }
            : {}),
    };
};

const setNextInQueue = (state) => {
    const { queue, queueIndex } = state;
    if (!queue?.length) return state;

    const nextIndex = (queueIndex + 1) % queue.length;
    const next = queue[nextIndex];

    return {
        ...state,
        queueIndex: nextIndex,
        selectedVideo: next,
        ...(state.playbackMode === 'playlist' && next?.release
            ? { selectedRelease: next.release }
            : {}),
    };
};

const setPrevInQueue = (state) => {
    const { queue, queueIndex } = state;
    if (!queue?.length) return state;

    const prevIndex = (queueIndex - 1 + queue.length) % queue.length;
    const prev = queue[prevIndex];

    return {
        ...state,
        queueIndex: prevIndex,
        selectedVideo: prev,
        ...(state.playbackMode === 'playlist' && prev?.release
            ? { selectedRelease: prev.release }
            : {}),
    };
};

const setIsPlaying = (state, payload) => ({
    ...state,
    isPlaying: payload,
});

const mergeState = (state, payload) => ({
    ...state,
    ...payload,
});

const actionHandlers = {
    [SET_SELECTED_RELEASE]: setSelectedRelease,
    [SET_PREVIEW_RELEASE]: setPreviewRelease,
    [SET_SELECTED_DISCOGS_RELEASE]: setSelectedDiscogsRelease,
    [SET_PREVIEW_DISCOGS_RELEASE]: setPreviewDiscogsRelease,
    [SET_CONTINUOUS_PLAY]: setContinuousPlay,
    [SET_PREV_VIDEO]: setPrevVideo,
    [SET_PLAYBACK_QUEUE]: setPlaybackQueue,
    [SET_NEXT_IN_QUEUE]: setNextInQueue,
    [SET_PREV_IN_QUEUE]: setPrevInQueue,
    [SET_SELECTED_VIDEO]: setSelectedVideo,
    [SET_IS_PLAYING]: setIsPlaying,
    [MERGE_STATE]: mergeState,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
