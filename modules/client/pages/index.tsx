import Layout from '../components/Layout';
import { useUser } from '@auth0/nextjs-auth0'; // v4 import path
import { useEffect, useContext } from 'react';
import { Flex, Loader, Box, Button, Text } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { fetchBearerToken } from '../lib/fetch-bearer-token';
import { getUser } from '../api';
import { useBearerToken } from '../hooks/useBearerToken';
import { MantineProvider } from '@mantine/core';

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
            <MantineProvider>
                <>
                    <head>
                        <link
                            rel="preconnect"
                            href="https://fonts.googleapis.com"
                        />
                        <link
                            rel="preconnect"
                            href="https://fonts.gstatic.com"
                            crossOrigin=""
                        />
                        <link
                            href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
                            rel="stylesheet"
                        />
                    </head>
                    <Flex direction="column" align="center" gap="md" p="xl">
                        {/* Fixed-width inner box so first letters align */}
                        <Box
                            style={{
                                width: '5.5ch',
                                textAlign: 'left',
                                marginRight: '12px',
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: '"Orbitron", sans-serif',
                                    fontSize: '1.2rem',
                                    letterSpacing: '1px',
                                    color: 'yellow',
                                    lineHeight: 1.2,
                                    fontWeight: 'bold',
                                }}
                            >
                                tune
                            </Text>
                            <Text
                                style={{
                                    fontFamily: '"Orbitron", sans-serif',
                                    fontSize: '1.2rem',
                                    letterSpacing: '1px',
                                    color: 'yellow',
                                    lineHeight: 1.2,
                                    fontWeight: 'bold',
                                }}
                            >
                                Crook
                            </Text>
                        </Box>
                        <p>Put your hero/marketing content here.</p>
                        <Flex gap="md">
                            {/* Solid yellow */}
                            <Button
                                component="a"
                                href="/auth/login"
                                color="rgb(255,255,0)"
                                variant="filled"
                                c="black"
                                size="lg"
                            >
                                Log in
                            </Button>

                            {/* Outline yellow with black bg */}
                            <Button
                                component="a"
                                href="/auth/login?screen_hint=signup"
                                variant="light" // outline base, but we fully control the look
                                size="lg"
                                styles={{
                                    root: {
                                        color: 'rgb(255,255,0)',
                                        border: '2px solid rgba(255,255,0,0.55)', // dimmer base border
                                    },
                                }}
                            >
                                Sign up
                            </Button>
                        </Flex>
                    </Flex>
                </>
            </MantineProvider>
        );
    }

    // Authenticated: render your app shell
    return <Layout title="TuneCrook" />;
};

export default IndexPage;
