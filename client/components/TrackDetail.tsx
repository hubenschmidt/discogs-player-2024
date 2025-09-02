import React, { useContext } from 'react';
import { Box, Text, Group } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
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
    const isDesktop = useMediaQuery('(min-width: 768px)');

    const commonBoxStyles = {
        backgroundColor: preview ? 'blue' : 'black',
        color: 'white',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingRight: '2px',
        paddingLeft: '4px',
        marginLeft: '-2px',
        marginRight: '-2px',
    };

    return selectedDiscogsRelease ? (
        <Box m={'0 3.5 3 3'}>
            <Box style={commonBoxStyles}>
                <Box
                    style={{
                        display: 'flex',
                        flexDirection: isDesktop ? 'row' : 'column',
                        justifyContent: isDesktop ? 'center' : 'flex-start',
                        gap: 10,
                    }}
                >
                    {!preview && (
                        <Text size="sm" lh={1}>
                            ♪ {controls?.videoTitle || 'No title available'}
                        </Text>
                    )}

                    {/* Artist */}
                    <Group gap={2}>
                        <Text size="sm" c="gray" lh={1}>
                            a:
                        </Text>
                        <Text size="sm" lh={1}>
                            {selectedDiscogsRelease?.artists_sort}
                        </Text>
                    </Group>

                    {/* Release */}
                    <Group gap={2}>
                        <Text size="sm" c="gray" lh={1}>
                            r:
                        </Text>
                        <Text size="sm" lh={1}>
                            {selectedDiscogsRelease?.title} (
                            {selectedDiscogsRelease?.year})
                        </Text>
                    </Group>

                    {/* Label + Catalog number */}
                    <Group gap={2}>
                        <Text size="sm" c="gray" lh={1}>
                            #:
                        </Text>
                        <Text size="sm" lh={1}>
                            {selectedDiscogsRelease?.labels?.[0]?.catno || ''} (
                            {selectedDiscogsRelease?.labels?.[0]?.name || ''})
                        </Text>
                    </Group>
                </Box>
            </Box>
        </Box>
    ) : null;
};

export default TrackDetail;
