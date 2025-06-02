import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../context/userContext';
import { fetchAccessToken } from '../../../api';
import { Loader, Center, Notification, Text } from '@mantine/core';

const DiscogsCallbackPage = () => {
    const { query, replace } = useRouter();
    const { dispatchUser } = useContext(UserContext);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { oauth_token, oauth_verifier } = query;

        if (oauth_token && oauth_verifier) {
            fetchAccessToken(oauth_token, oauth_verifier)
                .then(res => {
                    dispatchUser({
                        type: 'SET_USERNAME',
                        payload: res,
                    });

                    replace('/');
                })
                .catch(err => console.log(err));
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
