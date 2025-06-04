import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../context/userContext';
import { useUser } from '@auth0/nextjs-auth0';
import { fetchDiscogsAccessToken } from '../../../api';
import { Loader, Center, Notification, Text } from '@mantine/core';
import { fetchBearerToken } from '../../../lib/fetch-bearer-token';
import { useBearerToken } from '../../../hooks/useBearerToken';

const DiscogsCallbackPage = () => {
    const { user } = useUser();
    const { query, replace } = useRouter();
    const { dispatchUser } = useContext(UserContext);
    const [error, setError] = useState<string | null>(null);
    const bearerToken = useBearerToken();

    useEffect(() => {
        // have to call this twice because the discogs auth redirect resets global app state
        if (user) {
            fetchBearerToken()
                .then(bearerToken => {
                    dispatchUser({
                        type: 'SET_BEARER_TOKEN',
                        payload: bearerToken,
                    });
                })
                .catch(err => console.log(err));
        }
    }, [user]);

    useEffect(() => {
        const { oauth_token, oauth_verifier } = query;
        if (user?.name && oauth_token && oauth_verifier && bearerToken) {
            fetchDiscogsAccessToken(
                user.name,
                oauth_token,
                oauth_verifier,
                bearerToken,
            )
                .then(res => {
                    dispatchUser({
                        type: 'SET_USERNAME',
                        payload: res,
                    });
                    replace('/');
                })
                .catch(err => console.log(err));
        }
    }, [user, query, bearerToken]);

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
