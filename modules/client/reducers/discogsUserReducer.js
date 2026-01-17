export const SET_USERNAME = 'SET_USERNAME';

const setUsername = (state, payload) => ({
    ...state,
    username: payload,
});

const actionHandlers = {
    [SET_USERNAME]: setUsername,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
