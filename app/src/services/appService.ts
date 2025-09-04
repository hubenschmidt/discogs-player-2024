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

export const updatePlayHistory = async (req: Request) => {
    const user = await repos.getUser(req);
    const video = await repos.updateVideoPlayCount(req, user);
    const historyEntry = await repos.createHistoryEntry(req, user, video);
    return { video, historyEntry };
};

export const createPlaylist = async (req: Request) => {
    const user = await repos.getUser(req);

    let video = undefined;
    if (req.body?.video) video = await repos.getVideo(req);
    console.log(video);

    const playlist = await repos.createPlaylist(req, user, video);
    return playlist;
};

export const getPlaylists = async (req: Request) => {
    const user = await repos.getUser(req);
    const playlists = await repos.getPlaylists(req, user);
    return playlists;
};
