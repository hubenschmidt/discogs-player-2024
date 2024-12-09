import { Request, Response, NextFunction } from 'express';
import * as discogsService from '../services/discogsService';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = await discogsService.getUser(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

// deprecate in favor of sync
export const getCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collection = await discogsService.getCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const syncCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const syncedCollection = await discogsService.syncCollection(req);
        res.status(200).json(syncedCollection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

export const getRelease = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { data } = await discogsService.getRelease(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
