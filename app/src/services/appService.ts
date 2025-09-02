import { Request } from 'express';
import * as repos from '../repositories';

export const search = async (req: Request) => {
    return await repos.search(req);
};

export const getUser = async (req: Request) => {
    return await repos.getUser(req);
};

export const getCollection = async (req: Request) => {
    return await repos.getCollection(req);
};

export const getStylesByGenre = async (req: Request) => {
    return await repos.getStylesByGenre(req);
};

export const updateVideoPlayCount = async (req: Request) => {
    const userId = await repos.getUserId(req);
    const video = await repos.updateVideoPlayCount(req, userId);
    return video;
};
