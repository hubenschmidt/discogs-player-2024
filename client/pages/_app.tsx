import '../styles/scanLines.css';
import '../styles/vinylShelf.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { CollectionProvider } from '../context/collectionContext';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <CollectionProvider>
            <Component {...pageProps} />;
        </CollectionProvider>
    </MantineProvider>
);
