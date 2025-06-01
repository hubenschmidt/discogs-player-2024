import React, { useState, useEffect, useContext, FC } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces';
import { Box, Stack, Button, Text, Loader, Group, Switch } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';

interface VideoPlaylistProps {
    releaseId: number;
}

const VideoPlaylist: FC<VideoPlaylistProps> = ({ releaseId }) => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedDiscogsRelease, continuousPlay, selectedVideo } =
        discogsReleaseState;
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        getDiscogsRelease(releaseId)
            .then((discogsRelease: DiscogsRelease) => {
                dispatchDiscogsRelease({
                    type: 'SET_SELECTED_DISCOGS_RELEASE',
                    payload: discogsRelease,
                });
            })
            .catch(error =>
                console.error(
                    'something went wrong with fetching discogs release,',
                    error.response || error,
                ),
            )
            .finally(() => setLoading(false));
    }, [releaseId]);

    useEffect(() => {
        if (
            selectedDiscogsRelease &&
            selectedDiscogsRelease.videos &&
            selectedDiscogsRelease.videos.length > 0
        ) {
            const firstVideoId = extractYouTubeVideoId(
                selectedDiscogsRelease.videos[0].uri,
            );
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: firstVideoId,
            });
        }
    }, [selectedDiscogsRelease]);

    if (loading) return <Loader />;

    if (
        !selectedDiscogsRelease ||
        !selectedDiscogsRelease.videos ||
        selectedDiscogsRelease.videos.length === 0
    ) {
        return <Text>No videos available</Text>;
    }

    return (
        <Box>
            {/* Toggle Continuous Play Mode */}
            <Group mb="lg">
                <Switch
                    label="Continuous Play"
                    checked={continuousPlay}
                    onChange={e =>
                        dispatchDiscogsRelease({
                            type: 'SET_CONTINUOUS_PLAY',
                            payload: e.currentTarget.checked,
                        })
                    }
                />
            </Group>
            {/* Playlist of videos */}
            <Stack>
                {selectedDiscogsRelease.videos.map((video, index) => {
                    const videoId = extractYouTubeVideoId(video.uri);
                    const isSelected = videoId === selectedVideo;

                    return (
                        <Button
                            key={index}
                            variant="filled"
                            onClick={() =>
                                dispatchDiscogsRelease({
                                    type: 'SET_SELECTED_VIDEO',
                                    payload: videoId,
                                })
                            }
                            mt="-15px"
                            styles={() => ({
                                root: {
                                    // White background with black text if selected;
                                    // black background with white text if not selected
                                    backgroundColor: isSelected
                                        ? '#fff'
                                        : '#40343d',
                                    color: isSelected ? '#000' : '#fff',
                                    fontWeight: '100',
                                    // Optional hover states:
                                    '&:hover': {
                                        backgroundColor: isSelected
                                            ? '#f0f0f0'
                                            : '#000',
                                    },
                                },
                                // Left-align label
                                label: {
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    textAlign: 'left',
                                },
                            })}
                        >
                            {video.title}
                        </Button>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default VideoPlaylist;
