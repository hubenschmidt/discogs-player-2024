import { Router } from 'express';
import discogsRoutes from './discogs';
import appRoutes from './app';
export const router: Router = Router();

router.use('/discogs', discogsRoutes);
router.use('/app', appRoutes);

export default router;
