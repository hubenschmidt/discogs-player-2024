import { Router } from 'express';
import {
    getCollection,
    getStylesByGenre,
    search,
    getUser,
    updatePlayHistory,
    createPlaylist,
} from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username/:genre?/:style?', getCollection);
router.get('/styles/:genre', getStylesByGenre);
router.get('/search/:username', search);
router.get('/user/:email', getUser);
router.post('/:username/release/:release_id/video', updatePlayHistory);
router.post('/:username/playlist/create', createPlaylist);

export default router;
