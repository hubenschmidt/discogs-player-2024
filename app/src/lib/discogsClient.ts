import axios, { AxiosInstance } from 'axios';
import 'dotenv/config';

// Discogs API Base URL
const BASE_URL = 'https://api.discogs.com';

// Discogs Personal Access Token (Store securely in environment variables)
const PERSONAL_ACCESS_TOKEN = process.env.DISCOGS_TOKEN;

// Create an Axios instance with the token preconfigured
const discogsClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        Authorization: `Discogs token=${PERSONAL_ACCESS_TOKEN}`,
        'User-Agent': 'YourAppName/1.0 +http://yourwebsite.com',
    },
});

export default discogsClient;
