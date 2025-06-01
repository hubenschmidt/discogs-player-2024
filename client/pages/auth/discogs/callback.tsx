import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { fetchAccessToken } from '../../../api'; // or your own helper
import { Loader, Center, Notification, Text } from '@mantine/core';

const DiscogsCallbackPage = () => {
    const { query, replace } = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { oauth_token, oauth_verifier } = query;

        if (oauth_token && oauth_verifier) {
            // call your API route or external backend endpoint
            fetchAccessToken(oauth_token, oauth_verifier)
                .then(res => console.log(res, 'username')) // this should return username, which we will store in react context
                .catch(err => console.log(err));
            // now you’ve stored tokens in cookies or context—navigate home
            replace('/');
        }
    }, [query]);

    if (error) {
        return (
            <Center style={{ height: '100vh' }}>
                <Notification color="red" title="Error">
                    {error}
                </Notification>
            </Center>
        );
    }

    return (
        <Center style={{ height: '100vh' }}>
            <Loader size="lg" />
            <Text ml="md">Finishing authentication…</Text>
        </Center>
    );
};

export default DiscogsCallbackPage;
