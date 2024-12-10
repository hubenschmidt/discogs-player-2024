import { Request } from 'express';
import * as repos from '../repositories';

export const getCollection = async (req: Request): Promise<any> => {
    return await repos.getCollection(req);
};

export const getStylesByGenre = async (req: Request): Promise<any> => {
    return await repos.getStylesByGenre(req);
};
