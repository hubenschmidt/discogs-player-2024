export const SET_SYNCED = 'SET_SYNCED';
export const SET_COLLECTION = 'SET_COLLECTION';
export const SET_RANDOMIZED = 'SET_RANDOMIZED';
export const SET_CURATOR_ACTIVE = 'SET_CURATOR_ACTIVE';
export const SET_CURATOR_RELEASES = 'SET_CURATOR_RELEASES';

const setSynced = (state, payload) => ({
    ...state,
    synced: payload,
});

const setRandomized = (state, payload) => ({
    ...state,
    shouldRandomize: payload,
});

const setCollection = (state, payload) => {
    if (state.curatorActive) return state;
    return { ...state, ...payload };
};

const setCuratorActive = (state, payload) => {
    if (!payload) return { ...state, curatorActive: false };
    return { ...state, curatorActive: true, ...state.curatorReleases };
};

const setCuratorReleases = (state, payload) => {
    if (!payload) return { ...state, curatorReleases: null, curatorActive: false };
    return { ...state, curatorReleases: payload, curatorActive: true, ...payload };
};

const actionHandlers = {
    [SET_SYNCED]: setSynced,
    [SET_RANDOMIZED]: setRandomized,
    [SET_COLLECTION]: setCollection,
    [SET_CURATOR_ACTIVE]: setCuratorActive,
    [SET_CURATOR_RELEASES]: setCuratorReleases,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
