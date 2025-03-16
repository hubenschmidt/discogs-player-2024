import '../styles/scanLines.css';
import '../styles/vinylShelf.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { CollectionProvider } from '../context/collectionContext';
import { ReleaseProvider } from '../context/releaseContext';
import { DiscogsReleaseProvider } from '../context/discogsReleaseContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <CollectionProvider>
            <ReleaseProvider>
                <DiscogsReleaseProvider>
                    <Component {...pageProps} />;
                </DiscogsReleaseProvider>
            </ReleaseProvider>
        </CollectionProvider>
    </MantineProvider>
);
