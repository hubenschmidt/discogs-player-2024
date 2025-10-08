export const SET_USER = 'SET_USER';
export const SET_BEARER_TOKEN = 'SET_BEARER_TOKEN';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_USER:
                return setUser(state, action.payload);
            case SET_BEARER_TOKEN:
                return setBearerToken(state, action.payload);
            default:
                return state;
        }
    };
};

const setUser = (state, payload) => {
    return {
        ...state,
        username: payload.username,
        email: payload.email,
        notAuthed: payload.notAuthed,
    };
};

const setBearerToken = (state, payload) => {
    return {
        ...state,
        bearerToken: payload,
    };
};
