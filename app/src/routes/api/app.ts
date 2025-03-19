import { Router } from 'express';
import {
    getCollection,
    getStylesByGenre,
    search,
} from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username/:genre?/:style?', getCollection);
router.get('/styles/:genre', getStylesByGenre);
router.get('/search/:username', search);

export default router;
