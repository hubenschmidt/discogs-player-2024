import React, { useContext } from 'react';
import { Box, Text, Group, Paper } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { isIOS } from './CustomYoutubePlayer';

const scrubTitle = (s) =>
    (s ?? '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const TrackDetail = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(DiscogsReleaseContext);
    const { selectedDiscogsRelease, previewRelease } = discogsReleaseState;

    if (!selectedDiscogsRelease) return null;

    return (
        <Box>
            <Paper radius="md" p="xs" style={{ background: '#0e0e0f' }}>
                <Box className="track-detail-box">
                    <Box className="track-detail-content">
                        {/* Always show video title */}
                        <Text className="track-detail-text" lh={1}>
                            ♪{' '}
                            {scrubTitle(controls?.videoTitle) ||
                                'No title available'}
                        </Text>

                        {/* Hide the rest on iOS */}
                        {!isIOS() && (
                            <>
                                <Group>
                                    <Text className="track-detail-text" lh={1}>
                                        a:{' '}
                                        {selectedDiscogsRelease?.artists_sort}
                                    </Text>
                                </Group>
                                <Group>
                                    <Text
                                        className="track-detail-text track-detail-link"
                                        lh={1}
                                        onClick={() => {
                                            dispatchDiscogsRelease({ type: 'SET_PREVIEW_RELEASE', payload: null });
                                            dispatchDiscogsRelease({ type: 'SET_PREVIEW_DISCOGS_RELEASE', payload: null });
                                        }}
                                    >
                                        r: {selectedDiscogsRelease?.title} (
                                        {selectedDiscogsRelease?.year})
                                    </Text>
                                </Group>
                                <Group>
                                    <Text className="track-detail-text" lh={1}>
                                        #:{' '}
                                        {selectedDiscogsRelease?.labels?.[0]
                                            ?.catno || ''}{' '}
                                        (
                                        {selectedDiscogsRelease?.labels?.[0]
                                            ?.name || ''}
                                        )
                                    </Text>
                                </Group>
                            </>
                        )}
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TrackDetail;
