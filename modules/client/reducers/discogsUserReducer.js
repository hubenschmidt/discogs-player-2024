export const SET_USERNAME = 'SET_USERNAME';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_USERNAME:
                return setUsername(state, action.payload);
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
