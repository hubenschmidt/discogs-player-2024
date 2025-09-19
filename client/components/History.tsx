import React, { useState, useContext, useEffect, useMemo } from 'react';
import { Text } from '@mantine/core';
import { getHistory } from '../api';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { DataTable, type Column, type PageData } from './DataTable';

type HistoryRow = {
    Played_At: string;
    Video?: {
        URI?: string;
        Title?: string;
        Duration?: string;
        UserVideo?: {
            Play_Count: string;
        };
    };
    Release?: {
        Title?: string;
        Artists?: { Name?: string }[];
        Labels?: { Name?: string }[];
        Genres?: { Name?: string }[];
        Styles?: { Name?: string }[];
    };
};

const fmtTime = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

const fmtDur = (s?: string) => {
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return '—';
    const m = Math.floor(n / 60);
    const ss = String(n % 60).padStart(2, '0');
    return `${m}:${ss}`;
};

const History: React.FC = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    // server-driven controls
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [sortBy, setSortBy] = useState<
        | 'playedAt'
        | 'playCount'
        | 'videoTitle'
        | 'duration'
        | 'releaseTitle'
        | 'artistName'
        | 'labelName'
        | 'genreName'
        | 'styleName'
    >('playedAt');

    const [direction, setDirection] = useState<'ASC' | 'DESC'>('DESC');

    const [data, setData] = useState<PageData<HistoryRow> | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        if (!userState?.username) return;

        setLoading(true);
        getHistory(userState.username, bearerToken, {
            page,
            limit,
            orderBy: sortBy, // make sure your backend accepts these names
            order: direction,
        })
            .then(res => {
                if (cancelled) return;
                // Transform API shape -> PageData<T> expected by DataTable
                const pageData: PageData<HistoryRow> = {
                    items: res.items ?? [],
                    currentPage: res.currentPage ?? page,
                    totalPages: res.totalPages ?? 1,
                    total: res.count ?? res.total,
                    pageSize: res.pageSize ?? limit,
                };
                setData(pageData);
            })
            .catch(console.error)
            .finally(() => !cancelled && setLoading(false));

        return () => {
            cancelled = true;
        };
    }, [userState?.username, bearerToken, page, limit, sortBy, direction]);

    const columns: Column<HistoryRow>[] = useMemo(
        () => [
            {
                header: <Text fw={700}>Played</Text>,
                render: r => <Text>{fmtTime(r.Played_At)}</Text>,
                width: 200,
                sortable: true,
                sortKey: 'playedAt',
            },
            {
                header: <Text fw={700}>Count</Text>,
                render: r => (
                    <Text
                        lineClamp={1}
                        title={r.Video?.UserVideo?.Play_Count ?? ''}
                    >
                        {r.Video?.UserVideo?.Play_Count ?? '—'}
                    </Text>
                ),
                width: 120,
                sortable: true,
                sortKey: 'playCount',
            },
            {
                header: <Text fw={700}>Track</Text>,
                render: r => (
                    <Text lineClamp={1} title={r.Video?.Title ?? ''}>
                        {r.Video?.Title ?? '—'}
                    </Text>
                ),
                width: '35%',
                sortable: true,
                sortKey: 'videoTitle',
            },
            {
                header: <Text fw={700}>Duration</Text>,
                render: r => fmtDur(r.Video?.Duration),
                width: 120,
                sortable: true,
                sortKey: 'duration',
            },
            {
                header: <Text fw={700}>Release</Text>,
                render: r => r.Release?.Title ?? '—',
                width: '25%',
                sortable: true,
                sortKey: 'releaseTitle',
            },
            {
                header: <Text fw={700}>Artist</Text>,
                render: r => (
                    <Text
                        lineClamp={1}
                        title={(r.Release?.Artists ?? [])
                            .map(a => a?.Name)
                            .filter(Boolean)
                            .join(', ')}
                    >
                        {(r.Release?.Artists ?? [])
                            .map(a => a?.Name)
                            .filter(Boolean)
                            .join(', ') || '—'}
                    </Text>
                ),
                visibleFrom: 'sm',
                width: '20%',
                sortable: true,
                sortKey: 'artistName',
                tdProps: {
                    style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                },
            },
            {
                header: <Text fw={700}>Label</Text>,
                render: r => (
                    <Text
                        lineClamp={1}
                        title={(r.Release?.Labels ?? [])
                            .map(a => a?.Name)
                            .filter(Boolean)
                            .join(', ')}
                    >
                        {(r.Release?.Labels ?? [])
                            .map(a => a?.Name)
                            .filter(Boolean)
                            .join(', ') || '—'}
                    </Text>
                ),
                visibleFrom: 'sm',
                width: '20%',
                sortable: true,
                sortKey: 'labelName',
                tdProps: {
                    style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                },
            },
            {
                header: <Text fw={700}>Genre</Text>,
                render: r => (
                    <Text
                        lineClamp={1}
                        title={(r.Release?.Genres ?? [])
                            .map(g => g?.Name)
                            .filter(Boolean)
                            .join(', ')}
                    >
                        {(r.Release?.Genres ?? [])
                            .map(g => g?.Name)
                            .filter(Boolean)
                            .join(', ') || '—'}
                    </Text>
                ),
                visibleFrom: 'md',
                width: '18%',
                sortable: true,
                sortKey: 'genreName',
                tdProps: {
                    style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                },
            },
            {
                header: <Text fw={700}>Style</Text>,
                render: r => (
                    <Text
                        lineClamp={1}
                        title={(r.Release?.Styles ?? [])
                            .map(s => s?.Name)
                            .filter(Boolean)
                            .join(', ')}
                    >
                        {(r.Release?.Styles ?? [])
                            .map(s => s?.Name)
                            .filter(Boolean)
                            .join(', ') || '—'}
                    </Text>
                ),
                visibleFrom: 'md',
                width: '18%',
                sortable: true,
                sortKey: 'styleName',
                tdProps: {
                    style: {
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    },
                },
            },
        ],
        [],
    );

    return (
        <DataTable<HistoryRow>
            data={data}
            columns={columns}
            pageValue={data?.currentPage ?? page}
            onPageChange={p => setPage(p)}
            pageSizeValue={data?.pageSize ?? limit}
            pageSizeOptions={[5, 10, 25, 50, 100, 250]}
            onPageSizeChange={sz => {
                setLimit(sz);
                setPage(1); // reset to first page when size changes
            }}
            sortBy={sortBy}
            sortDirection={direction}
            onSortChange={({ sortBy: sb, direction: dir }) => {
                if (loading) return; // guard against double clicks during fetch
                setSortBy(sb as typeof sortBy);
                setDirection(dir);
                setPage(1); // typically reset to page 1 when sort changes
            }}
            emptyText={loading ? 'Loading…' : 'No history yet'}
            tableStyle={{
                tableLayout: 'fixed',
                width: '100%',
                backgroundColor: '#0e0e0f',
                color: 'var(--mantine-color-white)',
                border: 'transparent',
                ['--table-hover-color' as any]: 'rgba(73, 80, 87, 0.6)',
            }}
            cellBorder="4px solid #141414"
        />
    );
};

export default History;
