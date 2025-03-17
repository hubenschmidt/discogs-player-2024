import React, { createContext, useReducer } from 'react';
import discogsReleaseReducer from '../reducers/discogsReleaseReducer';

const initialState = {
    selectedDiscogsRelease: null,
    continuousPlay: true,
    selectedVideo: null,
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
