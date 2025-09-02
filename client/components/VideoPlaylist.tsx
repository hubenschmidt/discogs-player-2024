import React, { useState, useEffect, useContext } from 'react';
import { getDiscogsRelease } from '../api';
import { DiscogsRelease } from '../interfaces';
import { Box, Stack, Button, Text, Loader } from '@mantine/core';
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

    // Auto-select first video ONLY for the selected release (not preview) and
    // ONLY if selectedVideo is missing or invalid for this release.
    useEffect(() => {
        // don't auto-select if we are browsing a preview
        if (previewDiscogsRelease) return;

        const vids = selectedDiscogsRelease?.videos;
        console.log(vids);
        if (!vids?.length) return;

        const ids = vids.map(v => extractYouTubeVideoId(v.uri));
        const hasCurrent = selectedVideo && ids.includes(selectedVideo);
        if (!hasCurrent) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: ids[0],
            });
        }
    }, [selectedDiscogsRelease, previewDiscogsRelease, selectedVideo]);
    if (loading) return <Loader />;

    if (
        selectedDiscogsRelease &&
        selectedDiscogsRelease?.videos?.length === 0
    ) {
        return <Text>No videos available</Text>;
    }

    return (
        <Box>
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
                                    // Clear preview now that it’s “promoted”
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
                            mt="-16px"
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
