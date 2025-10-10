import React, { useContext } from 'react';
import { Box, Text, Group, Paper } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';

interface TrackDetailProps {
    selectedDiscogsRelease: any;
}

const scrubTitle = (s?: string) =>
    (s ?? '')
        .normalize('NFKD') // turn 𝐀 → A, 𝟗 → 9, etc.
        .replace(/[\u0300-\u036f]/g, '') // remove combining marks
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
        .replace(/<[^>]*>/g, '') // strip HTML tags just in case
        .replace(/\s+/g, ' ')
        .trim();

const TrackDetail: React.FC<TrackDetailProps> = ({
    selectedDiscogsRelease,
}) => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    if (!selectedDiscogsRelease) return null;

    return (
        <Box>
            <Paper
                radius="md" // lg/xl if you want more roundness
                p="xs"
                style={{ background: '#0e0e0f' }}
            >
                <Box className={'track-detail-box'}>
                    <Box className="track-detail-content">
                        <Text className="track-detail-text" lh={1}>
                            ♪{' '}
                            {scrubTitle(controls?.videoTitle) ||
                                'No title available'}
                        </Text>

                        {/* Artist */}
                        <Group>
                            <Text className="track-detail-text" lh={1}>
                                a: {selectedDiscogsRelease?.artists_sort}
                            </Text>
                        </Group>

                        {/* Release */}
                        <Group>
                            <Text className="track-detail-text" lh={1}>
                                r: {selectedDiscogsRelease?.title} (
                                {selectedDiscogsRelease?.year})
                            </Text>
                        </Group>

                        {/* Label + Catalog number */}
                        <Group>
                            <Text
                                className="track-detail-text"
                                lh={1}
                                style={{}}
                            >
                                #:{' '}
                                {selectedDiscogsRelease?.labels?.[0]?.catno ||
                                    ''}{' '}
                                (
                                {selectedDiscogsRelease?.labels?.[0]?.name ||
                                    ''}
                                )
                            </Text>
                        </Group>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default TrackDetail;
