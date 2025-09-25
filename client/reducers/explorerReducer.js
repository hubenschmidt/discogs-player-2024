export const SET_EXPLORER = 'SET_EXPLORER';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_EXPLORER:
                return setExplorer(state, action.payload);
            default:
                return state;
        }
    };
};

const setExplorer = (state, payload) => {
    return {
        ...state,
        ...payload,
    };
};
