const appService = require('../services/appService');

const search = async (req, res, next) => {
    try {
        const { username } = req.params;
        const searchResult = await appService.search(username, req.query);
        res.status(200).json(searchResult);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { email, username } = req.params;
        const user = await appService.getUser(email, username);
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const deleteCount = await appService.deleteUser(userId);
        res.status(200).json(deleteCount);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getCollection = async (req, res, next) => {
    try {
        const { username } = req.params;
        const collection = await appService.getCollection(username, req.query);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getStylesByGenre = async (req, res, next) => {
    try {
        const { genre } = req.params;
        const styles = await appService.getStylesByGenre(genre);
        res.status(200).json(styles);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updatePlayHistory = async (req, res, next) => {
    try {
        const { username, release_id } = req.params;
        const video = await appService.updatePlayHistory(username, release_id, req.body);
        res.status(200).json(video);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getHistory = async (req, res, next) => {
    try {
        const { username } = req.params;
        const history = await appService.getHistory(username, req.query);
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deletePlaylist = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { playlistId } = req.body;
        const deletedPlaylist = await appService.deletePlaylist(username, playlistId);
        res.status(200).json(deletedPlaylist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const createPlaylist = async (req, res, next) => {
    try {
        const { username } = req.params;
        const playlist = await appService.createPlaylist(username, req.body);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getPlaylists = async (req, res, next) => {
    try {
        const { username } = req.params;
        const playlists = await appService.getPlaylists(username, req.query);
        res.status(200).json(playlists);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const deleteFromPlaylist = async (req, res, next) => {
    try {
        const { playlistId, uri } = req.body;
        const entry = await appService.deleteFromPlaylist(playlistId, uri);
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const addToPlaylist = async (req, res, next) => {
    try {
        const { playlistId, uri } = req.body;
        const entry = await appService.addToPlaylist(playlistId, uri);
        res.status(200).json(entry);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getPlaylist = async (req, res, next) => {
    try {
        const { username, playlistId } = req.params;
        const playlist = await appService.getPlaylist(username, playlistId, req.query);
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getExplorer = async (req, res, next) => {
    try {
        const { username } = req.params;
        const explorer = await appService.getExplorer(username, req.query);
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
