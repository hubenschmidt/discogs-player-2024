import { createContext, useReducer } from 'react';
import searchReducer from '../reducers/searchReducer';

const initialState = {
    searchSelection: null,
    query: '',
    results: [],
    searchType: 'all',
    open: false,
    shelfCollectionOverride: false,
};

export const SearchContext = createContext(initialState);

export const SearchProvider = props => {
    const reducer = searchReducer(initialState);
    const [searchState, dispatchSearch] = useReducer(reducer, initialState);

    return (
        <SearchContext.Provider value={{ searchState, dispatchSearch }}>
            {props.children}
        </SearchContext.Provider>
    );
};
