import '@mantine/core/styles.css';
import '../styles/vinylShelf.css';
import '../styles/scanLines.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { CollectionProvider } from '../context/collectionContext';
import { ReleaseProvider } from '../context/releaseContext';
import { DiscogsReleaseProvider } from '../context/discogsReleaseContext';
import { PlayerProvider } from '../context/playerContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <CollectionProvider>
            <ReleaseProvider>
                <DiscogsReleaseProvider>
                    <PlayerProvider>
                        <Component {...pageProps} />
                    </PlayerProvider>
                </DiscogsReleaseProvider>
            </ReleaseProvider>
        </CollectionProvider>
    </MantineProvider>
);
