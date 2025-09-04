// components/PlaylistsTable.tsx
import React, { useContext } from 'react';
import { Text } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { DataTable, type Column } from './DataTable';

type Playlist = {
    Playlist_Id: number;
    User_Id: number;
    Name: string;
    Description?: string | null;
    createdAt?: string;
    updatedAt?: string;
};

const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '—');

const PlaylistsTable = () => {
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const data = playlistState?.playlists;

    const columns: Column<Playlist>[] = [
        {
            header: <Text fw={700}>Name</Text>,
            width: '25%',
            render: p => (
                <Text lineClamp={1} title={p.Name}>
                    {p.Name}
                </Text>
            ),
        },
        {
            header: <Text fw={700}>Description</Text>,
            render: p => (
                <Text lineClamp={1} title={p.Description || ''}>
                    {p.Description || '—'}
                </Text>
            ),
        },
        {
            header: <Text fw={700}>Updated</Text>,
            width: '19%',
            visibleFrom: 'sm',
            render: p => <Text>{fmtDate(p.updatedAt || p.createdAt)}</Text>,
        },
    ];

    return (
        <DataTable<Playlist>
            data={playlistState.playlists}
            columns={columns}
            pageValue={
                playlistState.pendingPage ??
                playlistState.playlists?.currentPage ??
                1
            }
            onPageChange={page =>
                dispatchPlaylist({
                    type: 'PLAYLISTS_PAGE_REQUESTED',
                    payload: { page },
                })
            }
            pageSizeValue={
                playlistState.pendingLimit ??
                playlistState.playlists?.pageSize ??
                10
            }
            onPageSizeChange={limit => {
                // usually reset to page 1 when page size changes
                dispatchPlaylist({
                    type: 'PLAYLISTS_PAGE_SIZE_REQUESTED',
                    payload: { limit, page: 1 },
                });
            }}
            pageSizeOptions={[5, 10, 20, 25, 50]}
        />
    );
};

export default PlaylistsTable;
