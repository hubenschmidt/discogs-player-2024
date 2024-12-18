export const SET_THEME = 'SET_THEME';

interface ThemeState {
    theme: string;
}

interface Action {
    type: typeof SET_THEME;
    payload: string;
}

export default (state: ThemeState, action: Action) => {
    switch (action.type) {
        case SET_THEME:
            return setTheme(state, action.payload);
        default:
            return state;
    }
};

const setTheme = (state: ThemeState, payload: string) => {
    return {
        ...state,
        theme: payload,
    };
};
