import { Request } from 'express';
import * as repos from '../repositories';

export const search = async (req: Request) => {
    return await repos.search(req);
};

export const getUser = async(req:Request)=>{
    return await repos.getUser(req);
}

export const getCollection = async (req: Request) => {
    return await repos.getCollection(req);
};

export const getStylesByGenre = async (req: Request) => {
    return await repos.getStylesByGenre(req);
};
