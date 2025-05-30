import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes';
import 'dotenv/config';
import cors from 'cors';
const db = require('./models'); // Import your Sequelize instance
const morgan = require('morgan');
const errorHandler = require('./lib/error-handler');

// Create the Express application
const app = express();

/**
 * middleware
 */
app.use(cors());

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded

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
