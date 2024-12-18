// You can include shared interfaces/types in a separate file
// and then use them in any component by importing them. For
// example, to import the interface below do:
//
// import { User } from 'path/to/interfaces';

import React, { Dispatch } from 'react';

export interface ThemeContextProps {
    themeState: ThemeState;
    dispatchTheme: Dispatch<Action>;
}

export interface ThemeState {
    theme: string;
}

export interface Action {
    type: string;
    payload: any;
}

export interface ThemeAction extends Action {
    type: 'SET_THEME';
}
