import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
    accessToken?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
) {
    console.log('handleris called');
    try {
        const payload = {
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: process.env.AUTH0_AUDIENCE,
            grant_type: 'client_credentials',
        };
        console.log(process.env.AUTH0_DOMAIN, 'called');

        const auth0Res = await fetch(
            `${process.env.AUTH0_DOMAIN}/oauth/token`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            },
        );

        const data = (await auth0Res.json()) as {
            access_token: string;
            expires_in: number;
            token_type: string;
        };

        return res.status(200).json({ accessToken: data.access_token });
    } catch (e: any) {
        console.error('Error in /api/auth/get-token:', e);
    }
}
