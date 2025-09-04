import React, { useContext } from 'react';
import { Box, Text, Table, Group, Pagination } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';

const PlaylistsTable = () => {
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const data = playlistState?.playlists;
    const items = data?.items ?? [];
    const page = data?.currentPage ?? 1;
    const totalPages = data?.totalPages ?? 1;

    const fmtDate = (d?: string) =>
        d ? new Date(d).toLocaleDateString() : '—';

    const handlePageChange = (nextPage: number) => {
        // Let your reducer/effect handle fetching the new page.
        // e.g., saga/thunk triggers API call and updates playlistState.playlists
        dispatchPlaylist({
            type: 'PLAYLISTS_PAGE_REQUESTED',
            payload: { page: nextPage },
        });
    };

    return (
        <Box>
            {/* Top summary + pager (optional) */}
            <Group justify="space-between" mb="xs">
                <Text c="dimmed" size="sm">
                    {items.length
                        ? `Showing ${items.length} item(s)`
                        : 'No playlists yet'}
                </Text>
                <Pagination
                    total={totalPages}
                    value={page}
                    onChange={handlePageChange}
                    size="sm"
                    disabled={totalPages <= 1}
                />
            </Group>

            <Table.ScrollContainer mt="xs" minWidth="340">
                <Table
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    style={{ tableLayout: 'fixed', width: '100%' }}
                >
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ width: '25%' }}>Name</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th visibleFrom="sm" style={{ width: '19%' }}>
                                Updated
                            </Table.Th>
                        </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                        {items.map((p: any) => (
                            <Table.Tr
                                key={p.Playlist_Id}
                                style={{ cursor: 'pointer' }}
                            >
                                <Table.Td>
                                    <Text lineClamp={1} title={p.Name}>
                                        {p.Name}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text
                                        lineClamp={1}
                                        title={p.Description || ''}
                                    >
                                        {p.Description || '—'}
                                    </Text>
                                </Table.Td>
                                <Table.Td visibleFrom="sm">
                                    <Text>
                                        {fmtDate(p.updatedAt || p.createdAt)}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}

                        {items.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={3}>
                                    <Text c="dimmed" ta="center">
                                        No playlists yet
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            {/* Bottom pager (optional duplicate for UX) */}
            <Group justify="flex-end" mt="sm">
                <Pagination
                    total={totalPages}
                    value={page}
                    onChange={handlePageChange}
                    size="sm"
                    disabled={totalPages <= 1}
                />
            </Group>
        </Box>
    );
};

export default PlaylistsTable;
