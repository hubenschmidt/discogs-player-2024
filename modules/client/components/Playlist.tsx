import React, { useContext, useEffect } from 'react';
import { Box, Group, Stack, Text, Divider, Badge } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { DataTable, type Column, type PageData } from './DataTable';
import { useBearerToken } from '../hooks/useBearerToken';
import { updateVideoPlayCount } from '../api';
import { ActionIcon } from '@mantine/core';
import { X } from 'lucide-react';
import { NavContext } from '../context/navContext';
import { SearchContext } from '../context/searchContext';

const Playlist = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { dispatchNav } = useContext(NavContext);
    const { dispatchSearch } = useContext(SearchContext);
    const bearerToken = useBearerToken();

    const pl = playlistState?.playlistDetail || null;
    const videosPage = (pl?.videos ?? null) as PageData<any> | null;

    // Define columns for the videos table
    const columns: Column<any>[] = [
        {
            header: null,
            width: '5%', // or '15%'
            render: v =>
                v.Thumb ? (
                    <Box
                        component="img"
                        src={v.Thumb}
                        alt={v.Title ?? 'Cover'}
                        width={40}
                        height={40}
                        loading="lazy"
                        style={{
                            borderRadius: 6,
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />
                ) : (
                    <Box
                        w={40}
                        h={40}
                        style={{
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.08)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text size="xs" c="dimmed">
                            —
                        </Text>
                    </Box>
                ),
        },
        {
            header: <Text fw={700}>Title</Text>,
            render: v => (
                <Text lineClamp={1} title={v.Title ?? v.title ?? 'Untitled'}>
                    {v.Title ?? v.title ?? 'Untitled'}
                </Text>
            ),
            width: '45%',
        },
        {
            header: <Text fw={700}>Duration</Text>,
            render: v => v.durationFormatted,
            visibleFrom: 'md',
            width: 100,
        },
        {
            header: <Text fw={700}>Added</Text>,
            render: v => v.updatedAtFormatted,
            visibleFrom: 'sm',
            width: 180,
        },
    ];

    const handleClose = () => {
        dispatchNav({ type: 'SET_PLAYLIST_OPEN', payload: false });
    };

    // Auto-start first entry when videosPage loads (if nothing playing from this page)
    useEffect(() => {
        const items = videosPage?.items ?? [];
        if (!items.length) return;

        const currentUri = discogsReleaseState.selectedVideo?.uri;
        const idx = currentUri
            ? items.findIndex(v => v.uri === currentUri)
            : -1;
        const startIndex = idx >= 0 ? idx : 0;

        // seed/refresh the queue with the correct starting index
        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items, startIndex, mode: 'playlist' },
        });

        // keep selected video/release aligned with the queue
        const target = items[startIndex];

        if (
            !discogsReleaseState.selectedVideo ||
            discogsReleaseState.selectedVideo.uri !== target.uri
        ) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: target,
            });
        }
        if (
            !discogsReleaseState.selectedRelease ||
            discogsReleaseState.selectedRelease.Release_Id !==
                target.release?.Release_Id
        ) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_RELEASE',
                payload: target.release,
            });
        }
        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: true });
    }, [videosPage?.items]);

    // Count plays once per (releaseId|videoUri) while in playlist mode
    useEffect(() => {
        if (discogsReleaseState.playbackMode !== 'playlist') return;

        const releaseId = discogsReleaseState.selectedRelease?.Release_Id;
        const video = discogsReleaseState.selectedVideo;
        const videoUri = video?.uri;

        if (!releaseId || !videoUri) return;

        updateVideoPlayCount(
            releaseId,
            video,
            userState.username,
            bearerToken,
        ).catch(console.error);
    }, [
        discogsReleaseState.playbackMode,
        discogsReleaseState.selectedRelease?.Release_Id,
        discogsReleaseState.selectedVideo?.uri,
        userState.username,
        bearerToken,
    ]);

    return (
        <Stack gap="xs">
            <Group justify="space-between" align="center">
                <Group align="center" gap="sm">
                    <Text fw={700} fz="lg" c="white">
                        {pl?.playlist?.Name}
                    </Text>
                    <Badge variant="light">
                        {pl?.playlist.Tracks_Count} track
                        {pl?.videos?.length === 1 ? '' : 's'}
                    </Badge>
                </Group>

                <ActionIcon
                    variant="light"
                    radius="md"
                    size="lg"
                    aria-label="Close playlist"
                    onClick={handleClose}
                    title="Close playlist"
                >
                    <X size={18} />
                </ActionIcon>
            </Group>

            {pl?.playlist?.Description && (
                <Text c="white">{pl?.playlist?.Description}</Text>
            )}

            <DataTable<any>
                data={videosPage}
                columns={columns}
                emptyText="No tracks yet"
                rowKey={row => row?.uri}
                selectedRowKey={discogsReleaseState.selectedVideo?.uri}
                selectedRowClassName="playlist-row-selected"
                onRowClick={row => {
                    dispatchSearch({
                        type: 'SET_SEARCH_SELECTION',
                        payload: null,
                    });
                    const queue = videosPage?.items ?? [];
                    const startIndex = Math.max(
                        0,
                        queue.findIndex(v => v?.uri === row?.uri),
                    );
                    dispatchDiscogsRelease({
                        type: 'SET_PREVIEW_RELEASE',
                        payload: null,
                    });
                    dispatchDiscogsRelease({
                        type: 'SET_PREVIEW_DISCOGS_RELEASE',
                        payload: null,
                    });
                    dispatchDiscogsRelease({
                        type: 'SET_PLAYBACK_QUEUE',
                        payload: { items: queue, startIndex, mode: 'playlist' },
                    });
                    // select the video; if you also want to sync a release selection:
                    dispatchDiscogsRelease({
                        type: 'SET_SELECTED_VIDEO',
                        payload: queue[startIndex],
                    });
                    dispatchDiscogsRelease({
                        type: 'SET_SELECTED_RELEASE',
                        payload: row?.release,
                    });
                    dispatchDiscogsRelease({
                        type: 'SET_IS_PLAYING',
                        payload: true,
                    });
                    dispatchSearch({
                        type: 'SET_SHELF_COLLECTION_OVERRIDE',
                        payload: false,
                    });
                }}
                onPageChange={page =>
                    dispatchPlaylist({
                        type: 'SET_PLAYLIST_VIDEOS_PAGE',
                        payload: { playlistVideosPage: page },
                    })
                }
                onPageSizeChange={limit =>
                    dispatchPlaylist({
                        type: 'SET_PLAYLIST_VIDEOS_LIMIT',
                        payload: {
                            playlistVideosLimit: limit,
                            playlistVideosPage: 1,
                        },
                    })
                }
                tableStyle={{
                    tableLayout: 'fixed',
                    width: '100%',
                    backgroundColor: '#0e0e0f',
                    color: 'var(--mantine-color-white)', // <- everything white by default
                    ['--table-hover-color' as any]: 'rgba(73, 80, 87, 0.6)',
                }}
                cellBorder="4px solid #141414"
            />

            <Group>
                <Text c="dimmed">
                    Created: {pl?.playlist?.createdAtFormatted}
                </Text>
                <Text c="dimmed">
                    Updated: {pl?.playlist?.updatedAtFormatted}
                </Text>
            </Group>
            <Divider mt="xs" mb="sm" color="rgba(255,255,255,0.12)" />
        </Stack>
    );
};

export default Playlist;
