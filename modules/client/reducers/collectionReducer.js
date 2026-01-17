export const SET_SYNCED = 'SET_SYNCED';
export const SET_COLLECTION = 'SET_COLLECTION';
export const SET_RANDOMIZED = 'SET_RANDOMIZED';

const setSynced = (state, payload) => ({
    ...state,
    synced: payload,
});

const setRandomized = (state, payload) => ({
    ...state,
    shouldRandomize: payload,
});

const setCollection = (state, payload) => ({
    ...state,
    ...payload,
});

const actionHandlers = {
    [SET_SYNCED]: setSynced,
    [SET_RANDOMIZED]: setRandomized,
    [SET_COLLECTION]: setCollection,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
