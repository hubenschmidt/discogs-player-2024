import React, { createContext, useReducer } from 'react';
import themeReducer from '../reducers/themeReducer';
import { ThemeContextProps } from '../interfaces';

const initialState = {
    theme: 'light',
};

// Create Context
export const ThemeContext = createContext<ThemeContextProps>({
    themeState: initialState,
    dispatchTheme: () => null,
});

// Provider Component
export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = props => {
    const [themeState, dispatchTheme] = useReducer(themeReducer, initialState);

    return (
        <ThemeContext.Provider value={{ themeState, dispatchTheme }}>
            {props.children}
        </ThemeContext.Provider>
    );
};
