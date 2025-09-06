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
import { PlaylistProvider } from '../context/playlistContext';
import { NavProvider } from '../context/navContext';
import { variantColorResolver } from '../lib/variantColorResolver';

export default ({ Component, pageProps }: AppProps) => (
    <MantineProvider theme={{ variantColorResolver }}>
        <UserProvider>
            <CollectionProvider>
                <DiscogsReleaseProvider>
                    <PlayerProvider>
                        <SearchProvider>
                            <PlaylistProvider>
                                <NavProvider>
                                    <Component {...pageProps} />
                                </NavProvider>
                            </PlaylistProvider>
                        </SearchProvider>
                    </PlayerProvider>
                </DiscogsReleaseProvider>
            </CollectionProvider>
        </UserProvider>
    </MantineProvider>
);
