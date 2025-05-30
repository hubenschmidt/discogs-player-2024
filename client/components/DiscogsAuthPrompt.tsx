import { useState } from 'react';
import { getRequestToken } from '../api';
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

    const handleConnect = async () => {
        setStatus('loading');
        try {
            const response = await getRequestToken();
            console.log(response);
            // const { authorize_url } = await getRequestToken();
            // window.location.href = authorize_url;
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
