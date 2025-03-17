import React, { useState, useEffect, useContext, FC } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces'; // your local types
import { Box, Stack, Button, Text, Loader, Group, Switch } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import CustomYouTubePlayer from './CustomYoutubePlayer';
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
            <Group mb="md">
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
            <Stack align="center" mb="md">
                {selectedDiscogsRelease.videos.map((video, index) => {
                    const videoId = extractYouTubeVideoId(video.uri);
                    return (
                        <Button
                            key={index}
                            variant={
                                videoId === selectedVideo ? 'filled' : 'outline'
                            }
                            onClick={() =>
                                dispatchDiscogsRelease({
                                    type: 'SET_SELECTED_VIDEO',
                                    payload: videoId,
                                })
                            }
                            style={{
                                textTransform: 'none',
                                width: '100%',
                            }}
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
