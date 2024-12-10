import { Router } from 'express';
import { getCollection } from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username/:genre', getCollection);

export default router;
