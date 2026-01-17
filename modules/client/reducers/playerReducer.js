export const SET_CONTROLS = 'SET_CONTROLS';
export const SET_VOLUME = 'SET_VOLUME';

const setControls = (state, payload) => ({
    ...state,
    controls: payload,
});

const setVolume = (state, payload) => ({
    ...state,
    volume: payload,
});

const actionHandlers = {
    [SET_CONTROLS]: setControls,
    [SET_VOLUME]: setVolume,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
