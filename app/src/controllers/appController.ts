import { Request, Response, NextFunction } from 'express';
import * as appService from '../services/appService';

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
