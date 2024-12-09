import { Request, Response, NextFunction } from 'express';
import * as discogsService from '../services/discogsService';

export const getUser = (req: Request, res: Response, next: NextFunction) => {
    discogsService
        .getUser(req, res, next)
        .then(user => {
            res.status(200).json({ user });
        })
        .catch(err => {
            next(err);
        });
};

export const getCollection = (req: Request, res: Response, next: NextFunction) => {
    discogsService
        .getCollection(req, res, next)
        .then(collection => {
            res.status(200).json({ collection });
        })
        .catch(err => {
            next(err);
        });
};

export const getRelease = (req: Request, res: Response, next: NextFunction) => {
    discogsService
        .getRelease(req, res, next)
        .then(collection => {
            res.status(200).json({ collection });
        })
        .catch(err => {
            next(err);
        });
};
