import { Router } from 'express';
import {
    getCollection,
    getStylesByGenre,
} from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username/:genre?/:style?', getCollection);
router.get('/styles/:genre', getStylesByGenre);

export default router;
