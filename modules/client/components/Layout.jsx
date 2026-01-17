import React, { useContext, useEffect, useState } from 'react';
import Head from 'next/head';
import Controls from './Controls';
import Volume from './Volume';
import VinylShelf from './VinylShelf';
import ReleaseVideos from './ReleaseVideos';
import { UserContext } from '../context/userContext';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import {
    Grid,
    Container,
    Text,
    Box,
    Center,
    Loader,
    Stack,
    ActionIcon,
    Group,
} from '@mantine/core';
import { X, ChevronDown } from 'lucide-react';
import CustomYouTubePlayer from './CustomYoutubePlayer';
import TrackDetail from './TrackDetail';
import { syncCollection } from '../api';
import DiscogsAuthPrompt from './DiscogsAuthPrompt';
import { useBearerToken } from '../hooks/useBearerToken';
import Search from './Search';
import Navbar from './NavBar';
import Playlists from './Playlists';
import Playlist from './Playlist';
import TrackProgress from './TrackProgress';
import { NavContext } from '../context/navContext';
import { PlaylistContext } from '../context/playlistContext';
import ReleaseDetail from './ReleaseDetail';
import CollapsibleWrapper from './CollapsibleWrapper';
import History from './History';
import Explorer from './Explorer';
import Account from './Account';
import TopNav from './TopNav';
import PlaylistCreateButton from './PlaylistCreateButton';

const Layout = ({ children, title = 'TuneCrook' }) => {
    const { userState } = useContext(UserContext);
    const { navState, dispatchNav } = useContext(NavContext);
    const { navKey } = navState;
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlistOpen } = playlistState;
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { previewRelease, selectedRelease, selectedVideo } =
        discogsReleaseState;
    const bearerToken = useBearerToken();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [tracksOpen, setTracksOpen] = React.useState(true);
    const [mobileShelfOpen, setMobileShelfOpen] = useState(true);

    // Collapse mobile shelf when a release is selected
    useEffect(() => {
        if (selectedRelease) {
            setMobileShelfOpen(false);
        }
    }, [selectedRelease?.Release_Id]);

    useEffect(() => {
        if (userState.username && !collectionState.synced) {
            syncCollection(userState.username, bearerToken)
                .then(response => {
                    dispatchCollection({
                        type: 'SET_SYNCED',
                        payload: true,
                    });
                })
                .catch(err => console.log(err));
        }
    }, [userState.username]);

    // whenever selectedRelease changes (or becomes truthy), force it open
    useEffect(() => {
        if (selectedRelease) setTracksOpen(true);
    }, [selectedRelease?.Release_Id, previewRelease?.Release_Id]); // include preview if you want: , previewRelease?.Release_Id

    if (userState.notAuthed) {
        return <DiscogsAuthPrompt />;
    }

    if (userState.username && !collectionState.synced) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center">
                    <Loader size="xl" color="rgb(255,255,0)" />
                    <Text>Loading your collection…</Text>
                </Stack>
            </Center>
        );
    }

    return collectionState.synced ? (
        <Box>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <Container fluid className="layout-container" ml="5px" mr="5px" pb={280}>
                <Box
                    pos="sticky"
                    top={0}
                    style={{
                        position: 'sticky',
                        top: 8,
                        zIndex: 900,
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        borderRadius: 6,
                    }}
                    data-app-header
                >
                    <Grid mt="sm" mb="sm" align="center">
                        <Grid.Col
                            span={{ base: 1, sm: 0.5, md: 0.5, lg: 0.5 }}
                        ></Grid.Col>

                        {/* Row 1: icons (left) + logo (right) */}
                        <Grid.Col
                            span={{ base: 6, sm: 3, md: 3, lg: 2 }}
                            style={{ position: 'relative', zIndex: 1001 }}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    overflow: 'visible',
                                }}
                            >
                                <TopNav compact />
                            </Box>
                        </Grid.Col>

                        <Grid.Col
                            span={{ base: 5, sm: 8, md: 1.5, lg: 1.5 }}
                            style={{ position: 'relative', zIndex: 1000 }}
                        >
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: 0,
                                }}
                            >
                                <Box
                                    style={{
                                        width: '5.5ch',
                                        textAlign: 'left',
                                        marginRight: -4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily:
                                                '"Orbitron", sans-serif',
                                            fontSize: '1rem',
                                            letterSpacing: '1px',
                                            color: 'yellow',
                                            lineHeight: 1.2,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        tune
                                    </Text>
                                    <Text
                                        style={{
                                            fontFamily:
                                                '"Orbitron", sans-serif',
                                            fontSize: '1rem',
                                            letterSpacing: '1px',
                                            color: 'yellow',
                                            lineHeight: 1.2,
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Crook
                                    </Text>
                                </Box>
                            </Box>
                        </Grid.Col>

                        {/* Row 2: search full width on mobile */}
                        <Grid.Col span={{ base: 12, md: 7, lg: 7 }} ml="4">
                            <Search />
                        </Grid.Col>

                        {/* Track detail below the row but inside header */}
                        <Grid.Col span={12} mt="-10" className="hide-on-mobile">
                            <TrackDetail />
                        </Grid.Col>
                    </Grid>

                    <Grid align="center" mb="sm" gutter="sm">
                        <Grid.Col
                            span={{ base: 12, sm: 4, md: 3, lg: 3 }}
                            mt="-8"
                        >
                            <Volume />
                            <Controls />
                        </Grid.Col>
                        <Grid.Col
                            span={{ base: 12, sm: 8, md: 9, lg: 9 }}
                            mt="-10"
                        >
                            <TrackProgress />
                        </Grid.Col>
                    </Grid>
                </Box>

                {navKey === 'account' && (
                    <CollapsibleWrapper
                        title="Account"
                        defaultOpen
                        rightExtras={
                            <ActionIcon
                                variant="light"
                                color="white"
                                radius="md"
                                size="lg"
                                aria-label="Close account"
                                onClick={() =>
                                    dispatchNav({
                                        type: 'SET_NAV_KEY',
                                        payload: null,
                                    })
                                }
                                title="Close account"
                            >
                                <X size={16} />
                            </ActionIcon>
                        }
                    >
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                <Account />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                )}

                <div id="section-history">
                    {navKey === 'history' && (
                        <CollapsibleWrapper
                            title="History"
                            defaultOpen
                            rightExtras={
                                <ActionIcon
                                    variant="light"
                                    color="white"
                                    radius="md"
                                    size="lg"
                                    aria-label="Close history"
                                    onClick={() =>
                                        dispatchNav({
                                            type: 'SET_NAV_KEY',
                                            payload: null,
                                        })
                                    }
                                    title="Close history"
                                >
                                    <X size={16} />
                                </ActionIcon>
                            }
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                    <History />
                                </Grid.Col>
                            </Grid>
                        </CollapsibleWrapper>
                    )}
                </div>

                <div id="section-playlists">
                    {navKey === 'playlists' && (
                        <CollapsibleWrapper
                            title="Playlists"
                            defaultOpen
                            leftExtras={<PlaylistCreateButton />}
                            rightExtras={
                                <ActionIcon
                                    variant="light"
                                    color="white"
                                    radius="md"
                                    size="lg"
                                    aria-label="Close playlists"
                                    onClick={() =>
                                        dispatchNav({
                                            type: 'SET_NAV_KEY',
                                            payload: null,
                                        })
                                    }
                                    title="Close playlists"
                                >
                                    <X size={16} />
                                </ActionIcon>
                            }
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                    <Playlists />
                                </Grid.Col>
                            </Grid>
                        </CollapsibleWrapper>
                    )}
                </div>

                <div id="section-explorer">
                    {navKey === 'explorer' && (
                        <CollapsibleWrapper
                            title="Explorer"
                            defaultOpen
                            rightExtras={
                                <ActionIcon
                                    variant="light"
                                    color="white"
                                    radius="md"
                                    size="lg"
                                    aria-label="Close explorer"
                                    onClick={() =>
                                        dispatchNav({
                                            type: 'SET_NAV_KEY',
                                            payload: null,
                                        })
                                    }
                                    title="Close explorer"
                                >
                                    <X size={16} />
                                </ActionIcon>
                            }
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                    <Explorer />
                                </Grid.Col>
                            </Grid>
                        </CollapsibleWrapper>
                    )}
                </div>

                {playlistOpen && (
                    <CollapsibleWrapper
                        title="Playlist"
                        defaultOpen
                        rightExtras={
                            <ActionIcon
                                variant="light"
                                color="white"
                                radius="md"
                                size="lg"
                                aria-label="Close playlist"
                                onClick={() =>
                                    dispatchPlaylist({
                                        type: 'SET_PLAYLIST_OPEN',
                                        payload: false,
                                    })
                                }
                                title="Close playlist"
                            >
                                <X size={16} />
                            </ActionIcon>
                        }
                    >
                        <Grid>
                            <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                <Playlist />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                )}

                <div id="section-release">
                    {/* Video Playlist Section */}
                    {selectedRelease && (
                        <CollapsibleWrapper
                            title="Release"
                            defaultOpen
                            isOpen={tracksOpen}
                            onOpenChange={setTracksOpen}
                        >
                            <Grid>
                                <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
                                    <ReleaseVideos />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, md: 6, lg: 8 }}>
                                    <ReleaseDetail />
                                </Grid.Col>
                            </Grid>
                        </CollapsibleWrapper>
                    )}
                </div>

                <div id="section-video">
                    {/* YouTube Player Section.. explicitly defaultOpen in case we want to change it later */}
                    {selectedVideo && (
                        <CollapsibleWrapper title="Video" defaultOpen={true}>
                            <Grid>
                                <Grid.Col span={{ base: 12 }}>
                                    <CustomYouTubePlayer
                                        width="100%"
                                        height="430px"
                                    />
                                </Grid.Col>
                            </Grid>
                        </CollapsibleWrapper>
                    )}
                </div>

            </Container>

            {/* Fixed footer shelf */}
            <Box
                id="section-collection"
                className={`vinyl-shelf-footer ${mobileShelfOpen ? 'mobile-expanded' : ''}`}
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 800,
                    background: 'rgba(0,0,0,0.95)',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                }}
            >
                {/* Desktop: full shelf with CollapsibleWrapper */}
                <Box className="desktop-shelf">
                    <CollapsibleWrapper title="Collection" defaultOpen>
                        <VinylShelf />
                    </CollapsibleWrapper>
                </Box>

                {/* Mobile: expanded shelf */}
                <Box className="mobile-shelf-expanded">
                    <Group justify="space-between" align="center" p="xs">
                        <Text fw={700} c="white">Collection</Text>
                        <ActionIcon
                            variant="light"
                            color="white"
                            radius="md"
                            size="lg"
                            onClick={() => setMobileShelfOpen(false)}
                            aria-label="Collapse shelf"
                        >
                            <ChevronDown size={18} />
                        </ActionIcon>
                    </Group>
                    <Box style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        <VinylShelf />
                    </Box>
                </Box>

                {/* Mobile: mini-bar (tap to expand) */}
                <Box
                    className="mobile-mini-bar"
                    p="sm"
                    onClick={() => setMobileShelfOpen(true)}
                    style={{ cursor: 'pointer' }}
                >
                    <Group gap="sm" align="center" style={{ width: '100%' }}>
                        {selectedRelease?.Thumb ? (
                            <Box
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    backgroundImage: `url(${selectedRelease.Thumb})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: '3px solid #333',
                                    flexShrink: 0,
                                }}
                            />
                        ) : (
                            <Box
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    background: '#333',
                                    flexShrink: 0,
                                }}
                            />
                        )}
                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="sm" c="white" truncate>
                                {selectedRelease?.Title || 'Select a record'}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                                {selectedRelease?.Artist || 'from your collection'}
                            </Text>
                        </Box>
                        <Text size="xs" c="dimmed">
                            {collectionState?.count || 0}
                        </Text>
                    </Group>
                </Box>
            </Box>
        </Box>
    ) : null;
};

export default Layout;
