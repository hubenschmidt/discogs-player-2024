import React from 'react';
import { Box, Text } from '@mantine/core';

const RecordItem = ({
    release,
    index,
    isSelected,
    isPreview,
    isLoading,
    onClick,
}) => {
    const handleClick = () => {
        if (isLoading) return;
        onClick(release, index);
    };

    return (
        <Box
            className="vinyl-record"
            onClick={handleClick}
            style={{
                pointerEvents: isLoading ? 'none' : 'auto',
            }}
        >
            <Box
                className={`record-cover ${
                    isSelected ? 'selected-record-cover' : ''
                } ${isPreview ? 'preview-record-cover' : ''}`}
                style={{
                    backgroundImage: `url(${release.Thumb})`,
                }}
            />

            <Text className="record-title" fw="400">
                {release.Title}
            </Text>
            <Text className="record-title" fw="200">
                {release.Artists[0]?.Name}
            </Text>
        </Box>
    );
};

export default RecordItem;
