import '@mantine/core/styles.css';
import '../styles/vinylShelf.css';
import '../styles/root.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { UserProvider } from '../context/userContext';
import { CollectionProvider } from '../context/collectionContext';
import { ReleaseProvider } from '../context/releaseContext';
import { DiscogsReleaseProvider } from '../context/discogsReleaseContext';
import { PlayerProvider } from '../context/playerContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <UserProvider>
            <CollectionProvider>
                <ReleaseProvider>
                    <DiscogsReleaseProvider>
                        <PlayerProvider>
                            <Component {...pageProps} />
                        </PlayerProvider>
                    </DiscogsReleaseProvider>
                </ReleaseProvider>
            </CollectionProvider>
        </UserProvider>
    </MantineProvider>
);
