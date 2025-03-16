import React, { ReactNode, useContext } from 'react';
import Head from 'next/head';
import MusicPlayer from './MusicPlayer';
import ThemePicker from './Dropdown';
import VinylShelf from './VinylShelf';
import VideoPlaylist from './VideoPlaylist';
import { ReleaseContext } from '../context/releaseContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { Group, Text } from '@mantine/core';

type Props = {
    children?: ReactNode;
    title?: string;
};

// Mock TrackDetail Component
const TrackDetail = ({ selectedDiscogsRelease }) => {
    return (
        <div className="track-detail">
            {' '}
            <Text>
                {selectedDiscogsRelease?.artists_sort} -{' '}
                {selectedDiscogsRelease?.title}
                {' ('}
                {selectedDiscogsRelease?.year}
                {')'}
            </Text>{' '}
        </div>
    );
};

const Layout = ({ children, title = 'TuneCrook' }: Props) => {
    const { releaseState, dispatchRelease } = useContext(ReleaseContext);
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedRelease } = releaseState;
    const { selectedDiscogsRelease } = discogsReleaseState;

    return (
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
                    <div className="col-6 col-md-1">
                        <ThemePicker />
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-1"></div>
                    <div className="col-12 col-sm-3">
                        <MusicPlayer />
                    </div>
                    <div className="col-12 col-sm-4">
                        {selectedDiscogsRelease && (
                            <TrackDetail
                                selectedDiscogsRelease={selectedDiscogsRelease}
                            />
                        )}
                    </div>
                    <div className="col-12 col-sm-2">
                        <p className="text-center">Column 5</p>
                    </div>
                    <div className="col-12 col-sm-2"></div>
                </div>
            </div>

            {/* VideoPlaylist */}
            {selectedRelease && (
                <Group
                    className="row"
                    style={{ height: 'calc(100vh - 150px)' }}
                >
                    <div className="col-12">
                        <VideoPlaylist
                            releaseId={selectedRelease?.Release_Id}
                        />
                    </div>
                </Group>
            )}
            <div className="row" style={{ height: 'calc(100vh - 150px)' }}>
                <div className="col-12">
                    <VinylShelf />
                </div>
            </div>
            <footer>
                <span>WiLliⒶMr0y</span>
            </footer>
        </div>
    );
};

export default Layout;
