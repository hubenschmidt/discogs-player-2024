const discogsService = require('../services/discogsService');

const fetchRequestToken = async (req, res, next) => {
    try {
        const data = await discogsService.fetchRequestToken();
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const fetchAccessToken = async (req, res, next) => {
    try {
        const data = await discogsService.fetchAccessToken(req);
        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const syncCollection = async (req, res, next) => {
    try {
        const syncedCollection = await discogsService.syncCollection(req);
        res.status(200).json(syncedCollection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const fetchCollection = async (req, res, next) => {
    try {
        const collection = await discogsService.fetchCollection(req);
        res.status(200).json(collection);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const fetchRelease = async (req, res, next) => {
    try {
        const release = await discogsService.fetchRelease(req);
        res.status(200).json(release);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    fetchRequestToken,
    fetchAccessToken,
    syncCollection,
    fetchCollection,
    fetchRelease,
};
