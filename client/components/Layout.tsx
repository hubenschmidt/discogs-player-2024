import React, { ReactNode, useContext } from 'react';
import Head from 'next/head';
import MusicPlayer from './MusicPlayer';
import VinylShelf from './VinylShelf';
import VideoPlaylist from './VideoPlaylist';
import { ReleaseContext } from '../context/releaseContext';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Group, Text, Box } from '@mantine/core';
import CustomYouTubePlayer from './CustomYoutubePlayer';

type Props = {
    children?: ReactNode;
    title?: string;
};

// Mock TrackDetail Component
const TrackDetail = ({ selectedDiscogsRelease }) => {
    return (
        <div className="track-detail">
            <Text>
                {selectedDiscogsRelease?.artists_sort} -{' '}
                {selectedDiscogsRelease?.title} ({selectedDiscogsRelease?.year})
            </Text>
        </div>
    );
};

const Layout = ({ title = 'TuneCrook' }: Props) => {
    const { releaseState } = useContext(ReleaseContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedRelease } = releaseState;
    const { selectedDiscogsRelease, selectedVideo } = discogsReleaseState;

    return (
        <Box p="10px">
            <div>
                <Head>
                    <title>{title}</title>
                    <meta charSet="utf-8" />
                    <meta
                        name="viewport"
                        content="initial-scale=1.0, width=device-width"
                    />
                    <link
                        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
                        rel="stylesheet"
                    />
                </Head>
                <div className="scanlines"></div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 col-md-4"></div>
                        <div className="col-12 col-md-4">
                            <p className="text-center">TuneCrook</p>
                        </div>
                        <div className="col-12 col-md-2"></div>
                        <div className="col-6 col-md-1"></div>
                        <div className="col-6 col-md-1"></div>
                    </div>
                    <div className="row">
                        <div className="col-12 col-sm-1"></div>
                        <div className="col-12 col-sm-3">
                            <MusicPlayer />
                        </div>
                        <div className="col-12 col-sm-4">
                            {selectedDiscogsRelease && (
                                <TrackDetail
                                    selectedDiscogsRelease={
                                        selectedDiscogsRelease
                                    }
                                />
                            )}
                        </div>
                        <div className="col-12 col-sm-2">
                            <p className="text-center">Column 5</p>
                        </div>
                        <div className="col-12 col-sm-2"></div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <VinylShelf />
                    </div>
                </div>

                {selectedRelease && (
                    <div className="col-12">
                        <VideoPlaylist releaseId={selectedRelease.Release_Id} />
                    </div>
                )}

                {selectedVideo && (
                    <Box mx="auto">
                        <CustomYouTubePlayer width="100%" height="430px" />
                    </Box>
                )}

                <footer>
                    <span>WiLliⒶMr0y</span>
                </footer>
            </div>
        </Box>
    );
};

export default Layout;
