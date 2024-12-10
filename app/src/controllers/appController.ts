import { Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';

export const getCollection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const collection = await appService.getCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};
