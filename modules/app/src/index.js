const express = require('express');
const router = require('./routes');
require('dotenv/config');
const cors = require('cors');
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

const issuer = `https://${process.env.AUTH0_DOMAIN}/`;

const jwtCheck = auth({
    issuerBaseURL: issuer, // full URL with trailing slash
    audience: process.env.AUTH0_AUDIENCE, // must exactly match your API Identifier
});

app.use(jwtCheck);

// Custom middleware for logging requests
app.use(morgan('combined'));

// Use the router for all routes
app.use(router);

// Error handling middleware
app.use(errorHandler);

const port = Number(process.env.PORT || 8080);
app.get('/', (req, res) => {
    res.status(200).send('ok');
}); // fast health response

app.listen(port, '0.0.0.0', () => {
    console.log(`listening on 0.0.0.0:${port}`);
});
