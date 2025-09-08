import React, { useContext, useEffect, useMemo } from 'react';
import { Box, Group, Stack, Text, Divider, Badge, Card } from '@mantine/core';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { DataTable, type Column, type PageData } from './DataTable';
import { getPlaylist } from '../api';
import { useBearerToken } from '../hooks/useBearerToken';

const Playlist = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { dispatchDiscogsRelease } = useContext(DiscogsReleaseContext);
    const bearerToken = useBearerToken();

    const pl = playlistState?.playlistDetail || null;
    const videosPage = (pl?.videos ?? null) as PageData<any> | null;

    // Define columns for the videos table
    const columns: Column<any>[] = [
        {
            header: <Text fw={700}>Thumb</Text>,
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
            header: <Text fw={700}>Updated</Text>,
            render: v => v.updatedAtFormatted,
            visibleFrom: 'sm',
            width: 180,
        },
    ];

    useEffect(() => {
        getPlaylist(
            userState.username,
            bearerToken,
            playlistState.activePlaylistId,
            {
                page: playlistState.playlistVideosPage,
                limit: playlistState.playlistVideosLimit,
            },
        )
            .then(res => {
                console.log(res);
                dispatchPlaylist({
                    type: 'SET_ACTIVE_PLAYLIST_ID',
                    payload: res.playlist.Playlist_Id,
                });
                dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: res });
            })
            .catch(console.error);
    }, [
        bearerToken,
        playlistState.activePlaylistId,
        playlistState.playlistVideosPage,
        playlistState.playlistVideosLimit,
    ]);

    return (
        <Card
            withBorder
            p="md"
            style={{ backgroundColor: 'var(--mantine-color-dark-9)' }}
        >
            <Stack gap="xs">
                <Group justify="space-between" align="center">
                    <Text fw={700} fz="lg" c="white">
                        {pl?.playlist?.Name}
                    </Text>
                    <Badge variant="light">
                        {pl?.playlist.Tracks_Count} track
                        {pl?.videos?.length === 1 ? '' : 's'}
                    </Badge>
                </Group>

                {pl?.Description && <Text size="sm">{pl?.Description}</Text>}

                <Group gap="md" c="dimmed" fz="xs">
                    <Text>Created: {pl?.playlist?.createdAtFormatted}</Text>
                    <Text>Updated: {pl?.playlist?.updatedAtFormatted}</Text>
                </Group>
                <Divider my="xs" />
                <DataTable<any>
                    data={videosPage}
                    columns={columns}
                    emptyText="No tracks yet"
                    onRowClick={row => {
                        // select the video; if you also want to sync a release selection:
                        dispatchDiscogsRelease({
                            type: 'SET_SELECTED_VIDEO',
                            payload: row,
                        });
                        if (row.Release_Id) {
                            // optionally tell your app which release to highlight in the shelf
                            dispatchDiscogsRelease({
                                type: 'SET_SELECTED_RELEASE_ID',
                                payload: row.Release_Id,
                            });
                        }
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
            </Stack>
        </Card>
    );
};

export default Playlist;
