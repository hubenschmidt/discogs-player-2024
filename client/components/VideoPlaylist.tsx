import React, { useState, useEffect, useContext, FC } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces'; // your local types
import { Box, Stack, Button, Text, Loader, Group, Switch } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import CustomYouTubePlayer from './CustomYoutubePlayer';

// Helper function to extract a YouTube video ID from a URL
const extractYouTubeVideoId = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('youtube.com')) {
            return parsedUrl.searchParams.get('v');
        }
        if (parsedUrl.hostname === 'youtu.be') {
            return parsedUrl.pathname.slice(1);
        }
        return null;
    } catch (error) {
        console.error('Invalid URL:', url);
        return null;
    }
};

interface VideoPlaylistProps {
    releaseId: number;
    onNextRelease?: () => void;
}

const VideoPlaylist: FC<VideoPlaylistProps> = ({
    releaseId,
    onNextRelease,
}) => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedDiscogsRelease } = discogsReleaseState;
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [continuousPlay, setContinuousPlay] = useState<boolean>(false);

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
            selectedDiscogsRelease.videos &&
            selectedDiscogsRelease.videos.length > 0
        ) {
            const firstVideoId = extractYouTubeVideoId(
                selectedDiscogsRelease.videos[0].uri,
            );
            setSelectedVideo(firstVideoId);
        }
    }, [selectedDiscogsRelease]);

    const handleVideoEnd = () => {
        // Guard: If no release or no videos, exit early
        if (
            !selectedDiscogsRelease ||
            !selectedDiscogsRelease.videos ||
            selectedDiscogsRelease.videos.length === 0
        ) {
            return;
        }

        const videos = selectedDiscogsRelease.videos;
        const currentIndex = videos.findIndex(
            video => extractYouTubeVideoId(video.uri) === selectedVideo,
        );

        // If a valid index is found and it’s not the last video, advance to the next video
        if (currentIndex !== -1 && currentIndex < videos.length - 1) {
            setSelectedVideo(
                extractYouTubeVideoId(videos[currentIndex + 1].uri),
            );
            return;
        }

        // If continuous play is enabled and a next release callback is provided, trigger it
        if (continuousPlay && onNextRelease) {
            onNextRelease();
            return;
        }

        // Otherwise, loop back to the first video
        setSelectedVideo(extractYouTubeVideoId(videos[0].uri));
    };

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
                    onChange={e => setContinuousPlay(e.currentTarget.checked)}
                />
            </Group>
            {/* Playlist of videos */}
            <Text>{selectedDiscogsRelease.artists_sort}</Text>
            <Stack align="center" mb="md">
                {selectedDiscogsRelease.videos.map((video, index) => {
                    const videoId = extractYouTubeVideoId(video.uri);
                    return (
                        <>
                            <Button
                                key={index}
                                variant={
                                    videoId === selectedVideo
                                        ? 'filled'
                                        : 'outline'
                                }
                                onClick={() => setSelectedVideo(videoId)}
                                style={{
                                    textTransform: 'none',
                                    width: '100%',
                                }}
                            >
                                {video.title}
                            </Button>
                        </>
                    );
                })}
            </Stack>

            {/* Embedded YouTube Player */}
            {selectedVideo && (
                <Box maw={800} mx="auto">
                    <CustomYouTubePlayer
                        videoId={selectedVideo}
                        onEnd={handleVideoEnd}
                    />
                </Box>
            )}
        </Box>
    );
};

export default VideoPlaylist;
