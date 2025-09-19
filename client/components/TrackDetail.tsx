import React, { useContext } from 'react';
import { Box, Text, Group, Paper } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';

interface TrackDetailProps {
    selectedDiscogsRelease: any;
    preview?: boolean;
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
    preview,
}) => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    if (!selectedDiscogsRelease) return null;

    return (
        <Box>
            <Paper
                radius="md" // lg/xl if you want more roundness
                p="xs"
                className={preview ? 'preview' : undefined}
                style={{ background: '#0e0e0f' }}
            >
                <Box className={`track-detail-box ${preview ? 'preview' : ''}`}>
                    <Box className="track-detail-content">
                        {!preview && (
                            <Text className="track-detail-text" lh={1}>
                                ♪{' '}
                                {scrubTitle(controls?.videoTitle) ||
                                    'No title available'}
                            </Text>
                        )}

                        {/* Artist */}
                        <Group gap={2}>
                            <Text className="track-detail-text" lh={1}>
                                a: {selectedDiscogsRelease?.artists_sort}
                            </Text>
                        </Group>

                        {/* Release */}
                        <Group gap={2}>
                            <Text className="track-detail-text" lh={1}>
                                r: {selectedDiscogsRelease?.title} (
                                {selectedDiscogsRelease?.year})
                            </Text>
                        </Group>

                        {/* Label + Catalog number */}
                        <Group gap={2}>
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
