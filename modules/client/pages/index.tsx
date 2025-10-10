// import Layout from '../components/Layout';
// import { useUser, getAccessToken } from '@auth0/nextjs-auth0'; // hack: getAccessToken is returning an opaque token so instead use hook `useBearerToken`
// import { useRouter } from 'next/router';
// import { useEffect, useState, useContext } from 'react';
// import { Flex, Loader, Box } from '@mantine/core';
// import { UserContext } from '../context/userContext';
// import { fetchBearerToken } from '../lib/fetch-bearer-token';
// import { getUser } from '../api';
// import { useBearerToken } from '../hooks/useBearerToken';

// const IndexPage = () => {
//     const { user, isLoading, error } = useUser();
//     const { dispatchUser } = useContext(UserContext);
//     const router = useRouter();
//     const [redirecting, setRedirecting] = useState(false);
//     const bearerToken = useBearerToken();

//     useEffect(() => {
//         if (!isLoading && !user && !redirecting) {
//             setRedirecting(true);
//             router.replace('/auth/login').catch(() => setRedirecting(false));
//         }
//     }, [isLoading, user, redirecting, router]);

//     useEffect(() => {
//         if (user) {
//             fetchBearerToken()
//                 .then(bearerToken => {
//                     dispatchUser({
//                         type: 'SET_BEARER_TOKEN',
//                         payload: bearerToken,
//                     });
//                 })
//                 .catch(err => console.log(err));
//         }
//     }, [user]);

//     useEffect(() => {
//         if (user?.name && bearerToken) {
//             getUser(user.name, bearerToken)
//                 .then(res => {
//                     dispatchUser({
//                         type: 'SET_USER',
//                         payload: {
//                             username: res?.Username ?? '',
//                             email: res?.Email ?? '',
//                             notAuthed:
//                                 !res?.Email && !res?.Username ? true : false,
//                         },
//                     });
//                 })
//                 .catch(err => console.log(err));
//         }
//     }, [bearerToken]);

//     if (isLoading || redirecting) {
//         return (
//             <Flex style={{ height: '100vh' }} justify="center" align="center">
//                 <Loader color="white" />
//             </Flex>
//         );
//     }

//     if (error) {
//         return <Box>{error.message}</Box>;
//     }

//     return (
//         <Layout title="TuneCrook">
//             <h1>TuneCrook</h1>
//         </Layout>
//     );
// };

// export default IndexPage;

import { useUser } from '@auth0/nextjs-auth0';

export default function IndexPage() {
    const { user, isLoading } = useUser();

    if (isLoading) return <main>Loading…</main>;

    if (!user) {
        return (
            <main style={{ padding: 24 }}>
                <h1>Welcome to My App</h1>
                <p>Put your hero/marketing content here.</p>
                <p>
                    <a href="/auth/login?screen_hint=signup">
                        <button>Sign up</button>
                    </a>
                    &nbsp;
                    <a href="/auth/login">
                        <button>Log in</button>
                    </a>
                </p>
            </main>
        );
    }

    return (
        <main style={{ padding: 24 }}>
            <h1>Welcome, {user.name || user.nickname || user.email}!</h1>
            <p>
                <a href="/auth/logout">
                    <button>Log out</button>
                </a>
            </p>
        </main>
    );
}
