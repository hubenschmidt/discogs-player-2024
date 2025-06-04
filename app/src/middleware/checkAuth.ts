const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const passport = require('passport');

const getKey = (header: any, callback: any, attempt = 0) => {
    const maxAttempts = 3;

    try {
        const client = jwksClient({
            jwksUri: process.env.JWKS_URI,
        });

        const attemptRetrieval = () => {
            client.getSigningKey(header.kid, (err: any, key: any) => {
                if (!err && key) {
                    const signingKey = key.publicKey || key.rsaPublicKey;
                    return callback(null, signingKey);
                }

                console.error('Error retrieving the key:', err);

                attempt++;
                if (attempt >= maxAttempts) {
                    return callback(err || new Error('Key is missing'));
                }

                console.log(`Retrying... Attempt ${attempt + 1}`);
                attemptRetrieval(); // Retry
            });
        };

        attemptRetrieval();
    } catch (error) {
        console.trace('Synchronous error in getKey:', error);
        callback(error);
    }
};

const jwtVerify = (req: any, res: any, next: any, token: any) => {
    console.trace(token, 'token exists');
    jwt.verify(
        token,
        getKey,
        {
            algorithms: ['RS256'],
            issuer: `https://${process.env.AUTH0_DOMAIN}`,
            audience: process.env.AUTH0_AUDIENCE,
        },
        (err: any, decoded: any) => {
            if (err) {
                console.trace(err);
                return res.sendStatus(403);
            }

            req.user = decoded;
            next();
        },
    );
};

const passportWrapper = (req: any, res: any, next: any, strategyKey: any) => {
    return passport.authenticate(
        strategyKey,
        { session: false },
        (err: any, user: any, info: any) => {
            if (err) return next(err);
            if (!user)
                return res
                    .status(401)
                    .send(info?.message || 'Authentication failed');
            req.user = user;
            next();
        },
    )(req, res, next);
};

const checkAuth = (req: any, res: any, next: any): any => {
    // Bypass authentication for the /api/docs route
    if (req.path.startsWith('/docs')) {
        return next();
    }

    try {
        // Handle SSE requests with query parameter authentication
        if (req?.path?.endsWith('/sse-connect')) {
            return jwtVerify(req, res, next, req.query.auth);
        }

        // Use API Key strategy only on /v1 routes
        if (req?.path?.startsWith('/v1')) {
            return passportWrapper(req, res, next, 'helios-api-key');
        }
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).send('Unauthorized');
        }

        const token = authHeader.split(' ')[1]; // Authorization: 'Bearer TOKEN'

        if (!token || typeof token !== 'string') {
            return res.status(400).send('Invalid Authorization header format');
        }

        jwtVerify(req, res, next, token);
    } catch (error) {
        console.trace(error);
        throw error;
    }
};

export default checkAuth;
