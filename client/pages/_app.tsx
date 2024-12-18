import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '../context/themeContext';

export default ({ Component, pageProps }: AppProps) => (
    <ThemeProvider>
        <Component {...pageProps} />;
    </ThemeProvider>
);
