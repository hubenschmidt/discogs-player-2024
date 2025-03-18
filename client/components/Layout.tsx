import React, { ReactNode, useContext } from 'react';
import Head from 'next/head';
import MusicPlayer from './MusicPlayer';
import VinylShelf from './VinylShelf';
import VideoPlaylist from './VideoPlaylist';
import { ReleaseContext } from '../context/releaseContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Grid, Container, Text, Box } from '@mantine/core';
import CustomYouTubePlayer from './CustomYoutubePlayer';
import TrackDetail from './TrackDetail';

type Props = {
    children?: ReactNode;
    title?: string;
};

const Layout = ({ title = 'TuneCrook' }: Props) => {
    const { releaseState } = useContext(ReleaseContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedRelease } = releaseState;
    const { selectedDiscogsRelease, selectedVideo } = discogsReleaseState;

    let devStyle = {
        border: '.5px solid white',
    };
    // devStyle = {};

    return (
        <Box>
            <Head>
                <title>{title}</title>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width"
                />
            </Head>

            <Container fluid>
                {/* Header Section */}
                <Grid mt="sm" mb="sm">
                    <Grid.Col span={{ base: 12 }} style={devStyle}>
                        <Text
                            style={{
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '1.5rem',
                            }}
                        >
                            TuneCrook
                        </Text>
                    </Grid.Col>
                </Grid>

                {/* Main Content Section */}
                <Grid mb="sm">
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        <MusicPlayer />
                    </Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        {selectedDiscogsRelease && (
                            <TrackDetail
                                selectedDiscogsRelease={selectedDiscogsRelease}
                            />
                        )}
                    </Grid.Col>
                    <Grid.Col
                        span={{ base: 12, md: 6, lg: 4 }}
                        style={devStyle}
                    >
                        <Text style={{ textAlign: 'center' }}>
                            Additional Column
                        </Text>
                    </Grid.Col>
                </Grid>

                {/* Vinyl Shelf Section */}
                <Grid mb="sm">
                    <Grid.Col span={12} style={devStyle}>
                        <VinylShelf />
                    </Grid.Col>
                </Grid>

                {/* Video Playlist Section */}

                <Grid mb="sm">
                    <Grid.Col span={12} style={devStyle}>
                        {selectedRelease && (
                            <VideoPlaylist
                                releaseId={selectedRelease.Release_Id}
                            />
                        )}
                    </Grid.Col>
                </Grid>

                {/* YouTube Player Section */}
                {selectedVideo && (
                    <Box mx="auto" mb="md">
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
