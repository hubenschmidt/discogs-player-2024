import React, { useState, useEffect, useContext } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces';
import { Box, Stack, Button, Text, Loader, Group, Switch } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';
import { useBearerToken } from '../hooks/useBearerToken';

const VideoPlaylist = () => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const {
        selectedDiscogsRelease,
        previewRelease,
        selectedRelease,
        continuousPlay,
        selectedVideo,
        previewDiscogsRelease,
    } = discogsReleaseState;
    const [loadingSel, setLoadingSel] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const bearerToken = useBearerToken();

    // Fetch Discogs data for the currently playing (selected) release
    useEffect(() => {
        if (selectedRelease?.Release_Id) {
            setLoadingSel(true);
            getDiscogsRelease(selectedRelease.Release_Id, bearerToken)
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
                .finally(() => setLoadingSel(false));
        }
    }, [selectedRelease?.Release_Id]);

    // Choose which discogs release to render in the playlist:
    const activeDiscogs = previewDiscogsRelease ?? selectedDiscogsRelease;
    const loading = loadingPrev || loadingSel;

    // Only set auto-selected video when the **active** discogs changes,
    // and only if no selectedVideo is currently set
    useEffect(() => {
        if (!activeDiscogs?.videos?.length) return;
        if (selectedVideo) return; // respect existing choice
        const first = extractYouTubeVideoId(activeDiscogs.videos[0].uri);
        dispatchDiscogsRelease({ type: 'SET_SELECTED_VIDEO', payload: first });
    }, [activeDiscogs]);

    // Fetch Discogs data for the preview release (browsing)
    useEffect(() => {
        if (!previewRelease?.Release_Id) return;
        setLoadingPrev(true);
        getDiscogsRelease(previewRelease.Release_Id, bearerToken)
            .then((full: DiscogsRelease) => {
                dispatchDiscogsRelease({
                    type: 'SET_PREVIEW_DISCOGS_RELEASE',
                    payload: full,
                });
            })
            .catch(err =>
                console.error(
                    'fetch preview discogs failed',
                    err?.response || err,
                ),
            )
            .finally(() => setLoadingPrev(false));
    }, [previewRelease?.Release_Id]);

    useEffect(() => {
        if (
            selectedDiscogsRelease &&
            selectedDiscogsRelease?.videos &&
            selectedDiscogsRelease?.videos?.length > 0
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
        selectedDiscogsRelease &&
        selectedDiscogsRelease?.videos?.length === 0
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
                {activeDiscogs?.videos.map((video, idx) => {
                    const videoId = extractYouTubeVideoId(video.uri);
                    const isSelected = videoId === selectedVideo;
                    return (
                        <Button
                            key={idx}
                            variant="filled"
                            onClick={() => {
                                // Promote preview to selected if we are browsing
                                if (previewRelease) {
                                    dispatchDiscogsRelease({
                                        type: 'SET_SELECTED_RELEASE',
                                        payload: previewRelease,
                                    });
                                    dispatchDiscogsRelease({
                                        type: 'SET_SELECTED_DISCOGS_RELEASE',
                                        payload: activeDiscogs,
                                    });
                                    // Optional: clear preview now that it’s “promoted”
                                    dispatchDiscogsRelease({
                                        type: 'SET_PREVIEW_RELEASE',
                                        payload: null,
                                    });
                                    dispatchDiscogsRelease({
                                        type: 'SET_PREVIEW_DISCOGS_RELEASE',
                                        payload: null,
                                    });
                                }
                                // Set the chosen video
                                dispatchDiscogsRelease({
                                    type: 'SET_SELECTED_VIDEO',
                                    payload: videoId,
                                });
                            }}
                            mt="-15px"
                            styles={() => ({
                                root: {
                                    backgroundColor: isSelected
                                        ? '#fff'
                                        : '#40343d',
                                    color: isSelected ? '#000' : '#fff',
                                    fontWeight: '100',
                                    '&:hover': {
                                        backgroundColor: isSelected
                                            ? '#f0f0f0'
                                            : '#000',
                                    },
                                },
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
