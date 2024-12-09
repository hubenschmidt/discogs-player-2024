import { Request } from 'express';
import * as repos from '../repositories';

export const getCollection = async (req: Request): Promise<any> => {
    const collection = await repos.getCollection(req);
    return collection;
};
