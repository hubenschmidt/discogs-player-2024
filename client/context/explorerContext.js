import { createContext, useReducer } from 'react';
import explorerReducer from '../reducers/explorerReducer';

const initialState = {
    genresFilter: [],
    stylesFilter: [],
};

export const ExplorerContext = createContext(initialState);

export const ExplorerProvider = props => {
    const reducer = explorerReducer(initialState);
    const [explorerState, dispatchExplorer] = useReducer(reducer, initialState);

    return (
        <ExplorerContext.Provider value={{ explorerState, dispatchExplorer }}>
            {props.children}
        </ExplorerContext.Provider>
    );
};
