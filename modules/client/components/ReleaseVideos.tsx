import React, { useEffect, useContext } from 'react';
import { Box, Stack, Button, ActionIcon, Tooltip, Text } from '@mantine/core';
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

    const activeDiscogs = previewDiscogsRelease ?? selectedDiscogsRelease;
    const videos = activeDiscogs?.videos || [];

    const playVideo = (
        video: any,
        idx: number,
        opts?: { openAdd?: boolean },
    ) => {
        const items = videos;
        if (!items.length) return;

        const startIndex = Math.max(0, Math.min(idx, items.length - 1));

        dispatchDiscogsRelease({
            type: 'MERGE_STATE',
            payload: {
                ...(previewRelease && {
                    selectedRelease: previewRelease,
                    selectedDiscogsRelease: activeDiscogs,
                    previewRelease: null,
                    previewDiscogsRelease: null,
                }),
                queue: items,
                queueIndex: startIndex,
                playbackMode: 'release',
                selectedVideo: video,
                isPlaying: true,
            },
        });

        if (opts?.openAdd) handleAdd();
    };

    // fetch effects unchanged...
    useEffect(() => {
        if (!selectedRelease?.Release_Id) return;
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
            );
    }, [selectedRelease?.Release_Id]);

    useEffect(() => {
        if (!previewRelease?.Release_Id) return;
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
            );
    }, [previewRelease?.Release_Id]);

    useEffect(() => {
        if (playbackMode === 'playlist') return;
        if (previewDiscogsRelease) return;

        if (!videos.length) return;

        const hasCurrent =
            selectedVideo &&
            videos.some((v: any) => v.uri === selectedVideo.uri);
        const startIndex = hasCurrent
            ? videos.findIndex((v: any) => v.uri === selectedVideo?.uri)
            : 0;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: videos, startIndex, mode: 'release' },
        });

        if (!hasCurrent) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: videos[0],
            });
        }

        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: true });
    }, [selectedDiscogsRelease, previewDiscogsRelease]); // intentionally not watching selectedVideo

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

    useEffect(() => {
        if (playbackMode === 'playlist') return;
        if (!videos.length) return;

        const curUri = selectedVideo?.uri;
        const currentIsInThisRelease =
            !!curUri && videos.some((v: any) => v.uri === curUri);
        if (currentIsInThisRelease) return;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: videos, startIndex: 0, mode: 'release' },
        });
    }, [
        selectedDiscogsRelease?.id,
        playbackMode,
        selectedVideo?.uri,
        videos.length,
    ]);

    return (
        <Box mt="21">
            {Array.isArray(videos) && videos.length === 0 ? (
                <Text c="dimmed" fs="italic">
                    No videos available for this release. Add videos on the
                    Discogs release page!
                </Text>
            ) : (
                <Stack>
                    {videos.map((video: any, idx: number) => {
                        const isSelected = selectedVideo?.uri === video.uri;
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
                                            color="gray"
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
                                color="#535046"
                                onClick={() => playVideo(video, idx)}
                                mt="-16px"
                                styles={{
                                    root: { justifyContent: 'flex-start' },
                                    label: {
                                        justifyContent: 'flex-start',
                                        width: '100%',
                                        textAlign: 'left',
                                        fontWeight: 200,
                                    },
                                }}
                            >
                                {video.title}
                            </Button>
                        );
                    })}
                </Stack>
            )}
            <AddToPlaylistModal />
        </Box>
    );
};

export default ReleaseVideos;
