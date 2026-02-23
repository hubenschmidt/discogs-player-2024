const appService = require('../services/appService');

const search = async (req, res, next) => {
    try {
        const searchResult = await appService.search(req);
        res.status(200).json(searchResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const user = await appService.getUser(req);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const deleteCount = await appService.deleteUser(req);
        res.status(200).json(deleteCount);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getCollection = async (req, res, next) => {
    try {
        const collection = await appService.getCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getStylesByGenre = async (req, res, next) => {
    try {
        const styles = await appService.getStylesByGenre(req);
        res.status(200).json(styles);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updatePlayHistory = async (req, res, next) => {
    try {
        const video = await appService.updatePlayHistory(req);
        res.status(200).json(video);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const history = await appService.getHistory(req);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deletePlaylist = async (req, res, next) => {
    try {
        const deletedPlaylist = await appService.deletePlaylist(req);
        res.status(200).json(deletedPlaylist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createPlaylist = async (req, res, next) => {
    try {
        const playlist = await appService.createPlaylist(req);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getPlaylists = async (req, res, next) => {
    try {
        const playlists = await appService.getPlaylists(req);
        res.status(200).json(playlists);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteFromPlaylist = async (req, res, next) => {
    try {
        const entry = await appService.deleteFromPlaylist(req);
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const addToPlaylist = async (req, res, next) => {
    try {
        const entry = await appService.addToPlaylist(req);
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getPlaylist = async (req, res, next) => {
    try {
        const playlist = await appService.getPlaylist(req);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getExplorer = async (req, res, next) => {
    try {
        const explorer = await appService.getExplorer(req);
        res.status(200).json(explorer);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    search,
    getUser,
    deleteUser,
    getCollection,
    getStylesByGenre,
    updatePlayHistory,
    getHistory,
    deletePlaylist,
    createPlaylist,
    getPlaylists,
    deleteFromPlaylist,
    addToPlaylist,
    getPlaylist,
    getExplorer,
};
