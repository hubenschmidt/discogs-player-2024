export const SET_NAV_KEY = 'SET_NAV_KEY';

const setNavKey = (state, payload) => ({
    ...state,
    navKey: payload,
});

const actionHandlers = {
    [SET_NAV_KEY]: setNavKey,
};

export default () => (state, action) => {
    const handler = actionHandlers[action.type];
    if (!handler) return state;
    return handler(state, action.payload);
};
