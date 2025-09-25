import { Router } from 'express';
import {
    getCollection,
    getStylesByGenre,
    search,
    getUser,
    updatePlayHistory,
    createPlaylist,
    addToPlaylist,
    getPlaylists,
    getPlaylist,
    getHistory,
    getExplorer,
} from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username/:genre?/:style?', getCollection);
router.get('/styles/:genre', getStylesByGenre);
router.get('/search/:username', search);
router.get('/user/:email', getUser);
router.post('/:username/release/:release_id/video', updatePlayHistory);
router.post('/:username/playlist/create', createPlaylist);
router.post('/:username/playlist/add', addToPlaylist);
router.get('/:username/playlist/all', getPlaylists);
router.get('/:username/playlist/:playlistId', getPlaylist);
router.get('/:username/history', getHistory);
router.get('/:username/explorer', getExplorer);

export default router;
