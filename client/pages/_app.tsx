import '../styles/scanLines.css';
import '../styles/vinylShelf.css';
import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider>
        <Component {...pageProps} />;
    </MantineProvider>
);
