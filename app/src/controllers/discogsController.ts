import { Request, Response, NextFunction } from 'express';
import * as discogsService from '../services/discogsService';

export const syncCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const syncedCollection = await discogsService.syncCollection(req);
        res.status(200).json(syncedCollection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = await discogsService.fetchUser(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const fetchRelease = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = await discogsService.fetchRelease(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
