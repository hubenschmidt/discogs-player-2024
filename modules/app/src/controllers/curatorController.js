const curatorService = require('../services/curatorService');
const embeddingService = require('../services/embeddingService');
const enrichmentService = require('../services/enrichmentService');

const sendMessage = async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const emit = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
        const { username } = req.params;
        const { sessionId, message } = req.body;
        await curatorService.sendMessage(username, sessionId ?? null, message, emit);
    } catch (error) {
        console.error(error);
        emit('error', { message: error.message || 'Internal server error' });
    } finally {
        res.end();
    }
};

const getSessions = async (req, res, next) => {
    try {
        const { username } = req.params;
        const sessions = await curatorService.getSessions(username);
        res.status(200).json(sessions);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const getSession = async (req, res, next) => {
    try {
        const sessionId = Number(req.params.id);
        const session = await curatorService.getSession(sessionId);
        res.status(200).json(session);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const confirmPlaylist = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { stagedPlaylistId } = req.body;
        const playlist = await curatorService.confirmStagedPlaylist(
            username,
            stagedPlaylistId,
        );
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const discardPlaylist = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { stagedPlaylistId } = req.body;
        const result = await curatorService.discardStagedPlaylist(
            username,
            stagedPlaylistId,
        );
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const updateStagedPlaylist = async (req, res, next) => {
    try {
        const { stagedPlaylistId, videoIds } = req.body;
        const result = await curatorService.updateStagedPlaylist(
            stagedPlaylistId,
            videoIds,
        );
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const semanticSearch = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { query } = req.body;
        const results = await embeddingService.vectorSearch(query, username, 10);
        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const embedCollection = async (req, res, next) => {
    try {
        const { username } = req.params;
        const result = await embeddingService.backfillUser(username);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const enrichCollection = async (req, res, next) => {
    try {
        const { username } = req.params;
        const result = await enrichmentService.enrichCollection(username);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

module.exports = {
    sendMessage,
    getSessions,
    getSession,
    confirmPlaylist,
    discardPlaylist,
    updateStagedPlaylist,
    embedCollection,
    semanticSearch,
    enrichCollection,
};
