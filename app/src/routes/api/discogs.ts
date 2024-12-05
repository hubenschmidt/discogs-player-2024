import { Router, Request, Response } from 'express';
import { fetchRecordCollection, fetchOneRecordWithLinkedVideos } from '../../controllers/discogsController'; // Update the path as needed

export const router: Router = Router();

// Default endpoint for Discogs
router.get('/', (req: Request, res: Response) => {
    res.json('discogs player endpoints');
});

// Endpoint to fetch record collection
router.get('/collection', async (req: Request, res: Response) => {
    const username = (req.query.username as string) || 'hubenschmidt'; // Expect username in query params
    const folderId = parseInt(req.query.folderId as string, 10) || 0; // Default to folderId 0 if not provided

    if (!username) {
        res.status(400).json({ error: 'Missing username parameter' });
        return;
    }

    try {
        const records = await fetchRecordCollection(username, folderId);
        res.json(records);
    } catch (error) {
        console.error('Error fetching record collection:', error);
        res.status(500).json({ error: 'Failed to fetch record collection' });
    }
});

// Endpoint to fetch a single record with linked videos
router.get('/record/:releaseId', async (req: Request, res: Response) => {
    const releaseId = parseInt(req.params.releaseId, 10);

    if (!releaseId) {
        res.status(400).json({ error: 'Invalid or missing release ID' });
        return;
    }

    try {
        const recordWithVideos = await fetchOneRecordWithLinkedVideos(releaseId);
        res.json(recordWithVideos);
    } catch (error) {
        console.error(`Error fetching record with release ID ${releaseId}:`, error);
        res.status(500).json({ error: 'Failed to fetch record with videos' });
    }
});

export default router;
