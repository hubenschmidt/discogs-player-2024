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
} from '@mantine/core';
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

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ title = 'TuneCrook' }: Props) => {
    const { userState } = useContext(UserContext);
    const { navState } = useContext(NavContext);
    const { navKey, playlistOpen } = navState;
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const {
        previewDiscogsRelease,
        previewRelease,
        selectedDiscogsRelease,
        selectedRelease,
        selectedVideo,
    } = discogsReleaseState;
    const bearerToken = useBearerToken();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [tracksOpen, setTracksOpen] = React.useState(true);

    const showPreviewTrackDetail =
        previewDiscogsRelease &&
        previewDiscogsRelease.id !== selectedDiscogsRelease?.id;

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
    React.useEffect(() => {
        if (selectedRelease) setTracksOpen(true);
    }, [selectedRelease?.Release_Id, previewRelease?.Release_Id]); // include preview if you want: , previewRelease?.Release_Id

    if (userState.notAuthed) {
        return <DiscogsAuthPrompt />;
    }

    if (userState.username && !collectionState.synced) {
        return (
            <Center style={{ height: '100vh' }}>
                <Stack align="center">
                    <Loader size="xl" color="white" />
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
            <Box component="header"></Box>
            <Container fluid className="layout-container" ml="5px" mr="5px">
                <Box
                    pos="sticky"
                    top={0}
                    style={{
                        position: 'sticky',
                        top: 8, // a little gap from the top
                        zIndex: 900, // below your NavBar's 1000, above content
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(2px)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                        borderRadius: 6,
                    }}
                >
                    {/* Header Section */}
                    <Grid mt="sm" mb="sm">
                        <Grid.Col
                            span={{ base: 11, md: 6, lg: 1.5 }}
                            style={{
                                position: 'relative',
                                zIndex: 1000,
                            }}
                        >
                            {/* Right-anchored container */}
                            <Box
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    marginTop: '0px',
                                }}
                            >
                                {/* Fixed-width inner box so first letters align */}
                                <Box
                                    style={{
                                        width: '5.5ch',
                                        textAlign: 'left',
                                        marginRight: '12px',
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

                        <Grid.Col span={{ base: 12, md: 6, lg: 10 }}>
                            <Search />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                            <TrackDetail
                                selectedDiscogsRelease={selectedDiscogsRelease}
                            />
                        </Grid.Col>
                    </Grid>
                </Box>

                <Grid mb="sm">
                    <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                        <TrackProgress />
                    </Grid.Col>
                </Grid>

                <Grid mb="sm">
                    <Grid.Col span={{ base: 12, md: 2, lg: 2 }}>
                        <Volume />
                        <Controls />
                    </Grid.Col>
                </Grid>

                <CollapsibleWrapper title="Collection" defaultOpen>
                    <Grid mb="sm">
                        <Grid.Col span={{ base: 12 }}>
                            <VinylShelf />
                        </Grid.Col>
                    </Grid>
                </CollapsibleWrapper>

                {showPreviewTrackDetail && (
                    <Grid mb="sm">
                        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                            <TrackDetail
                                selectedDiscogsRelease={previewDiscogsRelease}
                                preview={true}
                            />
                        </Grid.Col>
                    </Grid>
                )}

                {navKey === 'history' && (
                    <CollapsibleWrapper title="History" defaultOpen>
                        <Grid mb="sm">
                            <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                <History />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                )}

                {navKey === 'playlists' && (
                    <CollapsibleWrapper title="Playlists" defaultOpen>
                        <Grid mb="sm">
                            <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                <Playlists />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                )}

                {navKey === 'explorer' && (
                    <CollapsibleWrapper title="Explorer" defaultOpen>
                        <Grid mb="sm">
                            <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                                <Explorer />
                            </Grid.Col>
                        </Grid>
                    </CollapsibleWrapper>
                )}

                {playlistOpen && (
                    <Grid mb="sm">
                        <Grid.Col span={{ base: 12, md: 12, lg: 12 }}>
                            <Playlist />
                        </Grid.Col>
                    </Grid>
                )}

                {/* Video Playlist Section */}
                {selectedRelease && (
                    <CollapsibleWrapper
                        title="Tracks"
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

                {/* Footer */}
                <Box pt="lg" style={{ textAlign: 'center' }}>
                    <Text c="whitesmoke">Copyright PinaColada.co</Text>
                </Box>
            </Container>
        </Box>
    ) : null;
};

export default Layout;
