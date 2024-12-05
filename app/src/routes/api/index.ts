import { Router, Request, Response } from 'express';
import discogsRoutes from './discogs';
export const router: Router = Router();

router.use('/discogs', discogsRoutes);

export default router;
