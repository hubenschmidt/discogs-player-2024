import { Router, Request, Response } from 'express';
import { getUser, getCollection, getRelease } from '../../controllers/discogsController'; // Update the path as needed

export const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json('discogs player endpoints');
});
router.get('/user/:username', getUser);
router.get('/collection/:username', getCollection);
router.get('/release/:release_id', getRelease);

export default router;
