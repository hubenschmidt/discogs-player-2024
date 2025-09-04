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
            data={data}
            columns={columns}
            onPageChange={page =>
                dispatchPlaylist({
                    type: 'PLAYLISTS_PAGE_REQUESTED',
                    payload: { page },
                })
            }
            rowKey={p => p.Playlist_Id}
            emptyText="No playlists yet"
            // Optional look-and-feel overrides:
            withTableBorder
            withColumnBorders
            scrollMinWidth={340}
            tableStyle={{ tableLayout: 'fixed', width: '100%' }}
            // Optional row click:
            // onRowClick={(row) => console.log('open modal', row)}
        />
    );
};

export default PlaylistsTable;
