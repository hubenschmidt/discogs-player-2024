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
import { isIOS } from './CustomYoutubePlayer';

const ReleaseVideos = () => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { dispatchPlaylist } = useContext(PlaylistContext);
    const {
        selectedDiscogsRelease,
        previewDiscogsRelease,
        selectedRelease,
        previewRelease,
        selectedVideo,
        playbackMode,
    } = discogsReleaseState;
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    // --- UI vs Playback sources ---------------------------------------------
    const displayRelease = previewDiscogsRelease ?? selectedDiscogsRelease; // UI renders preview if present
    const displayVideos = displayRelease?.videos || []; // UI list

    const selectedVideos = selectedDiscogsRelease?.videos || []; // playback source ONLY

    const handleAdd = async () => {
        getPlaylists(userState?.username, bearerToken, {
            orderBy: 'updatedAt',
            order: 'DESC',
        })
            .then(res => {
                dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res });
                dispatchPlaylist({ type: 'SET_ADD_MODAL', payload: true });
            })
            .catch(console.log);
    };

    const playVideo = (
        video: any,
        idx: number,
        opts?: { openAdd?: boolean },
    ) => {
        const items = displayVideos; // list the user is seeing/clicking
        if (!items.length) return;

        const startIndex = Math.max(0, Math.min(idx, items.length - 1));

        dispatchDiscogsRelease({
            type: 'MERGE_STATE',
            payload: {
                // Promote preview -> selected only when user explicitly clicks a video
                ...(previewRelease && {
                    selectedRelease: previewRelease,
                    selectedDiscogsRelease: displayRelease,
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

    // --- Fetch full objects for selected & preview ---------------------------
    useEffect(() => {
        if (!selectedRelease?.Release_Id) return;
        getDiscogsRelease(
            selectedRelease.Release_Id,
            userState?.username,
            bearerToken,
        )
            .then(full =>
                dispatchDiscogsRelease({
                    type: 'SET_SELECTED_DISCOGS_RELEASE',
                    payload: full,
                }),
            )
            .catch(err =>
                console.error(
                    'fetch selected discogs failed',
                    err?.response || err,
                ),
            );
    }, [selectedRelease?.Release_Id]);

    useEffect(() => {
        if (!previewRelease?.Release_Id) return;
        getDiscogsRelease(
            previewRelease.Release_Id,
            userState?.username,
            bearerToken,
        )
            .then(full =>
                dispatchDiscogsRelease({
                    type: 'SET_PREVIEW_DISCOGS_RELEASE',
                    payload: full,
                }),
            )
            .catch(err =>
                console.error(
                    'fetch preview discogs failed',
                    err?.response || err,
                ),
            );
    }, [previewRelease?.Release_Id]);

    // --- Autoplay / initial queue: ONLY off the selected release -------------
    useEffect(() => {
        if (playbackMode === 'playlist') return;
        if (!selectedVideos.length) return; // <- use selectedVideos, not displayVideos

        const hasCurrent =
            selectedVideo &&
            selectedVideos.some((v: any) => v.uri === selectedVideo.uri);

        const startIndex = hasCurrent
            ? selectedVideos.findIndex((v: any) => v.uri === selectedVideo?.uri)
            : 0;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: selectedVideos, startIndex, mode: 'release' },
        });

        if (!hasCurrent) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: selectedVideos[0],
            });
        }

        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: !isIOS() });
    }, [
        // trigger when the actually-selected release changes (not preview)
        selectedDiscogsRelease?.id,
        playbackMode,
        // deliberately NOT depending on previewDiscogsRelease or displayVideos
    ]);

    // --- Keep queue aligned with selected release; ignore preview -------------
    useEffect(() => {
        if (playbackMode === 'playlist') return;
        if (!selectedVideos.length) return; // only when selected has videos

        const curUri = selectedVideo?.uri;
        const currentIsInSelected =
            !!curUri && selectedVideos.some((v: any) => v.uri === curUri);
        if (currentIsInSelected) return;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: selectedVideos, startIndex: 0, mode: 'release' },
        });
    }, [
        selectedDiscogsRelease?.id,
        playbackMode,
        selectedVideo?.uri,
        selectedVideos.length,
    ]);

    // --- Analytics ------------------------------------------------------------
    useEffect(() => {
        const releaseId = selectedRelease?.Release_Id;
        const videoUri = selectedVideo?.uri;
        if (!releaseId || !videoUri) return;
        updateVideoPlayCount(
            releaseId,
            selectedVideo,
            userState?.username,
            bearerToken,
        ).catch(console.error);
    }, [selectedRelease?.Release_Id, selectedVideo?.uri]);

    // --- UI -------------------------------------------------------------------
    return (
        <Box mt="21">
            {Array.isArray(displayVideos) && displayVideos.length === 0 ? (
                <Text c="dimmed" fs="italic">
                    No videos available for this release. Add videos on the
                    Discogs release page!
                </Text>
            ) : (
                <Stack>
                    {displayVideos.map((video: any, idx: number) => {
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
