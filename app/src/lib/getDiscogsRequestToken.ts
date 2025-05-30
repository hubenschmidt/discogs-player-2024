import axios from 'axios';
import crypto from 'crypto';
import 'dotenv/config';

/**
 * Step 1 of Discogs 3‑legged OAuth.
 * Returns { oauth_token, oauth_token_secret, oauth_callback_confirmed }
 */
export const getDiscogsRequestToken = async () => {
    try {
        const BASE_URL = 'https://api.discogs.com/oauth/request_token';
        const CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY;
        const CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET;
        const CALLBACK_URL = 'https://localhost:5000/auth/discogs/callback'; // e.g. https://your‑api.com/discogs/callback

        // --- OAuth boilerplate ----------------------------------------------------
        const nonce = crypto.randomBytes(16).toString('hex');
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signatureMethod = 'PLAINTEXT';
        // No token yet, so signature = "<consumer_secret>&"
        const signature = `${CONSUMER_SECRET}&`;

        const authorizationHeader = [
            `OAuth oauth_consumer_key="${CONSUMER_KEY}"`,
            `oauth_nonce="${nonce}"`,
            `oauth_signature="${signature}"`,
            `oauth_signature_method="${signatureMethod}"`,
            `oauth_timestamp="${timestamp}"`,
            `oauth_callback="${CALLBACK_URL}"`,
        ].join(', ');

        // --- HTTP request ---------------------------------------------------------
        const res = await axios.get<string>(BASE_URL, {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'you-can-dig-it/1.0 +https://yourapp.com', // REQUIRED by Discogs
            },
            // no query/body params for this endpoint
            timeout: 10_000,
        });

        // Discogs responds with a raw query‑string: "oauth_token=...&oauth_token_secret=..."
        return res.data;
    } catch (error) {
        console.log(error);
    }
};

export default getDiscogsRequestToken;
