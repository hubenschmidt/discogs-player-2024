// TrackDetail.tsx
import React, { useContext } from 'react';
import { Box, Text, Group } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';

interface TrackDetailProps {
    selectedDiscogsRelease: any;
    preview?: boolean;
}

const TrackDetail: React.FC<TrackDetailProps> = ({
    selectedDiscogsRelease,
    preview,
}) => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    if (!selectedDiscogsRelease) return null;

    return (
        <Box m="0 3.5 3 3">
            <Box className={`track-detail-box ${preview ? 'preview' : ''}`}>
                <Box className="track-detail-content">
                    {!preview && (
                        <Text className="track-detail-text" lh={1}>
                            ♪ {controls?.videoTitle || 'No title available'}
                        </Text>
                    )}

                    {/* Artist */}
                    <Group gap={2}>
                        <Text
                            className="track-detail-text track-detail-muted"
                            lh={1}
                        >
                            a:
                        </Text>
                        <Text className="track-detail-text" lh={1}>
                            {selectedDiscogsRelease?.artists_sort}
                        </Text>
                    </Group>

                    {/* Release */}
                    <Group gap={2}>
                        <Text
                            className="track-detail-text track-detail-muted"
                            lh={1}
                        >
                            r:
                        </Text>
                        <Text className="track-detail-text" lh={1}>
                            {selectedDiscogsRelease?.title} (
                            {selectedDiscogsRelease?.year})
                        </Text>
                    </Group>

                    {/* Label + Catalog number */}
                    <Group gap={2}>
                        <Text
                            className="track-detail-text track-detail-muted"
                            lh={1}
                        >
                            #:
                        </Text>
                        <Text className="track-detail-text" lh={1}>
                            {selectedDiscogsRelease?.labels?.[0]?.catno || ''} (
                            {selectedDiscogsRelease?.labels?.[0]?.name || ''})
                        </Text>
                    </Group>
                </Box>
            </Box>
        </Box>
    );
};

export default TrackDetail;
