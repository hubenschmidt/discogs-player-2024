import '../styles/scanLines.css';
import '../styles/vinylShelf.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { CollectionProvider } from '../context/collectionContext';
import { ReleaseProvider } from '../context/releaseContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <CollectionProvider>
            <ReleaseProvider>
                <Component {...pageProps} />;
            </ReleaseProvider>
        </CollectionProvider>
    </MantineProvider>
);
