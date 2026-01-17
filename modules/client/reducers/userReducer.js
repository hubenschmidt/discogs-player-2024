export const SET_USER = 'SET_USER';
export const SET_BEARER_TOKEN = 'SET_BEARER_TOKEN';

const setUser = (state, payload) => ({
    ...state,
    username: payload.username,
    email: payload.email,
    userId: payload.userId,
    notAuthed: payload.notAuthed,
});

const setBearerToken = (state, payload) => ({
    ...state,
    bearerToken: payload,
});

const actionHandlers = {
    [SET_USER]: setUser,
    [SET_BEARER_TOKEN]: setBearerToken,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
