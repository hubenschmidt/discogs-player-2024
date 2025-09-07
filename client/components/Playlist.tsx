import React, { useContext, useMemo } from 'react';
import { Box, Group, Stack, Text, Divider, Badge, Card } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { DataTable, type Column, type PageData } from './DataTable';

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');
const fmtDur = (d?: string | number) => {
    if (d == null) return '—';
    const s = typeof d === 'string' ? parseInt(d, 10) : d;
    if (Number.isNaN(s)) return '—';
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, '0')}`;
};

const Playlist = () => {
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { dispatchDiscogsRelease } = useContext(DiscogsReleaseContext);

    const pl = playlistState?.playlistDetail;
    const videosPage = (pl?.videos ?? null) as PageData<any> | null;

    const tracksCount = useMemo(
        () => pl?.Tracks_Count ?? videosPage?.total ?? pl?.Videos?.length ?? 0,
        [pl, videosPage?.total],
    );

    if (!pl) {
        return (
            <Box p="sm">
                <Text c="dimmed">No playlist selected.</Text>
            </Box>
        );
    }

    // Define columns for the videos table
    const columns: Column<any>[] = [
        {
            header: <Text fw={700}>Title</Text>,
            render: v => (
                <Text lineClamp={1} title={v.Title ?? v.title ?? 'Untitled'}>
                    {v.Title ?? v.title ?? 'Untitled'}
                </Text>
            ),
            width: '55%',
        },
        {
            header: <Text fw={700}>URI</Text>,
            accessor: v => v.URI ?? v.uri ?? '—',
            visibleFrom: 'sm',
            width: '25%',
        },
        {
            header: <Text fw={700}>Duration</Text>,
            render: v => fmtDur(v.Duration),
            visibleFrom: 'md',
            width: 100,
        },
        {
            header: <Text fw={700}>Updated</Text>,
            render: v => fmtDate(v.updatedAt ?? v.createdAt),
            visibleFrom: 'sm',
            width: 180,
        },
    ];

    return (
        <Card
            withBorder
            p="md"
            style={{ backgroundColor: 'var(--mantine-color-dark-9)' }}
        >
            <Stack gap="xs">
                <Group justify="space-between" align="center">
                    <Text fw={700} fz="lg">
                        {pl.Name || 'Untitled playlist'}
                    </Text>
                    <Badge variant="light">
                        {tracksCount} track{tracksCount === 1 ? '' : 's'}
                    </Badge>
                </Group>

                {pl.Description && <Text size="sm">{pl.Description}</Text>}

                <Group gap="md" c="dimmed" fz="xs">
                    <Text>Created: {fmtDate(pl.createdAt)}</Text>
                    <Text>Updated: {fmtDate(pl.updatedAt)}</Text>
                </Group>

                <Divider my="xs" />

                <Text fw={600} size="sm">
                    Tracks
                </Text>

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
                            type: 'PLAYLIST_VIDEOS_PAGE_REQUESTED',
                            payload: { page },
                        })
                    }
                    onPageSizeChange={limit =>
                        dispatchPlaylist({
                            type: 'PLAYLIST_VIDEOS_LIMIT_REQUESTED',
                            payload: { limit, page: 1 },
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

                    // Optional: keep current values controlled if you store them in state
                    // pageValue={playlistState.pendingVideosPage}
                    // pageSizeValue={playlistState.pendingVideosLimit}
                />
            </Stack>
        </Card>
    );
};

export default Playlist;
