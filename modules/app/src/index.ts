import express from 'express';
import type { ErrorRequestHandler } from 'express';
import router from './routes';
import 'dotenv/config';
import cors from 'cors';
const morgan = require('morgan');
const errorHandler = require('./lib/error-handler');
const { auth } = require('express-oauth2-jwt-bearer');

// Create the Express application
const app = express();

/**
 * middleware
 */
app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded

import axios from 'axios';

app.get('/diag/jwks', async (_req, res) => {
    const issuer = `https://${process.env.AUTH0_DOMAIN}/`;
    const jwks = `${issuer}.well-known/jwks.json`;
    const openid = `${issuer}.well-known/openid-configuration`;

    try {
        const [openidRes, jwksRes] = await Promise.all([
            axios.get(openid, { timeout: 8000 }),
            axios.get(jwks, { timeout: 8000 }),
        ]);

        res.json({
            openid_status: openidRes.status,
            jwks_status: jwksRes.status,
            openid_snippet: openidRes.data
                ? JSON.stringify(openidRes.data).slice(0, 200)
                : 'no data',
            jwks_snippet: jwksRes.data
                ? JSON.stringify(jwksRes.data).slice(0, 200)
                : 'no data',
        });
    } catch (e: any) {
        // Axios errors include additional context
        console.error('JWKS/OPENID fetch failed:', {
            message: e.message,
            code: e.code,
            errno: e.errno,
            syscall: e.syscall,
            hostname: e.hostname,
            responseStatus: e.response?.status,
            responseData: e.response?.data,
        });

        res.status(500).json({
            error: e.message,
            code: e.code,
            errno: e.errno,
            syscall: e.syscall,
            hostname: e.hostname,
            status: e.response?.status,
            data: e.response?.data,
        });
    }
});

const issuer = `https://${process.env.AUTH0_DOMAIN}/`;
console.log('AUTH0_AUDIENCE:', process.env.AUTH0_AUDIENCE);
console.log('issuerBaseURL: ', issuer);
const jwtCheck = auth({
    issuerBaseURL: issuer, // full URL with trailing slash
    audience: process.env.AUTH0_AUDIENCE, // must exactly match your API Identifier
    jwksUri: `${issuer}.well-known/jwks.json`,
    tokenSigningAlg: 'RS256',
});

app.use(jwtCheck);

const authErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    if (err && (err as any).message) {
        console.error('Auth middleware error:', {
            code: (err as any).code,
            message: (err as any).message,
            stack: err.stack,
        });
        res.status(401).json({
            message: (err as any).message,
            code: (err as any).code,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        });
        return; // ensure void
    }
    next(err);
};

// after app.use(jwtCheck)
app.use(authErrorHandler);

// Custom middleware for logging requests
app.use(morgan('combined'));

// Use the router for all routes
app.use(router);

// Error handling middleware
app.use(errorHandler);

const port = Number(process.env.PORT || 8080); // matches your DO env + http_port
app.get('/', (req, res) => {
    res.status(200).send('ok');
}); // fast health response

app.listen(port, '0.0.0.0', () => {
    console.log(`listening on 0.0.0.0:${port}`);
});
