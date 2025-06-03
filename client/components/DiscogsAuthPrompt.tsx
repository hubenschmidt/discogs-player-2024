import { useState } from 'react';
import { fetchRequestToken } from '../api';
import { useAuth0AccessToken } from '../hooks/useAuth0AccessToken';
import {
    Button,
    Center,
    Loader,
    Stack,
    Text,
    Title,
    Notification,
} from '@mantine/core';

const DiscogsAuthPrompt = () => {
    const [status, setStatus] = useState('idle');
    const accessToken = useAuth0AccessToken();

    const handleConnect = async () => {
        setStatus('loading');
        try {
            // 1) Fetch the raw query-string response
            const response = await fetchRequestToken(accessToken);
            //    e.g. "oauth_token=ABC&oauth_token_secret=XYZ&oauth_callback_confirmed=true"

            // 2) Parse it
            const params = new URLSearchParams(response);
            const oauthToken = params.get('oauth_token');
            if (!oauthToken) {
                throw new Error('No oauth_token in response');
            }

            // 3) Redirect user to Discogs authorize page
            const authorizeUrl = `https://discogs.com/oauth/authorize?oauth_token=${oauthToken}`;
            window.location.href = authorizeUrl;
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    if (status === 'loading') {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center">
                    <Loader size="xl" variant="bars" />
                    <Text>Redirecting to Discogs…</Text>
                </Stack>
            </Center>
        );
    }

    return (
        <Center style={{ height: '100vh' }}>
            <Stack align="center">
                <Title order={2}>Connect your Discogs account</Title>
                <Button size="lg" radius="xl" onClick={handleConnect}>
                    Authorize with Discogs
                </Button>

                {status === 'error' && (
                    <Notification
                        color="red"
                        title="Connection failed"
                        onClose={() => setStatus('idle')}
                    >
                        Something went wrong—please try again.
                    </Notification>
                )}
            </Stack>
        </Center>
    );
};

export default DiscogsAuthPrompt;
