import React, { useState, useEffect, useContext } from 'react';
import {
    Box,
    Stack,
    Button,
    Text,
    Loader,
    ActionIcon,
    Tooltip,
    Group,
} from '@mantine/core';
import { Plus } from 'lucide-react';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlaylistContext } from '../context/playlistContext';
import { UserContext } from '../context/userContext';
import { getDiscogsRelease, updateVideoPlayCount } from '../api';
import { useBearerToken } from '../hooks/useBearerToken';
import { getPlaylists } from '../api';
import AddToPlaylistModal from './AddToPlaylistModal';

const ReleaseVideos = () => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { dispatchPlaylist } = useContext(PlaylistContext);
    const {
        selectedDiscogsRelease,
        previewRelease,
        selectedRelease,
        selectedVideo,
        previewDiscogsRelease,
        playbackMode,
    } = discogsReleaseState;
    const { userState } = useContext(UserContext);
    const { username } = userState;
    const [loadingSel, setLoadingSel] = useState(false);
    const [loadingPrev, setLoadingPrev] = useState(false);
    const bearerToken = useBearerToken();

    const handleAdd = async () => {
        getPlaylists(userState?.username, bearerToken, {
            orderBy: 'updatedAt',
            order: 'DESC',
        })
            .then(res => {
                dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res });
                dispatchPlaylist({ type: 'SET_ADD_MODAL', payload: true });
            })
            .catch(err => console.log(err));
    };

    // 1) shared handler
    const playVideo = (
        video: any,
        idx: number,
        opts?: { openAdd?: boolean },
    ) => {
        // If we were previewing a different release, promote it to selected first
        if (previewRelease) {
            dispatchDiscogsRelease({
                type: 'MERGE_STATE',
                payload: {
                    selectedRelease: previewRelease,
                    selectedDiscogsRelease: activeDiscogs,
                    previewRelease: null,
                    previewDiscogsRelease: null,
                },
            });
        }

        // Seed queue & select the video
        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: {
                items: activeDiscogs.videos,
                startIndex: idx,
                mode: 'release',
            },
        });

        dispatchDiscogsRelease({
            type: 'SET_SELECTED_VIDEO',
            payload: video,
        });

        if (opts?.openAdd) {
            handleAdd();
        }
    };

    // ---- Fetch full discogs for selected release
    useEffect(() => {
        if (!selectedRelease?.Release_Id) return;
        setLoadingSel(true);
        getDiscogsRelease(selectedRelease.Release_Id, bearerToken)
            .then(full => {
                dispatchDiscogsRelease({
                    type: 'SET_SELECTED_DISCOGS_RELEASE',
                    payload: full,
                });
            })
            .catch(err =>
                console.error(
                    'fetch selected discogs failed',
                    err?.response || err,
                ),
            )
            .finally(() => setLoadingSel(false));
    }, [selectedRelease?.Release_Id]);

    // ---- Fetch full discogs for preview release
    useEffect(() => {
        if (!previewRelease?.Release_Id) return;
        setLoadingPrev(true);
        getDiscogsRelease(previewRelease.Release_Id, bearerToken)
            .then(full => {
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

    // Which release's videos to show
    const activeDiscogs = previewDiscogsRelease ?? selectedDiscogsRelease;
    const loading = loadingPrev || loadingSel;

    // ---- A) Auto-select first video (no API call here)
    useEffect(() => {
        if (playbackMode === 'playlist') return;
        // Only auto-select when we are on the playing (selected) release and not previewing
        if (previewDiscogsRelease) return;

        const vids = selectedDiscogsRelease?.videos;
        if (!vids?.length) return;

        const hasCurrent =
            selectedVideo && vids.some((v: any) => v.uri === selectedVideo.uri);

        // Seed the release queue first (start at current if already selected)
        const startIndex = hasCurrent
            ? vids.findIndex((v: any) => v.uri === selectedVideo?.uri)
            : 0;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: vids, startIndex, mode: 'release' },
        });

        if (!hasCurrent) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: vids[0],
            });
        }
    }, [selectedDiscogsRelease, previewDiscogsRelease]); // intentionally NOT watching selectedVideo

    // ---- B) Count plays exactly once per (releaseId|videoUri)
    useEffect(() => {
        const releaseId = selectedRelease?.Release_Id;
        const videoUri = selectedVideo?.uri;
        if (!releaseId || !videoUri) return;

        updateVideoPlayCount(
            releaseId,
            selectedVideo,
            username,
            bearerToken,
        ).catch(console.error);
    }, [selectedRelease?.Release_Id, selectedVideo?.uri]);

    // when selectedDiscogsRelease changes, seed queue with its videos
    useEffect(() => {
        // ⬅️ don't overwrite the queue if we're playing a playlist
        if (playbackMode === 'playlist') return;
        const vids = selectedDiscogsRelease?.videos ?? [];
        if (!vids.length) return;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: vids, startIndex: 0, mode: 'release' },
        });
    }, [selectedDiscogsRelease?.id]); // or Release_Id, or videos array ref

    if (loading) return <Loader />;
    if (
        selectedDiscogsRelease &&
        selectedDiscogsRelease?.videos?.length === 0
    ) {
        return <Text>No videos available</Text>;
    }

    return (
        <Box>
            <Stack>
                <Group justify="space-between" align="center" mb="10px">
                    <Text fw={700} fz="lg" c="white">
                        Tracks
                    </Text>
                </Group>
                {activeDiscogs?.videos.map((video: any, idx: number) => {
                    const isSelected = selectedVideo?.uri === video.uri;
                    console.log(video.title);

                    return (
                        <Button
                            size="md"
                            rightSection={
                                <Tooltip
                                    label="Add to playlist"
                                    withArrow
                                    openDelay={400}
                                    closeDelay={100}
                                    withinPortal
                                >
                                    <ActionIcon
                                        variant="light-transparent"
                                        onClick={e => {
                                            e.stopPropagation();
                                            playVideo(video, idx, {
                                                openAdd: true,
                                            });
                                        }}
                                    >
                                        <Plus size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            }
                            key={idx}
                            variant={isSelected ? 'filled' : 'light'}
                            color="gray"
                            onClick={() => playVideo(video, idx)}
                            mt="-16px"
                            styles={{
                                root: {
                                    justifyContent: 'flex-start',
                                },
                                label: {
                                    justifyContent: 'flex-start',
                                    width: '100%',
                                    textAlign: 'left',
                                },
                            }}
                        >
                            {video.title}
                        </Button>
                    );
                })}
            </Stack>
            <AddToPlaylistModal />
        </Box>
    );
};

export default ReleaseVideos;
