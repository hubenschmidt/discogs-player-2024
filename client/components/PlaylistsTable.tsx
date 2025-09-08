// components/PlaylistsTable.tsx
import React, { useContext } from 'react';
import { Text } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { UserContext } from '../context/userContext';
import { NavContext } from '../context/navContext';
import { DataTable, type Column } from './DataTable';
import { useBearerToken } from '../hooks/useBearerToken';
import { getPlaylist } from '../api';

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
    const { userState } = useContext(UserContext);
    const { dispatchNav } = useContext(NavContext);
    const bearerToken = useBearerToken();

    const columns: Column<Playlist>[] = [
        {
            header: <Text fw={700}>Name</Text>,
            width: '25%',
            render: p => (
                <Text lineClamp={1} title={p.Name}>
                    {p.Name}
                </Text>
            ),
            sortable: true,
            sortKey: 'Name',
        },
        {
            header: <Text fw={700}>Description</Text>,
            render: p => (
                <Text lineClamp={1} title={p.Description || ''}>
                    {p.Description || '—'}
                </Text>
            ),
            sortable: true,
            sortKey: 'Description',
        },
        {
            header: <Text fw={700}>Updated</Text>,
            width: '19%',
            visibleFrom: 'sm',
            render: p => <Text>{fmtDate(p.updatedAt || p.createdAt)}</Text>,
            sortable: true,
            sortKey: 'updatedAt',
        },
    ];

    const handleRowClick = async (row: Playlist) => {
        dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: true });

        getPlaylist(userState.username, bearerToken, row.Playlist_Id)
            .then(res => {
                dispatchPlaylist({
                    type: 'SET_PLAYLIST_DETAIL',
                    payload: res,
                });

                dispatchNav({ type: 'SET_NAV_KEY', payload: null });
                dispatchNav({ type: 'SET_PLAYLIST_OPEN', payload: true });
            })
            .catch(err => console.log(err));
    };

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
                    type: 'SET_PLAYLISTS_PAGE',
                    payload: { page },
                })
            }
            pageSizeValue={playlistState.pendingLimit ?? 10}
            onPageSizeChange={limit => {
                // usually reset to page 1 when page size changes
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_LIMIT',
                    payload: { limit, page: 1 },
                });
            }}
            pageSizeOptions={[5, 10, 20, 25, 50]}
            sortBy={playlistState.pendingOrderBy ?? 'updatedAt'}
            sortDirection={
                (playlistState.pendingOrder ?? 'DESC') as 'ASC' | 'DESC'
            }
            onSortChange={({ sortBy, direction }) =>
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_SORT',
                    payload: {
                        orderBy: sortBy,
                        order: direction.toUpperCase(),
                        page: 1,
                    }, // reset to 1 on sort change
                })
            }
            onRowClick={handleRowClick}
            tableStyle={{
                tableLayout: 'fixed',
                width: '100%',
                backgroundColor: '#0e0e0f',
                color: 'var(--mantine-color-white)',
                border: 'transparent',
                ['--table-hover-color' as any]: 'rgba(73, 80, 87, 0.6)',
            }}
            cellBorder="4px solid black"
        />
    );
};

export default PlaylistsTable;
