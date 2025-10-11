import React, { useContext, useEffect } from 'react';
import { Box, Group, Stack, Text, Divider, Badge } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { DataTable, type Column, type PageData } from './DataTable';
import { useBearerToken } from '../hooks/useBearerToken';
import {
    updateVideoPlayCount,
    deleteFromPlaylist as apiDeleteFromPlaylist,
} from '../api';
import { ActionIcon } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { SearchContext } from '../context/searchContext';
import { isIOS } from './CustomYoutubePlayer';

const Playlist = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { dispatchSearch } = useContext(SearchContext);
    const bearerToken = useBearerToken();

    const pl = playlistState?.playlistDetail || null;
    const videosPage = (pl?.videos ?? null) as PageData<any> | null;

    // Define columns for the videos table
    const columns: Column<any>[] = [
        {
            header: null,
            width: '6%', // or '15%'
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
            visibleFrom: 'sm',
        },
        {
            header: <Text fw={700}>Title</Text>,
            render: v => (
                <Text lineClamp={1} title={v.Title ?? v.title ?? 'Untitled'}>
                    {v.Title ?? v.title ?? 'Untitled'}
                </Text>
            ),
            width: '54%',
        },
        {
            header: <Text fw={700}>Duration</Text>,
            render: v => v.durationFormatted,
            visibleFrom: 'md',
            width: '15%',
        },
        {
            header: <Text fw={700}>Added</Text>,
            render: v => v.updatedAtFormatted,
            visibleFrom: 'sm',
            width: '15%',
        },
        {
            header: null,
            width: '10%',
            render: (row: any) => (
                <ActionIcon
                    variant="subtle"
                    aria-label="Remove from playlist"
                    title="Remove from playlist"
                    onClick={e => {
                        e.stopPropagation();
                        handleDelete(row);
                    }}
                >
                    <Trash2 size={16} color="white" />
                </ActionIcon>
            ),
        },
    ];

    const handleDelete = async (row: any) => {
        try {
            await apiDeleteFromPlaylist(
                userState.username,
                bearerToken,
                pl?.playlist,
                row.URI,
            );
        } catch (e) {
            console.error('deleteFromPlaylist failed', e);
            return;
        }

        // Optimistic UI update
        const oldItems = videosPage?.items ?? [];
        const newItems = oldItems.filter((v: any) => v?.uri !== row.uri);

        const newDetail = {
            ...pl,
            playlist: {
                ...pl?.playlist,
                Tracks_Count: Math.max(
                    0,
                    (pl?.playlist?.Tracks_Count ?? newItems.length + 1) - 1,
                ),
            },
            videos: { ...pl?.videos, items: newItems },
        };
        dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: newDetail });

        // Playback handling (no "source" logic):
        if (discogsReleaseState.playbackMode !== 'playlist') return;

        const currentUri = discogsReleaseState.selectedVideo?.uri;
        const deletedWasCurrent = currentUri && currentUri === row.uri;

        if (!deletedWasCurrent) {
            // Keep playing the same track (reseed with same index if present)
            const idx = currentUri
                ? newItems.findIndex((v: any) => v?.uri === currentUri)
                : 0;
            const startIndex = idx >= 0 ? idx : 0;

            dispatchDiscogsRelease({
                type: 'SET_PLAYBACK_QUEUE',
                payload: { items: newItems, startIndex, mode: 'playlist' },
            });
            dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: true });
            return;
        }

        // Deleted the currently playing track — pick a neighbor
        const oldIndex = oldItems.findIndex((v: any) => v?.uri === row.uri);
        const next = newItems[oldIndex] ?? newItems[oldIndex - 1] ?? null;

        if (!next) {
            // Playlist became empty
            dispatchDiscogsRelease({
                type: 'SET_PLAYBACK_QUEUE',
                payload: { items: [], startIndex: 0, mode: 'playlist' },
            });
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: null,
            });
            dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: false });
            return;
        }

        const nextIndex = Math.max(
            0,
            newItems.findIndex((v: any) => v?.uri === next.uri),
        );
        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: {
                items: newItems,
                startIndex: nextIndex,
                mode: 'playlist',
            },
        });
        dispatchDiscogsRelease({ type: 'SET_SELECTED_VIDEO', payload: next });
        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: true });
    };

    // ----- helpers (inline-safe) -----
    const pageUrisSig = (videosPage?.items ?? [])
        .map((v: any) => v?.uri)
        .join('|');

    const queueItems = discogsReleaseState.playbackQueue?.items ?? [];
    const queueUrisSig = (queueItems as any[]).map(v => v?.uri).join('|');

    const currentUri = discogsReleaseState.selectedVideo?.uri ?? null;
    const mode = discogsReleaseState.playbackMode;

    // A) Seed/refresh the playback queue ONLY when it actually changed
    useEffect(() => {
        // Only care while in playlist mode and when we have page items
        if (mode !== 'playlist') return;
        const items = videosPage?.items ?? [];
        if (!items.length) return;

        // If URIs/order are identical to what's already in the queue, bail
        if (pageUrisSig === queueUrisSig) return;

        // Pick index so we keep current track if it's still present
        const idx = currentUri
            ? items.findIndex(v => v?.uri === currentUri)
            : -1;
        const startIndex = idx >= 0 ? idx : 0;

        dispatchDiscogsRelease({
            type: 'SET_PLAYBACK_QUEUE',
            payload: { items, startIndex, mode: 'playlist' },
        });
        // IMPORTANT: do NOT toggle SET_IS_PLAYING here
        // deps: only when the page items/order change, or mode/currentUri change
    }, [pageUrisSig, mode, currentUri]);

    // B) Keep selected video/release aligned WITHOUT restarting playback
    useEffect(() => {
        if (mode !== 'playlist') return;
        const items = videosPage?.items ?? [];
        if (!items.length) return;

        // Figure out what should be selected (same as queue startIndex logic)
        const idx = currentUri
            ? items.findIndex(v => v?.uri === currentUri)
            : -1;
        const startIndex = idx >= 0 ? idx : 0;
        const target = items[startIndex];
        if (!target) return;

        // Only dispatch when actually different
        if (
            !discogsReleaseState.selectedVideo ||
            discogsReleaseState.selectedVideo.uri !== target.uri
        ) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: target,
            });
        }
        const targetReleaseId = target.release?.Release_Id;
        if (
            !discogsReleaseState.selectedRelease ||
            discogsReleaseState.selectedRelease.Release_Id !== targetReleaseId
        ) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_RELEASE',
                payload: target.release,
            });
        }
        // deps: page order, currentUri, the currently selected ids, and mode
    }, [
        pageUrisSig,
        currentUri,
        discogsReleaseState.selectedVideo?.uri,
        discogsReleaseState.selectedRelease?.Release_Id,
        mode,
    ]);

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
            <Group justify="center" align="center">
                <Group align="center" gap="sm">
                    <Text fw={700} fz="lg" c="white">
                        {pl?.playlist?.Name}
                    </Text>
                    <Badge variant="light">
                        {pl?.playlist.Tracks_Count} track
                        {pl?.videos?.length === 1 ? '' : 's'}
                    </Badge>
                </Group>
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
                    // Clear any search selection
                    dispatchSearch({
                        type: 'SET_SEARCH_SELECTION',
                        payload: null,
                    });

                    // Build queue + startIndex
                    const queue = videosPage?.items ?? [];
                    const startIndex = Math.max(
                        0,
                        queue.findIndex(v => v?.uri === row?.uri),
                    );

                    // Seed playback queue in playlist mode (also sets selectedVideo and,
                    // if present on the item, selectedRelease)
                    dispatchDiscogsRelease({
                        type: 'SET_PLAYBACK_QUEUE',
                        payload: { items: queue, startIndex, mode: 'playlist' },
                    });

                    // One shot: clear previews and start playing
                    // (Optionally also assert selectedRelease if your queue items don't always include .release)
                    const mergePayload: any = {
                        previewRelease: null,
                        previewDiscogsRelease: null,
                        isPlaying: true,
                        selectedRelease: row.release,
                    };

                    dispatchDiscogsRelease({
                        type: 'MERGE_STATE',
                        payload: mergePayload,
                    });

                    // Ensure the shelf shows the playlist (no collection injection)
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
