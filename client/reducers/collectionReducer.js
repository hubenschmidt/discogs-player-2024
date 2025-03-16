export const SET_COLLECTION = 'SET_COLLECTION';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_COLLECTION:
                return setCollection(state, action.payload);
            default:
                return state;
        }
    };
};

const setCollection = (state, payload) => {
    return {
        ...state,
        ...payload,
    };
};
