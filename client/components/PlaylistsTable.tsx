import React, { useContext } from 'react';
import { Text } from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { NavContext } from '../context/navContext';
import { DataTable, type Column } from './DataTable';
import { SearchContext } from '../context/searchContext';

type Playlist = {
    Playlist_Id: number;
    User_Id: number;
    Name: string;
    Description?: string | null;
    createdAt: string;
    updatedAt: string;
    createdAtFormatted: string;
    updatedAtFormatted?: string;
};

const PlaylistsTable = () => {
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { dispatchNav } = useContext(NavContext);
    const { dispatchSearch } = useContext(SearchContext);

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
            render: p => <Text>{p.updatedAtFormatted}</Text>,
            sortable: true,
            sortKey: 'updatedAt',
        },
    ];

    const handleRowClick = async (row: Playlist) => {
        dispatchPlaylist({
            type: 'SET_ACTIVE_PLAYLIST_ID',
            payload: row.Playlist_Id,
        });
        dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: true });
        dispatchNav({ type: 'SET_NAV_KEY', payload: null });
        dispatchNav({ type: 'SET_PLAYLIST_OPEN', payload: true });
        dispatchSearch({
            type: 'SET_SHELF_COLLECTION_OVERRIDE',
            payload: false,
        });
        dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null }); // <-- add this
    };

    return (
        <DataTable<Playlist>
            data={playlistState.playlists}
            columns={columns}
            pageValue={playlistState.playlists?.currentPage ?? 1}
            onPageChange={page =>
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_PAGE',
                    payload: { page },
                })
            }
            pageSizeValue={playlistState.playlists?.pageSize}
            onPageSizeChange={limit => {
                // reset to page 1 when page size changes
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_LIMIT',
                    payload: { limit: limit, page: 1 },
                });
            }}
            pageSizeOptions={[5, 10, 20, 25, 50]}
            sortBy={playlistState.orderBy ?? 'updatedAt'}
            sortDirection={(playlistState.order ?? 'DESC') as 'ASC' | 'DESC'}
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
