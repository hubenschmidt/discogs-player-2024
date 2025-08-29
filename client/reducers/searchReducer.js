export const SET_QUERY = 'SET_QUERY';
export const SET_RESULTS = 'SET_RESULTS';
export const SET_SEARCH_TYPE = 'SET_SEARCH_TYPE';
export const SET_OPEN = 'SET_OPEN';
export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE';

export default (initialState) => {
  return (state, action) => {
    switch (action.type) {
      case SET_QUERY:
        return { ...state, query: action.payload };
      case SET_RESULTS:
        return { ...state, results: action.payload };
      case SET_SEARCH_TYPE:
        return { ...state, searchType: action.payload };
      case SET_OPEN:
        return { ...state, open: action.payload };
      case SET_SELECTED_RELEASE:
        return { ...state, selectedRelease: action.payload };
      default:
        return state;
    }
  };
};
