import React, { createContext, useReducer } from 'react';
import collectionReducer from '../reducers/collectionReducer';

const initialState = {};

// Create Context
export const CollectionContext = createContext(initialState);

// Provider Component
export const CollectionProvider = props => {
    const reducer = collectionReducer(initialState);
    const [collectionState, dispatchCollection] = useReducer(
        reducer,
        initialState,
    );

    return (
        <CollectionContext.Provider
            value={{ collectionState, dispatchCollection }}
        >
            {props.children}
        </CollectionContext.Provider>
    );
};
