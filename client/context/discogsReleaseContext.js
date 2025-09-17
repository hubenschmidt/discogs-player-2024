import { createContext, useReducer } from 'react';
import discogsReleaseReducer from '../reducers/discogsReleaseReducer';

const initialState = {
    selectedRelease: null,
    previewRelease: null,
    selectedDiscogsRelease: null,
    previewDiscogsRelease: null,
    continuousPlay: false,
    selectedVideo: null,
    // NEW:
    playbackMode: 'release' | 'playlist',
    queue: [], // array of videos (from playlist or release)
    queueIndex: -1, // index into queue (selectedVideo should match queue[queueIndex]
};

export const DiscogsReleaseContext = createContext(initialState);

export const DiscogsReleaseProvider = props => {
    const reducer = discogsReleaseReducer(initialState);
    const [discogsReleaseState, dispatchDiscogsRelease] = useReducer(
        reducer,
        initialState,
    );

    return (
        <DiscogsReleaseContext.Provider
            value={{ discogsReleaseState, dispatchDiscogsRelease }}
        >
            {props.children}
        </DiscogsReleaseContext.Provider>
    );
};
