import { Router } from 'express';
import { getCollection } from '../../controllers/appController';

export const router: Router = Router();

router.get('/collection/:username', getCollection);

export default router;
