const curatorService = require('../services/curatorService');
const repos = require('../repositories');

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
        const user = await repos.getUser(req);
        await curatorService.sendMessage(username, user.User_Id, sessionId ?? null, message, emit);
    } catch (error) {
        console.error(error);
        emit('error', { message: error.message || 'Internal server error' });
    } finally {
        res.end();
    }
};

const getSessions = async (req, res, next) => {
    try {
        const user = await repos.getUser(req);
        const sessions = await curatorService.getSessions(user.User_Id);
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
        const { stagedPlaylistId } = req.body;
        const user = await repos.getUser(req);
        const playlist = await curatorService.confirmStagedPlaylist(
            stagedPlaylistId,
            user.User_Id,
        );
        res.status(200).json(playlist);
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const discardPlaylist = async (req, res, next) => {
    try {
        const { stagedPlaylistId } = req.body;
        const user = await repos.getUser(req);
        const result = await curatorService.discardStagedPlaylist(
            stagedPlaylistId,
            user.User_Id,
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

module.exports = {
    sendMessage,
    getSessions,
    getSession,
    confirmPlaylist,
    discardPlaylist,
    updateStagedPlaylist,
};
