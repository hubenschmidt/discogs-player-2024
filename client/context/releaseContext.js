import React, { createContext, useReducer } from 'react';
import releaseReducer from '../reducers/releaseReducer';

const initialState = {
    selectedRelease: null,
};

export const ReleaseContext = createContext(initialState);

export const ReleaseProvider = props => {
    const reducer = releaseReducer(initialState);
    const [releaseState, dispatchRelease] = useReducer(reducer, initialState);

    return (
        <ReleaseContext.Provider value={{ releaseState, dispatchRelease }}>
            {props.children}
        </ReleaseContext.Provider>
    );
};
