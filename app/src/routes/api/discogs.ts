import { Router, Request, Response } from 'express';
import { getUser, getCollection, getRelease, syncCollection } from '../../controllers/discogsController';

export const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json('discogs player endpoints');
});
router.get('/user/:username', getUser);
router.get('/collection/:username', getCollection);
router.get('/release/:release_id', getRelease);
router.get('/sync-collection/:username', syncCollection);

export default router;
