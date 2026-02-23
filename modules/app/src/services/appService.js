const repos = require('../repositories');

const search = async (req) => {
    return await repos.search(req);
};

const getUser = async (req) => {
    return await repos.getUser(req);
};

const deleteUser = async (req) => {
    return await repos.deleteUser(req);
};

const getCollection = async (req) => {
    return await repos.getCollection(req);
};

const getStylesByGenre = async (req) => {
    return await repos.getStylesByGenre(req);
};

const updatePlayHistory = async (req) => {
    const user = await repos.getUser(req);
    const video = await repos.updateVideoPlayCount(req, user);
    const historyEntry = await repos.createHistoryEntry(req, user, video);
    return { video, historyEntry };
};

const getHistory = async (req) => {
    const user = await repos.getUser(req);
    return await repos.getHistory(req, user);
};

const deletePlaylist = async (req) => {
    const user = await repos.getUser(req);
    return await repos.deletePlaylist(req, user);
};

const createPlaylist = async (req) => {
    const user = await repos.getUser(req);

    let video = undefined;
    if (req.body?.video) video = await repos.getVideo(req);

    const playlist = await repos.createPlaylist(req, user, video);
    return playlist;
};

const getPlaylists = async (req) => {
    const user = await repos.getUser(req);
    const playlists = await repos.getPlaylists(req, user);
    return playlists;
};

const deleteFromPlaylist = async (req) => {
    const entry = await repos.deleteFromPlaylist(req);
    return entry;
};

const addToPlaylist = async (req) => {
    const entry = await repos.addToPlaylist(req);
    return entry;
};

const getPlaylist = async (req) => {
    const user = await getUser(req);
    const playlist = await repos.getPlaylist(req, user);
    return playlist;
};

const getExplorer = async (req) => {
    const explorer = await repos.getExplorer(req);
    return explorer;
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
