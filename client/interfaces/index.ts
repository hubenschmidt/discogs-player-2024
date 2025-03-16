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

export interface Video {
    uri: string;
    title: string;
    description?: string;
    duration: number;
    embed: boolean;
}

export interface Release {
    Release_Id: number;
    Title: string;
    Cover_Image?: string;
    Thumb?: string;
}

export interface DiscogsRelease {
    videos?: Video[];
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
