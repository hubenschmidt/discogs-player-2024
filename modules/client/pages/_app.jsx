import '@mantine/core/styles.css';
import '../styles/vinylShelf.css';
import '../styles/root.css';
import { MantineProvider } from '@mantine/core';
import { UserProvider } from '../context/userContext';
import { CollectionProvider } from '../context/collectionContext';
import { DiscogsReleaseProvider } from '../context/discogsReleaseContext';
import { PlayerProvider } from '../context/playerContext';
import { SearchProvider } from '../context/searchContext';
import { PlaylistProvider } from '../context/playlistContext';
import { NavProvider } from '../context/navContext';
import { ExplorerProvider } from '../context/explorerContext';
import { variantColorResolver } from '../lib/variantColorResolver';

export default ({ Component, pageProps }) => (
    <MantineProvider theme={{ variantColorResolver }}>
        <UserProvider>
            <CollectionProvider>
                <DiscogsReleaseProvider>
                    <PlayerProvider>
                        <SearchProvider>
                            <PlaylistProvider>
                                <NavProvider>
                                    <ExplorerProvider>
                                        <Component {...pageProps} />
                                    </ExplorerProvider>
                                </NavProvider>
                            </PlaylistProvider>
                        </SearchProvider>
                    </PlayerProvider>
                </DiscogsReleaseProvider>
            </CollectionProvider>
        </UserProvider>
    </MantineProvider>
);
