import Layout from '../components/Layout';
import { useUser } from '@auth0/nextjs-auth0'; // v4 import path
import { useEffect, useContext } from 'react';
import { Flex, Loader, Box, Button } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { fetchBearerToken } from '../lib/fetch-bearer-token';
import { getUser } from '../api';
import { useBearerToken } from '../hooks/useBearerToken';

const IndexPage = () => {
    const { user, isLoading, error } = useUser();
    const { dispatchUser } = useContext(UserContext);
    const bearerToken = useBearerToken();

    // 1) When authenticated, fetch your API bearer token and store it in context
    useEffect(() => {
        if (!user) return;
        let cancelled = false;

        fetchBearerToken()
            .then(token => {
                if (cancelled) return;
                dispatchUser({ type: 'SET_BEARER_TOKEN', payload: token });
            })
            .catch(err => {
                console.error('fetchBearerToken failed', err);
            });

        return () => {
            cancelled = true;
        };
    }, [user, dispatchUser]);

    // 2) Once we have both an Auth0 user and your bearer token, load your app user profile
    useEffect(() => {
        if (!user?.name || !bearerToken) return;
        let cancelled = false;

        getUser(user.name, bearerToken)
            .then(res => {
                if (cancelled) return;
                dispatchUser({
                    type: 'SET_USER',
                    payload: {
                        username: res?.Username ?? '',
                        email: res?.Email ?? '',
                        notAuthed: !res?.Email && !res?.Username ? true : false,
                    },
                });
            })
            .catch(err => console.error('getUser failed', err));

        return () => {
            cancelled = true;
        };
    }, [user?.name, bearerToken, dispatchUser]);

    // Global loading or SDK loading state
    if (isLoading) {
        return (
            <Flex style={{ height: '100vh' }} justify="center" align="center">
                <Loader />
            </Flex>
        );
    }

    // Unauthenticated: show your custom splash with Login/Signup (no redirect)
    if (!user) {
        return (
            <Flex direction="column" align="center" gap="md" p="xl">
                <h1>TuneCrook</h1>
                <p>Put your hero/marketing content here.</p>
                <Flex gap="md">
                    <a href="/auth/login?screen_hint=signup">
                        <Button>Sign up</Button>
                    </a>
                    <a href="/auth/login">
                        <Button variant="outline">Log in</Button>
                    </a>
                </Flex>
            </Flex>
        );
    }

    // Authenticated: render your app shell
    return (
        <Layout title="TuneCrook">
            <h1>TuneCrook</h1>
            {/* Your app home content goes here */}
            <Box mt="md">
                <a href="/auth/logout">
                    <Button variant="subtle">Log out</Button>
                </a>
            </Box>
        </Layout>
    );
};

export default IndexPage;
