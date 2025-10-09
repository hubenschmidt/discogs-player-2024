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

// validate bearerToken is from a trusted source
const jwtCheck = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`, // whubenschmidt@gmail.com Auth0 Tenant
    // issuerBaseURL: 'https://dev-i6pidxzic85x5kuy.us.auth0.com/', // locked-out Github-Auth0 Tenant
    tokenSigningAlg: 'RS256',
});
app.use(jwtCheck);

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
