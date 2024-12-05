import { Request, Response } from 'express';
import { fetchIdentity } from '../lib/oauth';

export const getIdentity = async (req: Request, res: Response) => {
    try {
        const identity = await fetchIdentity();
        res.json({ success: true, identity });
    } catch (error) {
        console.error('Error in getIdentity:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user identity' });
    }
};
