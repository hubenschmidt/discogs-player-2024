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

export default initialState => {
    return (state = initialState, action) => {
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
