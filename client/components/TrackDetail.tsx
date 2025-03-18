import React, { useContext } from 'react';
import { Box, Title, Text, Group } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';

interface TrackDetailProps {
    selectedDiscogsRelease: any;
}

const TrackDetail: React.FC<TrackDetailProps> = ({
    selectedDiscogsRelease,
}) => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    return (
        <Box
            p="xs"
            style={{
                backgroundColor: 'black',
                color: 'white',
            }}
        >
            <Text size="lg" style={{ fontWeight: 300 }} mb="md">
                {controls?.videoTitle || 'No title available'}
            </Text>

            <Group align="left">
                <Text size="sm">
                    <strong>Release:</strong> {selectedDiscogsRelease?.title} (
                    {selectedDiscogsRelease?.year})
                </Text>
                <Text size="sm">
                    <strong>Artist:</strong>{' '}
                    {selectedDiscogsRelease?.artists_sort}
                </Text>
                <Text size="sm">
                    <strong>Year:</strong> {selectedDiscogsRelease?.year}
                </Text>
            </Group>
        </Box>
    );
};

export default TrackDetail;
