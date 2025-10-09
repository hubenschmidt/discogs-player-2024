import type { NextApiRequest, NextApiResponse } from 'next';

type Data = { accessToken?: string; error?: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    const {
        AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET,
        AUTH0_AUDIENCE,
        AUTH0_DOMAIN,
    } = process.env;

    // Validate env at runtime (especially in DO)
    const missing = [
        'AUTH0_CLIENT_ID',
        'AUTH0_CLIENT_SECRET',
        'AUTH0_AUDIENCE',
        'AUTH0_DOMAIN',
    ].filter(k => !process.env[k as keyof NodeJS.ProcessEnv]);
    if (missing.length) {
        return res
            .status(500)
            .json({ error: `Missing env vars: ${missing.join(', ')}` });
    }

    try {
        const payload = {
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            audience: AUTH0_AUDIENCE, // must match API Identifier EXACTLY
            grant_type: 'client_credentials',
        };

        const auth0Res = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        // If Auth0 returns an error, forward it so you can see it
        if (!auth0Res.ok) {
            const text = await auth0Res.text(); // may be JSON; we just bubble the raw text
            return res
                .status(auth0Res.status)
                .json({ error: `Auth0 error: ${text}` });
        }

        const data = (await auth0Res.json()) as { access_token: string };
        return res.status(200).json({ accessToken: data.access_token });
    } catch (e: any) {
        console.error('Error in /api/get-token:', e);
        return res
            .status(500)
            .json({ error: 'Internal error contacting Auth0' });
    }
}
