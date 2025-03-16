import { Dispatch } from 'react';

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

// types.ts (or wherever you keep your types)
export interface Release {
    Release_Id: number;
    Title: string;
    Cover_Image?: string;
    Thumb?: string;
    // ... etc
}

export interface CollectionResponse {
    user: {
        username: string;
    };
    totalReleases: number;
    currentPage: number;
    totalPages: number;
    releases: Release[];
}
