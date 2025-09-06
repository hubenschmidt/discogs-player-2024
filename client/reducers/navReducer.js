export const SET_NAV_KEY = 'SET_NAV_KEY';

export default initialState => {
    return (state, action) => {
        switch (action.type) {
            case SET_NAV_KEY:
                return setNavKey(state, action.payload);
            default:
                return state;
        }
    };
};

const setNavKey = (state, payload) => {
    return {
        ...state,
        navKey: payload,
    };
};
