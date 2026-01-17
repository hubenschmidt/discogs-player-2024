export const SET_EXPLORER = 'SET_EXPLORER';
export const SET_FILTER = 'SET_FILTER';
export const UNSET_FILTER = 'UNSET_FILTER';
export const CLEAR_FILTER = 'CLEAR_FILTER';

const valFrom = p => String(p?.value ?? p?.name ?? '').trim();

const setExplorer = (state, payload) => ({ ...state, ...payload });

const setFilter = (state, payload) => {
    const key = String(payload?.key ?? '').trim();
    const value = valFrom(payload);
    const prev = state[key] ?? [];
    if (prev.includes(value)) return state;
    return { ...state, [key]: [...prev, value] };
};

const unSetFilter = (state, payload) => {
    const key = String(payload?.key ?? '').trim();
    const value = valFrom(payload);
    const prev = state[key] ?? [];
    return { ...state, [key]: prev.filter(x => x !== value) };
};

const clearFilter = (state, payload) => {
    if (!payload) {
        return {
            ...state,
            genresFilter: [],
            stylesFilter: [],
            yearsFilter: [],
        };
    }
    const key = String(payload?.key ?? '').trim();
    return { ...state, [key]: [] };
};

const actionHandlers = {
    [SET_EXPLORER]: setExplorer,
    [SET_FILTER]: setFilter,
    [UNSET_FILTER]: unSetFilter,
    [CLEAR_FILTER]: clearFilter,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
