import axios from 'axios';
import 'dotenv/config';
import discogsClient from './discogsClient';

// Function to fetch user identity (example API call)
export const fetchIdentity = async () => {
    try {
        const response = await discogsClient.get('/oauth/identity');
        console.log('User Identity:', response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching user identity:', error.response?.data || error.message);
            throw new Error(`Axios error: ${error}`);
        }
        console.error('An unknown error occurred', error);
        throw new Error('An unknown error occurred');
    }
};

// Function to make a generic Discogs API call
export const makeDiscogsApiCall = async (endpoint: string, params: Record<string, any> = {}) => {
    try {
        const response = await discogsClient.get(endpoint, { params });
        // console.log(`Response from ${endpoint}:`, response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error making API call to ${endpoint}:`, error.response?.data || error.message);
            throw new Error(`Axios error: ${error.response?.data || error.message}`);
        }
        throw new Error('An unknown error occurred');
    }
};
