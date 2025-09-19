import { Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';
import { nextTick } from 'process';

export const search = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const searchResult = await appService.search(req);
        res.status(200).json(searchResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const user = await appService.getUser(req);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getCollection = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const collection = await appService.getCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getStylesByGenre = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const styles = await appService.getStylesByGenre(req);
        res.status(200).json(styles);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const updatePlayHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const video = await appService.updatePlayHistory(req);
        res.status(200).json(video);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getHistory = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const history = await appService.getHistory(req);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const createPlaylist = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const playlist = await appService.createPlaylist(req);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getPlaylists = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const playlists = await appService.getPlaylists(req);
        res.status(200).json(playlists);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const addToPlaylist = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const entry = await appService.addToPlaylist(req);
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getPlaylist = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const playlist = await appService.getPlaylist(req);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
