import React, { useContext } from 'react';
import { Text, ActionIcon } from '@mantine/core';
import { Trash2 } from 'lucide-react';
import { PlaylistContext } from '../context/playlistContext';
import { NavContext } from '../context/navContext';
import { DataTable } from './DataTable';
import { SearchContext } from '../context/searchContext';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { deletePlaylist as apiDeletePlaylist, getPlaylists } from '../api';

const PlaylistsTable = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { dispatchNav } = useContext(NavContext);
    const { dispatchSearch } = useContext(SearchContext);

    const handleDelete = async (row) => {
        const playlistId = row?.Playlist_Id;

        // optimistic update
        const current = playlistState.playlists;
        const oldItems = current?.items ?? [];
        const newItems = oldItems.filter(
            (p) => p?.Playlist_Id !== playlistId,
        );
        const optimistic = {
            ...current,
            items: newItems,
            count: Math.max(0, (current?.count ?? oldItems.length) - 1),
        };
        dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: optimistic });

        // if the deleted playlist is active, clear it
        if (playlistState.activePlaylistId === playlistId) {
            dispatchPlaylist({ type: 'SET_ACTIVE_PLAYLIST_ID', payload: null });
            dispatchPlaylist({ type: 'SET_PLAYLIST_DETAIL', payload: null });
            dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: false });
            dispatchNav({ type: 'SET_PLAYLIST_OPEN', payload: false });
        }

        try {
            await apiDeletePlaylist(
                userState.username,
                bearerToken,
                playlistId,
            );
            dispatchPlaylist({ type: 'SET_PLAYLISTS_VERSION' }); // trigger refetch
        } catch (e) {
            // revert by refetching current page
            const page = playlistState.page ?? 1;
            const limit = playlistState.limit ?? 10;
            const orderBy = playlistState.orderBy ?? 'updatedAt';
            const order = playlistState.order ?? 'DESC';
            getPlaylists(userState.username, bearerToken, {
                page,
                limit,
                orderBy,
                order,
            })
                .then(res =>
                    dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res }),
                )
                .catch(console.error);
        }
    };

    const columns = [
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
        {
            header: null,
            width: 44,
            render: (row) => (
                <ActionIcon
                    variant="subtle"
                    aria-label="Delete playlist"
                    title="Delete playlist"
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

    const handleRowClick = async (row) => {
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
        dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null });
    };

    return (
        <DataTable
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
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_LIMIT',
                    payload: { limit: limit, page: 1 },
                });
            }}
            pageSizeOptions={[5, 10, 20, 25, 50]}
            sortBy={playlistState.orderBy ?? 'updatedAt'}
            sortDirection={playlistState.order ?? 'DESC'}
            onSortChange={({ sortBy, direction }) =>
                dispatchPlaylist({
                    type: 'SET_PLAYLISTS_SORT',
                    payload: {
                        orderBy: sortBy,
                        order: direction.toUpperCase(),
                        page: 1,
                    },
                })
            }
            onRowClick={handleRowClick}
            tableStyle={{
                tableLayout: 'fixed',
                width: '100%',
                backgroundColor: '#0e0e0f',
                color: 'var(--mantine-color-white)',
                '--table-hover-color': 'rgba(73, 80, 87, 0.6)',
            }}
            cellBorder="4px solid #141414"
        />
    );
};

export default PlaylistsTable;
