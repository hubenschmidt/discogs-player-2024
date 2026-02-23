const repos = require('../repositories');

const search = async (username, query) => repos.search(username, query);

const getUser = async (email, username) => repos.getUser({ email, username });

const deleteUser = async (userId) => repos.deleteUser(userId);

const getCollection = async (username, query) => repos.getCollection(username, query);

const getStylesByGenre = async (genre) => repos.getStylesByGenre(genre);

const updatePlayHistory = async (username, releaseId, body) => {
    const user = await repos.getUser({ username });
    const video = await repos.updateVideoPlayCount(releaseId, body, user);
    const historyEntry = await repos.createHistoryEntry(releaseId, user, video);
    return { video, historyEntry };
};

const getHistory = async (username, query) => {
    const user = await repos.getUser({ username });
    return repos.getHistory(query, user);
};

const deletePlaylist = async (username, playlistId) => {
    const user = await repos.getUser({ username });
    return repos.deletePlaylist(playlistId, user);
};

const createPlaylist = async (username, body) => {
    const user = await repos.getUser({ username });

    let video = undefined;
    if (body?.video) video = await repos.getVideo(body.video.uri);

    const playlist = await repos.createPlaylist({ name: body.name, description: body.description }, user, video);
    return playlist;
};

const getPlaylists = async (username, query) => {
    const user = await repos.getUser({ username });
    const playlists = await repos.getPlaylists(query, user);
    return playlists;
};

const deleteFromPlaylist = async (playlistId, uri) => {
    const entry = await repos.deleteFromPlaylist(playlistId, uri);
    return entry;
};

const addToPlaylist = async (playlistId, uri) => {
    const entry = await repos.addToPlaylist(playlistId, uri);
    return entry;
};

const getPlaylist = async (username, playlistId, query) => {
    const user = await repos.getUser({ username });
    const playlist = await repos.getPlaylist(playlistId, query, user);
    return playlist;
};

const getExplorer = async (username, query) => repos.getExplorer(username, query);

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
