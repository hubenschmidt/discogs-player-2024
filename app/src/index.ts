import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes';
import 'dotenv/config';
import cors from 'cors';
import checkAuth from './middleware/checkAuth';
const db = require('./models'); // Import your Sequelize instance
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

// Initialize Passport
// app.use(passport.initialize());

// Log the raw Authorization header before we attempt verification
app.use((req, res, next) => {
    console.log('→ Incoming Authorization header:', req.headers.authorization);
    next();
});

const jwtCheck = auth({
    audience: 'http://localhost:5000/',
    issuerBaseURL: 'https://dev-gzizexcaww2ggsh4.us.auth0.com/',
    tokenSigningAlg: 'RS256',
});

// enforce on all endpoints
app.use(jwtCheck);

app.get('/authorized', function (req, res) {
    console.trace(req);
    res.send('Secured Resource');
});

// Custom middleware for logging requests
app.use(morgan('combined'));

// Use the router for all routes
app.use(router);

// Error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     console.error(err.message);
//     res.status(500).json({ error: 'Internal Server Error' });
// });

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
