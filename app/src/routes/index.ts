import { Router } from 'express';
import apiRoutes from './api';
const router: Router = Router();

router.use('/api', apiRoutes);

// Health check endpoint
router.get('/healthz', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

export default router;
