import { Router } from 'express';
import {
    fetchUser,
    fetchRelease,
    fetchCollection,
    syncCollection,
    fetchRequestToken,
    fetchAccessToken,
} from '../../controllers/discogsController';

export const router: Router = Router();

router.get('/user/:username', fetchUser);
router.get('/release/:release_id', fetchRelease);
router.get('/collection/:username', fetchCollection);
router.get('/sync-collection/:username', syncCollection);
router.get('/fetch-request-token', fetchRequestToken);
router.post('/fetch-access-token', fetchAccessToken);

export default router;
