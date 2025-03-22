import React, { createContext, useReducer } from 'react';
import playerReducer from '../reducers/playerReducer';

const initialState = {
    controls: null,
    volume: 100,
};

export const PlayerContext = createContext(initialState);

export const PlayerProvider = props => {
    const reducer = playerReducer(initialState);
    const [playerState, dispatchPlayer] = useReducer(reducer, initialState);

    return (
        <PlayerContext.Provider value={{ playerState, dispatchPlayer }}>
            {props.children}
        </PlayerContext.Provider>
    );
};
