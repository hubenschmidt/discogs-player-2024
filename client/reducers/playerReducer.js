export const SET_CONTROLS = 'SET_CONTROLS';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_CONTROLS:
                return setControls(state, action.payload);
            default:
                return state;
        }
    };
};

const setControls = (state, payload) => {
    return {
        ...state,
        controls: payload,
    };
};
