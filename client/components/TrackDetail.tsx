import React, { useContext } from 'react';
import { Box, Text, Group } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';

interface TrackDetailProps {
    selectedDiscogsRelease: any;
}

const TrackDetail: React.FC<TrackDetailProps> = ({
    selectedDiscogsRelease,
}) => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    // Common styles for both boxes
    const commonBoxStyles = {
        backgroundColor: 'black',
        color: 'white',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingRight: '2px',
        paddingLeft: '4px',
        marginLeft: '-2px',
        marginRight: '-2px',
    };

    return selectedDiscogsRelease ? (
        <Box>
            {/* Top Box: Video Title */}
            {controls?.videoTitle && (
                <Box style={commonBoxStyles} mt="-2px">
                    <Text size="sm">
                        Playing: {controls?.videoTitle || 'No title available'}
                    </Text>
                </Box>
            )}

            {/* Bottom Box: Release Details */}
            <Box style={commonBoxStyles} mt="4px" mb="-2px">
                <Group align="left">
                    <Text size="sm">
                        Release: {selectedDiscogsRelease?.title} (
                        {selectedDiscogsRelease?.year})
                    </Text>
                    <Text size="sm">
                        Artist: {selectedDiscogsRelease?.artists_sort}
                    </Text>
                    <Text size="sm">Year: {selectedDiscogsRelease?.year}</Text>
                </Group>
            </Box>
        </Box>
    ) : null;
};

export default TrackDetail;
