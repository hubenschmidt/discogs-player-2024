import { createContext, useReducer } from 'react';
import curatorReducer from '../reducers/curatorReducer';

const initialState = {
    sessions: null,
    activeSessionId: null,
    messages: [],
    stagedPlaylist: null,
    isLoading: false,
    curatorOpen: false,
};

export const CuratorContext = createContext(initialState);

export const CuratorProvider = props => {
    const reducer = curatorReducer(initialState);
    const [curatorState, dispatchCurator] = useReducer(reducer, initialState);

    return (
        <CuratorContext.Provider value={{ curatorState, dispatchCurator }}>
            {props.children}
        </CuratorContext.Provider>
    );
};
