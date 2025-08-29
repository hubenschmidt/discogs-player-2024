import '@mantine/core/styles.css';
import '../styles/vinylShelf.css';
import '../styles/root.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { UserProvider } from '../context/userContext';
import { CollectionProvider } from '../context/collectionContext';
import { DiscogsReleaseProvider } from '../context/discogsReleaseContext';
import { PlayerProvider } from '../context/playerContext';
import { SearchProvider } from '../context/searchContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <UserProvider>
            <CollectionProvider>
                <DiscogsReleaseProvider>
                    <PlayerProvider>
                        <SearchProvider>
                            <Component {...pageProps} />
                        </SearchProvider>
                    </PlayerProvider>
                </DiscogsReleaseProvider>
            </CollectionProvider>
        </UserProvider>
    </MantineProvider>
);
