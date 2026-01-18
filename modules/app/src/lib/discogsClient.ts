import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import 'dotenv/config';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
    const status = error.response?.status;
    return status === 429 || status === 503 || status === 502;
};

interface OAuthOptions {
    accessToken: string;
    accessTokenSecret: string;
}

// Builds a PLAINTEXT OAuth 1.0a Authorization header
const buildOAuthHeader = (
    consumerKey: string,
    consumerSecret: string,
    accessToken: string,
    accessTokenSecret: string,
): string => {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signatureMethod = 'PLAINTEXT';

    // PLAINTEXT signature = "<consumer_secret>&<access_token_secret>"
    const signature = `${consumerSecret}&${accessTokenSecret}`;

    const fields: Record<string, string> = {
        oauth_consumer_key: consumerKey,
        oauth_token: accessToken,
        oauth_nonce: nonce,
        oauth_signature_method: signatureMethod,
        oauth_signature: signature,
        oauth_timestamp: timestamp,
    };

    // “OAuth key="value", key="value", …”
    const header =
        'OAuth ' +
        Object.entries(fields)
            .map(([k, v]) => `${k}="${encodeURIComponent(v)}"`)
            .join(', ');

    return header;
};

/**
 * A generic Discogs client that signs requests with OAuth 1.0a (PLAINTEXT).
 * Includes retry logic with exponential backoff for rate limits (429) and server errors.
 *
 * @param endpoint       – the Discogs endpoint path (e.g. "database/search?q=nirvana")
 * @param requestMethod  – HTTP method ("GET", "POST", etc.)
 * @param body           – request body (for POST/PUT/PATCH)
 * @param auth           – OAuth options containing { accessToken, accessTokenSecret }
 */
const discogsClient = async (
    endpoint: string,
    requestMethod: HTTPMethod,
    body: any,
    auth: OAuthOptions,
) => {
    const BASE_URL = 'https://api.discogs.com';
    const CONSUMER_KEY = process.env.DISCOGS_CONSUMER_KEY!;
    const CONSUMER_SECRET = process.env.DISCOGS_CONSUMER_SECRET!;

    const headers: Record<string, string> = {
        'User-Agent': process.env.DISCOGS_USER_AGENT || 'YourApp/1.0',
        Accept: 'application/json',
    };

    headers.Authorization = buildOAuthHeader(
        CONSUMER_KEY,
        CONSUMER_SECRET,
        auth.accessToken,
        auth.accessTokenSecret,
    );

    let lastError: AxiosError | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await axios.request({
                method: requestMethod,
                url: `${BASE_URL}/${endpoint}`,
                headers,
                data: body,
            });
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            lastError = axiosError;

            if (attempt >= MAX_RETRIES || !shouldRetry(axiosError)) {
                throw error;
            }

            const delay = BASE_DELAY_MS * Math.pow(2, attempt);
            await sleep(delay);
        }
    }

    throw lastError;
};

export default discogsClient;
