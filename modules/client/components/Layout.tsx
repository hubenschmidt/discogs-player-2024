import React, { ReactNode, useContext, useEffect, useState } from 'react';
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
} from '@mantine/core';
import { X } from 'lucide-react';
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
import ReleaseDetail from './ReleaseDetail';
import CollapsibleWrapper from './CollapsibleWrapper';
import History from './History';
import Explorer from './Explorer';
import Account from './Account';
import TopNav from './TopNav';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ title = 'TuneCrook' }: Props) => {
    const { userState } = useContext(UserContext);
    const { navState, dispatchNav } = useContext(NavContext);
    const { navKey, playlistOpen } = navState;
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const {
        previewRelease,
        selectedDiscogsRelease,
        selectedRelease,
        selectedVideo,
    } = discogsReleaseState;
    const bearerToken = useBearerToken();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [tracksOpen, setTracksOpen] = React.useState(true);

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

            <Container fluid className="layout-container" ml="5px" mr="5px">
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
                                        marginRight: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily:
                                                '"Orbitron", sans-serif',
                                            fontSize: '1.2rem',
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
                                            fontSize: '1.2rem',
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
                        <Grid.Col span={{ base: 12, md: 7, lg: 7 }}>
                            <Search />
                        </Grid.Col>

                        {/* Track detail below the row but inside header */}
                        <Grid.Col span={12} mt="xs">
                            <TrackDetail
                                selectedDiscogsRelease={selectedDiscogsRelease}
                            />
                        </Grid.Col>
                    </Grid>
                </Box>

                <Grid align="center" mb="sm" gutter="sm">
                    <Grid.Col span={{ base: 12, sm: 4, md: 3, lg: 3 }}>
                        <Volume />
                        <Controls />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 8, md: 9, lg: 9 }}>
                        <TrackProgress />
                    </Grid.Col>
                </Grid>

                {navKey === 'account' && (
                    <CollapsibleWrapper
                        title="Account"
                        defaultOpen
                        rightExtras={
                            <ActionIcon
                                variant="subtle"
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
                        <Grid mb="sm">
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
                                    variant="subtle"
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
                            <Grid mb="sm">
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
                            rightExtras={
                                <ActionIcon
                                    variant="subtle"
                                    color="white"
                                    radius="md"
                                    size="lg"
                                    aria-label="Close playlists"
                                    onClick={() => {
                                        // close the panel; add any other cleanup you need here
                                        dispatchNav({
                                            type: 'SET_NAV_KEY',
                                            payload: null,
                                        });
                                    }}
                                    title="Close playlists"
                                >
                                    <X size={16} />
                                </ActionIcon>
                            }
                        >
                            <Grid mb="sm">
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
                                    variant="subtle"
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
                            <Grid mb="sm">
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
                                radius="md"
                                size="lg"
                                aria-label="Close playlist"
                                onClick={() =>
                                    dispatchNav({
                                        type: 'SET_PLAYLIST_OPEN',
                                        payload: false,
                                    })
                                }
                                title="Close explorer"
                            >
                                <X size={16} />
                            </ActionIcon>
                        }
                    >
                        <Grid mb="sm">
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
                            <Grid mb="sm">
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

                <div id="section-collection">
                    <CollapsibleWrapper title="Collection" defaultOpen>
                        <Grid mb="sm">
                            <Grid.Col span={{ base: 12 }}>
                                <VinylShelf />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                </div>

                <div id="section-video">
                    {/* YouTube Player Section */}
                    {selectedVideo && (
                        <CollapsibleWrapper title="Video" defaultOpen={false}>
                            <Grid mb="sm">
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

                {/* Footer */}
                <Box pt="lg" style={{ textAlign: 'center' }}>
                    <Text c="whitesmoke">Copyright PinaColada.co</Text>
                </Box>
            </Container>
        </Box>
    ) : null;
};

export default Layout;
