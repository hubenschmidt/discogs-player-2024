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

const Playlist = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { dispatchNav } = useContext(NavContext);
    const bearerToken = useBearerToken();

    const pl = playlistState?.playlistDetail || null;
    const videosPage = (pl?.videos ?? null) as PageData<any> | null;

    // Define columns for the videos table
    const columns: Column<any>[] = [
        {
            header: null,
            width: 64, // or '15%'
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
            header: <Text fw={700}>URI</Text>,
            accessor: v => v.URI ?? v.uri ?? '—',
            visibleFrom: 'sm',
            width: '25%',
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
        const first = videosPage?.items?.[0];
        if (!first) return;

        // create a queue from this page's playlist rows
        const queue = videosPage.items;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items: queue, startIndex: 0, mode: 'playlist' },
        });

        // pick the first video so the player can start immediately
        dispatchDiscogsRelease({
            type: 'SET_SELECTED_VIDEO',
            payload: queue[0],
        });
        // keep selectedRelease in sync (and shelf centering you already do)
        dispatchDiscogsRelease({
            type: 'SET_SELECTED_RELEASE',
            payload: first.release,
        });
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
                rowKey={row => row.uri}
                selectedRowKey={discogsReleaseState.selectedVideo?.uri}
                selectedRowClassName="playlist-row-selected"
                onRowClick={row => {
                    const queue = videosPage?.items ?? [];
                    const startIndex = Math.max(
                        0,
                        queue.findIndex(v => v.uri === row.uri),
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
                        payload: row.release,
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
