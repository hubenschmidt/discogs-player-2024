const { Router } = require('express');
const {
    getCollection,
    getStylesByGenre,
    search,
    getUser,
    updatePlayHistory,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    getPlaylists,
    getPlaylist,
    getHistory,
    getExplorer,
    deleteFromPlaylist,
    deleteUser,
} = require('../../controllers/appController');

const router = Router();

router.get('/collection/:username', getCollection);
router.get('/styles/:genre', getStylesByGenre);
router.get('/search/:username', search);
router.get('/user/:email', getUser);
router.post('/:username/release/:release_id/video', updatePlayHistory);
router.post('/:username/playlist/create', createPlaylist);
router.post('/:username/playlist/delete', deletePlaylist);
router.post('/:username/playlist/add', addToPlaylist);
router.post('/:username/playlist/delete-from', deleteFromPlaylist);
router.get('/:username/playlist/all', getPlaylists);
router.get('/:username/playlist/:playlistId', getPlaylist);
router.get('/:username/history', getHistory);
router.get('/:username/explorer', getExplorer);
router.post('/user/delete', deleteUser);

module.exports = router;
