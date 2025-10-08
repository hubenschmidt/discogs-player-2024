import { createContext, useReducer } from 'react';
import collectionReducer from '../reducers/collectionReducer';

const initialState = {
    synced: false,
};

export const CollectionContext = createContext(initialState);

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
