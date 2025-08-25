export const SET_CONTROLS = 'SET_CONTROLS';
export const SET_VOLUME = 'SET_VOLUME';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_CONTROLS:
                return setControls(state, action.payload);
            case SET_VOLUME:
                return setVolume(state, action.payload);
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

const setVolume = (state, payload) => {
    return {
        ...state,
        volume: payload,
    };
};
