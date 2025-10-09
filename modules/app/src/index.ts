import express from 'express';
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

// 🔹 Sanity check route BEFORE auth
app.get('/is-alive', (req, res) => {
    res.status(200).send('OK!');
});

// app.use((req, res, next) => {
//     if (req.path.startsWith('/api')) {
//         console.log('Auth header:', req.headers);
//     }
//     next();
// });

// // ✅ use issuer + jwksUri together; do NOT use issuerBaseURL here
// const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

// const jwtCheck = auth({
//     issuer, // full URL with trailing slash
//     audience: process.env.AUTH0_AUDIENCE, // must exactly match your API Identifier
//     jwksUri: `${issuer}.well-known/jwks.json`,
//     tokenSigningAlg: 'RS256',
// });

// app.use(jwtCheck);

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
