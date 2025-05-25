import React, { ReactNode, useContext, useEffect } from 'react';
import Head from 'next/head';
import Controls from './Controls';
import Volume from './Volume';
import VinylShelf from './VinylShelf';
import VideoPlaylist from './VideoPlaylist';
import { CollectionContext } from '../context/collectionContext';
import { ReleaseContext } from '../context/releaseContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Grid, Container, Text, Box } from '@mantine/core';
import CustomYouTubePlayer from './CustomYoutubePlayer';
import TrackDetail from './TrackDetail';
import { syncCollection } from '../api';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ title = 'TuneCrook' }: Props) => {
    const { collectionState, dispatchCollection } =
        useContext(CollectionContext);
    const { releaseState } = useContext(ReleaseContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedRelease } = releaseState;
    const { selectedDiscogsRelease, selectedVideo } = discogsReleaseState;

    let placeholder = null;
    let borderStyle = '.5px solid white';
    let devStyle = {
        borderRight: borderStyle,
        borderTop: borderStyle,
        borderBottom: borderStyle,
        borderLeft: borderStyle,
    };

    useEffect(() => {
        if (!collectionState.synced) {
            console.log('then we need to sync', collectionState.synced);
            syncCollection('hubenschmidt') // placeholder until multi-user support is enabled
                .then(response => {
                    dispatchCollection({
                        type: 'SET_SYNCED',
                        payload: true,
                    });
                })
                .catch(err => console.log(err));
        }
    }, []);

    return (
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

            <Container fluid className="layout-container">
                {/* Header Section */}
                <Grid mt="sm" mb="sm">
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        <Text
                            style={{
                                fontFamily: '"Orbitron", sans-serif',
                                fontSize: '1rem',
                                textAlign: 'left',
                                letterSpacing: '1px',
                            }}
                        >
                            tuneCrook
                        </Text>
                    </Grid.Col>
                    {placeholder && (
                        <>
                            <Grid.Col
                                span={{ base: 12, md: 6, lg: 4 }}
                                style={devStyle}
                            ></Grid.Col>
                            <Grid.Col
                                span={{ base: 12, md: 6, lg: 4 }}
                                style={devStyle}
                            ></Grid.Col>
                        </>
                    )}
                </Grid>

                <Grid mb="sm">
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 6 }}
                        style={devStyle}
                    >
                        <TrackDetail
                            selectedDiscogsRelease={selectedDiscogsRelease}
                        />
                    </Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 6 }}
                        style={devStyle}
                    ></Grid.Col>
                </Grid>
            </Container>

            {/* Vinyl Shelf Section */}
            <Grid mb="sm">
                <Grid.Col span={{ base: 12 }}>
                    <VinylShelf />
                </Grid.Col>
            </Grid>

            <Container fluid className="layout-container">
                {/* Main Content Section */}
                <Grid mb="sm">
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        <Volume />
                        <Controls />
                    </Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    ></Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    ></Grid.Col>
                </Grid>
            </Container>

            <Container fluid className="layout-container">
                {/* Video Playlist Section */}
                <Grid mb="sm">
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        {selectedRelease && (
                            <VideoPlaylist
                                releaseId={selectedRelease.Release_Id}
                            />
                        )}
                    </Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    ></Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    ></Grid.Col>
                </Grid>

                {/* YouTube Player Section */}
                {selectedVideo && (
                    <Box mb="sm">
                        <CustomYouTubePlayer width="100%" height="430px" />
                    </Box>
                )}

                {/* Footer */}
                <Box pt="lg" style={{ textAlign: 'center' }}>
                    <Text>WiLliⒶMr0y</Text>
                </Box>
            </Container>
        </Box>
    );
};

export default Layout;
