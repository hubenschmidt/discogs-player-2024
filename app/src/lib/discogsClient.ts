import axios, { AxiosInstance, AxiosResponse } from 'axios';
import 'dotenv/config';

const discogsClient = async (endpoint: string, requestMethod: string, body: any) => {
    const BASE_URL = 'https://api.discogs.com';

    const PERSONAL_ACCESS_TOKEN = process.env.DISCOGS_TOKEN;
    const response = await axios.request({
        method: requestMethod,
        url: `${BASE_URL}/${endpoint}`,
        headers: {
            Authorization: `Discogs token=${PERSONAL_ACCESS_TOKEN}`,
            'User-Agent': 'Williams99CentDream/1.0',
        },
        data: body,
    });
    return response;
};

export default discogsClient;
