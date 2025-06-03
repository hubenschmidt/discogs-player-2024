export const SET_USERNAME = 'SET_USERNAME';
export const SET_ACCESS_TOKEN = 'SET_ACCESS_TOKEN';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_USERNAME:
                return setUsername(state, action.payload);
            case SET_ACCESS_TOKEN:
                return setAccessToken(state, action.payload);
            default:
                return state;
        }
    };
};

const setUsername = (state, payload) => {
    return {
        ...state,
        username: payload,
    };
};

const setAccessToken = (state, payload) => {
    return {
        ...state,
        accessToken: payload,
    };
};
