export const SET_QUERY = 'SET_QUERY';
export const SET_RESULTS = 'SET_RESULTS';
export const SET_SEARCH_TYPE = 'SET_SEARCH_TYPE';
export const SET_OPEN = 'SET_OPEN';
export const SET_SEARCH_SELECTION = 'SET_SEARCH_SELECTION';
export const SET_SHELF_COLLECTION_OVERRIDE = 'SET_SHELF_COLLECTION_OVERRIDE';

const setQuery = (state, payload) => ({ ...state, query: payload });
const setResults = (state, payload) => ({ ...state, results: payload });
const setSearchType = (state, payload) => ({ ...state, searchType: payload });
const setOpen = (state, payload) => ({ ...state, open: payload });
const setSearchSelection = (state, payload) => ({ ...state, searchSelection: payload });
const setShelfCollectionOverride = (state, payload) => ({ ...state, shelfCollectionOverride: payload });

const actionHandlers = {
    [SET_QUERY]: setQuery,
    [SET_RESULTS]: setResults,
    [SET_SEARCH_TYPE]: setSearchType,
    [SET_OPEN]: setOpen,
    [SET_SEARCH_SELECTION]: setSearchSelection,
    [SET_SHELF_COLLECTION_OVERRIDE]: setShelfCollectionOverride,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
