import { Request, Response, NextFunction } from 'express';
import * as discogsService from '../services/discogsService';

export const fetchRequestToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await discogsService.fetchRequestToken();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const fetchAccessToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const data = await discogsService.fetchAccessToken(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const syncCollection = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const syncedCollection = await discogsService.syncCollection(req);
        res.status(200).json(syncedCollection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const fetchCollection = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const collection = await discogsService.fetchCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const fetchRelease = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { data } = await discogsService.fetchRelease(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
