import Layout from '../components/Layout';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0'; // hack: getAccessToken is returning an opaque token so instead use hook `useBearerToken`
import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { Flex, Loader, Box } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { fetchBearerToken } from '../lib/fetch-bearer-token';

const IndexPage = () => {
    const { user, isLoading, error } = useUser();
    const { dispatchUser } = useContext(UserContext);
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);
    console.log(user?.email); // this probably needs to be written to the database at User.Email and then fetched later and added to the userState `SET_EMAIL` when the user logs in again

    useEffect(() => {
        if (!isLoading && !user && !redirecting) {
            setRedirecting(true);
            router.replace('/auth/login').catch(() => setRedirecting(false));
        }
    }, [isLoading, user, redirecting, router]);

    useEffect(() => {
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
