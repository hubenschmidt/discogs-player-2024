import { Router } from 'express';
import { getIdentity } from '../../controllers/authController';

const router = Router();

// Route to fetch user identity
router.get('/identity', getIdentity);

export default router;
