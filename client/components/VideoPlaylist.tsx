import React, { useState, useEffect, useContext, FC } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces'; // your local types
import { Box, Stack, Button, Text, Loader } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

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
}

const VideoPlaylist: FC<VideoPlaylistProps> = ({ releaseId }) => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedDiscogsRelease } = discogsReleaseState;
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        getDiscogsRelease(releaseId)
            .then((discogsRelease: DiscogsRelease) => {
                dispatchDiscogsRelease({
                    type: 'SET_SELECTED_DISCOGS_RELEASE',
                    payload: discogsRelease,
                });

                if (
                    selectedDiscogsRelease.videos &&
                    selectedDiscogsRelease.videos.length > 0
                ) {
                    // Automatically select the first video in the list
                    const firstVideoId = extractYouTubeVideoId(
                        selectedDiscogsRelease.videos[0].uri,
                    );
                    setSelectedVideo(firstVideoId);
                }
            })
            .catch(error =>
                console.error(
                    'something went wrong with fetching discogs release,',
                    error.response,
                ),
            )
            .finally(() => setLoading(false));
    }, [releaseId]);

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
                    <iframe
                        width="100%"
                        height="350"
                        src={`https://www.youtube.com/embed/${selectedVideo}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                    ></iframe>
                </Box>
            )}
        </Box>
    );
};

export default VideoPlaylist;
