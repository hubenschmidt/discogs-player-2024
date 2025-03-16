import React, { useState, useEffect, FC } from 'react';
import { getRelease } from '../api';
import { DiscogsRelease } from '../interfaces'; // your local types
import { Box, Stack, Button, Text, Loader } from '@mantine/core';

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
    const [release, setRelease] = useState<DiscogsRelease | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setLoading(true);
        getRelease(releaseId)
            .then((data: DiscogsRelease) => {
                setRelease(data);
                if (data.videos && data.videos.length > 0) {
                    // Automatically select the first video in the list
                    const firstVideoId = extractYouTubeVideoId(
                        data.videos[0].uri,
                    );
                    setSelectedVideo(firstVideoId);
                }
            })
            .catch(error => console.error(error))
            .finally(() => setLoading(false));
    }, [releaseId]);

    if (loading) return <Loader />;

    if (!release || !release.videos || release.videos.length === 0) {
        return <Text>No videos available</Text>;
    }

    return (
        <Box>
            {/* Playlist of videos */}
            <Text>{release.artists_sort}</Text>
            <Stack align="center" mb="md">
                {release.videos.map((video, index) => {
                    console.log(release, video);
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
                        height="450"
                        src={`https://www.youtube.com/embed/${selectedVideo}`}
                        frameBorder="0"
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
