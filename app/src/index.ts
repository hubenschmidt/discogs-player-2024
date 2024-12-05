import express, { Application, Request, Response, NextFunction } from 'express';
import router from './routes';
import 'dotenv/config';
import 'cors';
const morgan = require('morgan');

// Create the Express application
const app: Application = express();

// Use the router for all routes
app.use(router);

// Middleware to parse JSON
app.use(express.json());

// Custom middleware for logging requests
app.use(morgan('combined'));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
