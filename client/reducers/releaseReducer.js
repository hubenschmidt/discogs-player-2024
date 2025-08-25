export const SET_SELECTED_RELEASE = 'SET_SELECTED_RELEASE';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_SELECTED_RELEASE:
                return setSelectedRelease(state, action.payload);
            default:
                return state;
        }
    };
};

const setSelectedRelease = (state, payload) => {
    return {
        ...state,
        selectedRelease: payload,
    };
};
