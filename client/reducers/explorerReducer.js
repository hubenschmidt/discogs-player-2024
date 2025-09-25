export const SET_EXPLORER = 'SET_EXPLORER';
export const SET_FILTER = 'SET_FILTER';
export const UNSET_FILTER = 'UNSET_FILTER';
export const CLEAR_FILTER = 'CLEAR_FILTER';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_EXPLORER:
                return setExplorer(state, action.payload);
            case SET_FILTER:
                return setFilter(state, action.payload);
            case UNSET_FILTER:
                return unSetFilter(state, action.payload);
            case CLEAR_FILTER:
                return clearFilter(state, action.payload);
            default:
                return state;
        }
    };
};

const normKind = k => {
    const s = (k ?? '').toLowerCase();
    return s.startsWith('style') ? 'styles' : 'genres';
};

const valFrom = p => (p.name ?? p.value ?? '').trim();

const setExplorer = (state, payload) => {
    return {
        ...state,
        ...payload,
    };
};

const setFilter = (state, payload) => {
    const kind = normKind(payload.kind ?? payload.label);
    const value = valFrom(payload);
    if (!value) return state;

    const key = kind === 'genres' ? 'genresFilter' : 'stylesFilter';
    const prev = state[key] ?? [];
    if (prev.includes(value)) return state;

    return { ...state, [key]: [...prev, value] };
};

const unSetFilter = (state, payload) => {
    const kind = normKind(payload.kind ?? payload.label);
    const value = valFrom(payload);
    if (!value) return state;

    const key = kind === 'genres' ? 'genresFilter' : 'stylesFilter';
    const prev = state[key] ?? [];
    return { ...state, [key]: prev.filter(x => x !== value) };
};

const clearFilter = (state, payload) => {
    if (!payload) {
        return { ...state, genresFilter: [], stylesFilter: [] };
    }
    const kind = normKind(payload.kind ?? payload.label);
    return kind === 'genres'
        ? { ...state, genresFilter: [] }
        : { ...state, stylesFilter: [] };
};
