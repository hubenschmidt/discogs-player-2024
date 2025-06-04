import Layout from '../components/Layout';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { Flex, Loader, Box } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { getAuth0AccessToken } from '../lib/get-session-token';

const IndexPage = () => {
    const { user, isLoading, error } = useUser();
    const { dispatchUser } = useContext(UserContext);
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (!isLoading && !user && !redirecting) {
            setRedirecting(true);
            router.replace('/auth/login').catch(() => setRedirecting(false));
        }
    }, [isLoading, user, redirecting, router]);

    useEffect(() => {
        if (user) {
            getAuth0AccessToken()
                .then(accessToken => {
                    dispatchUser({
                        type: 'SET_ACCESS_TOKEN',
                        payload: accessToken,
                    });
                })
                .catch(err => console.log(err));
        }
    }, [user]);

    if (isLoading || redirecting) {
        return (
            <Flex style={{ height: '100vh' }} justify="center" align="center">
                <Loader />
            </Flex>
        );
    }

    if (error) {
        return <Box>{error.message}</Box>;
    }

    return (
        <Layout title="Home | Next.js + TypeScript Example">
            <h1>TuneCrook</h1>
        </Layout>
    );
};

export default IndexPage;
