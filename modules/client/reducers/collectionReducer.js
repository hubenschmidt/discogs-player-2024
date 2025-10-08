export const SET_SYNCED = 'SET_SYNCED';
export const SET_COLLECTION = 'SET_COLLECTION';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SYNCED:
                return setSynced(state, action.payload);
            case SET_COLLECTION:
                return setCollection(state, action.payload);
            default:
                return state;
        }
    };
};

const setSynced = (state, payload) => {
    return {
        ...state,
        synced: payload,
    };
};

const setCollection = (state, payload) => {
    return {
        ...state,
        ...payload,
    };
};
