const axios = require('axios');
const crypto = require('crypto');
require('dotenv/config');

const fetchDiscogsToken = async (
    endpoint,
    method,
    extraParams,
    requestTokenSecret,
) => {
    const BASE = 'https://api.discogs.com/';
    const url = `${BASE}${endpoint}`;
    const CK = process.env.DISCOGS_CONSUMER_KEY;
    const CS = process.env.DISCOGS_CONSUMER_SECRET;

    // --- build OAuth values -----------------------------------
    const nonce = crypto.randomBytes(16).toString('hex');
    const ts = Math.floor(Date.now() / 1000).toString();
    const sigMethod = 'PLAINTEXT';

    // signature = "consumer_secret&" for request_token
    // or      = "consumer_secret&request_token_secret" for access_token
    const signature =
        endpoint === 'oauth/request_token'
            ? `${CS}&`
            : `${CS}&${requestTokenSecret}`;

    // assemble the base OAuth fields
    const oauthFields = {
        oauth_consumer_key: CK,
        oauth_nonce: nonce,
        oauth_signature_method: sigMethod,
        oauth_signature: signature,
        oauth_timestamp: ts,
        ...extraParams, // adds oauth_callback or oauth_verifier
    };

    // stringify into header format: key="value", key="value", …
    const authHeader =
        'OAuth ' +
        Object.entries(oauthFields)
            .map(([k, v]) => `${k}="${v}"`)
            .join(', ');

    // --- fire the HTTP request -------------------------------
    const res =
        method === 'GET'
            ? await axios.get(url, {
                  headers: {
                      Authorization: authHeader,
                      'User-Agent': 'discogs-player/1.0 +https://yourapp.com',
                  },
                  timeout: 10_000,
              })
            : await axios.post(url, null, {
                  headers: {
                      Authorization: authHeader,
                      'User-Agent': 'discogs-player/1.0 +https://yourapp.com',
                  },
                  timeout: 10_000,
              });

    return res.data;
};

/**
 * Step 1: fetch a request token
 */
const getDiscogsRequestToken = async () => {
    const CB = process.env.DISCOGS_AUTH_CALLBACK_URL;
    return fetchDiscogsToken(
        'oauth/request_token',
        'GET',
        {
            oauth_callback: CB,
        },
        null,
    );
};

/**
 * Steps 3–5: exchange request token + verifier for access credentials
 */
const getDiscogsAccessToken = (req, requestTokenSecret) => {
    const { body } = req;
    const { oauth_token, oauth_verifier } = body;

    return fetchDiscogsToken(
        'oauth/access_token',
        'POST',
        {
            oauth_token: oauth_token,
            oauth_verifier: oauth_verifier,
        },
        requestTokenSecret,
    );
};

module.exports = { getDiscogsRequestToken, getDiscogsAccessToken };
