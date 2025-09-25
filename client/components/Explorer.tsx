// components/Explorer.tsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Paper,
    Tabs,
    TextInput,
    ScrollArea,
    Group,
    Badge,
    Box,
    Text,
    ActionIcon,
} from '@mantine/core';
import { Search as SearchIcon, X } from 'lucide-react';
import { UserContext } from '../context/userContext';
import { ExplorerContext } from '../context/explorerContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { getExplorer } from '../api';

const normalize = (s = '') =>
    s
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

const filterList = (list: string[], q: string) => {
    const n = normalize(q);
    if (!n) return list;
    return list.filter(v => normalize(v).includes(n));
};

const Explorer: React.FC = () => {
    const { userState } = useContext(UserContext);
    const { explorerState, dispatchExplorer } = useContext(ExplorerContext);
    const bearerToken = useBearerToken();

    const [tab, setTab] = useState<'genres' | 'styles'>('genres');
    const [genreQ, setGenreQ] = useState('');
    const [styleQ, setStyleQ] = useState('');

    // load once per user
    useEffect(() => {
        if (!userState?.username) return;
        getExplorer(userState.username, bearerToken)
            .then(res =>
                dispatchExplorer({ type: 'SET_EXPLORER', payload: res }),
            )
            .catch(console.error);
    }, [userState?.username, bearerToken, dispatchExplorer]);

    const genres = explorerState?.Genres ?? [];
    const styles = explorerState?.Styles ?? [];
    const genresFilter: string[] = explorerState?.genresFilter ?? [];
    const stylesFilter: string[] = explorerState?.stylesFilter ?? [];

    const filteredGenres = useMemo(
        () => filterList(genres, genreQ),
        [genres, genreQ],
    );
    const filteredStyles = useMemo(
        () => filterList(styles, styleQ),
        [styles, styleQ],
    );

    const toggleFilter = (kind: 'genres' | 'styles', name: string) => {
        const selected = (
            kind === 'genres' ? genresFilter : stylesFilter
        ).includes(name);
        dispatchExplorer({
            type: selected ? `UNSET_FILTER` : `SET_FILTER`,
            payload: { kind, name },
        });
    };

    const clearKind = (kind: 'genres' | 'styles') => {
        dispatchExplorer({ type: `CLEAR_FILTER`, payload: { kind } });
    };

    const clearAll = () => {
        dispatchExplorer({ type: `CLEAR_FILTER` }); // no payload -> clear both
    };

    const renderSelected = () => {
        const any = genresFilter.length || stylesFilter.length;
        if (!any) return null;

        return (
            <Box mb="sm">
                <Group justify="space-between" align="center">
                    <Text fw={700} c="white">
                        Selected filters
                    </Text>
                    <Group gap="xs">
                        {!!genresFilter.length && (
                            <Badge
                                variant="outline"
                                radius="sm"
                                style={{ cursor: 'pointer' }}
                                onClick={() => clearKind('genres')}
                                title="Clear genres"
                            >
                                Clear genres
                            </Badge>
                        )}
                        {!!stylesFilter.length && (
                            <Badge
                                variant="outline"
                                radius="sm"
                                style={{ cursor: 'pointer' }}
                                onClick={() => clearKind('styles')}
                                title="Clear styles"
                            >
                                Clear styles
                            </Badge>
                        )}
                        <Badge
                            variant="light"
                            radius="sm"
                            style={{ cursor: 'pointer' }}
                            onClick={clearAll}
                            title="Clear all"
                        >
                            Clear all
                        </Badge>
                    </Group>
                </Group>

                <Group gap="xs" mt={8} wrap="wrap">
                    {genresFilter.map(g => (
                        <Badge
                            key={`G:${g}`}
                            variant="filled"
                            radius="sm"
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFilter('genres', g);
                                    }}
                                    aria-label={`Remove ${g}`}
                                    title="Remove"
                                    style={{ marginLeft: 4 }}
                                >
                                    <X size={12} />
                                </ActionIcon>
                            }
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleFilter('genres', g)}
                            title={g}
                        >
                            {g}
                        </Badge>
                    ))}
                    {stylesFilter.map(s => (
                        <Badge
                            key={`S:${s}`}
                            variant="filled"
                            radius="sm"
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFilter('styles', s);
                                    }}
                                    aria-label={`Remove ${s}`}
                                    title="Remove"
                                    style={{ marginLeft: 4 }}
                                >
                                    <X size={12} />
                                </ActionIcon>
                            }
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleFilter('styles', s)}
                            title={s}
                        >
                            {s}
                        </Badge>
                    ))}
                </Group>
            </Box>
        );
    };

    const renderChips = (items: string[], kind: 'genres' | 'styles') => {
        const selected = new Set(
            kind === 'genres' ? genresFilter : stylesFilter,
        );

        return (
            <ScrollArea.Autosize mah={380} type="auto">
                <Group gap="xs" p="xs" wrap="wrap">
                    {items.map(name => {
                        const isActive = selected.has(name);
                        return (
                            <Badge
                                key={name}
                                variant={isActive ? 'filled' : 'light'}
                                size="lg"
                                radius="sm"
                                style={{ cursor: 'pointer' }}
                                title={`${isActive ? 'Remove' : 'Add'} ${name}`}
                                onClick={() => toggleFilter(kind, name)}
                            >
                                {name}
                            </Badge>
                        );
                    })}
                    {!items.length && (
                        <Box p="md">
                            <Text c="dimmed">No matches</Text>
                        </Box>
                    )}
                </Group>
            </ScrollArea.Autosize>
        );
    };

    return (
        <Paper p="sm" radius="md" style={{ background: '#0e0e0f' }}>
            {renderSelected()}

            <Tabs
                value={tab}
                onChange={t => setTab((t as 'genres' | 'styles') ?? 'genres')}
                keepMounted={false}
            >
                <Tabs.List grow>
                    <Tabs.Tab value="genres">Genres ({genres.length})</Tabs.Tab>
                    <Tabs.Tab value="styles">Styles ({styles.length})</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="genres" pt="sm">
                    <TextInput
                        placeholder="Search genres"
                        value={genreQ}
                        onChange={e => setGenreQ(e.currentTarget.value)}
                        leftSection={<SearchIcon size={16} />}
                        radius="md"
                        size="md"
                        styles={{
                            input: {
                                backgroundColor: 'transparent',
                                color: 'white',
                                borderColor: 'white',
                            },
                        }}
                    />
                    <Box mt="xs">{renderChips(filteredGenres, 'genres')}</Box>
                </Tabs.Panel>

                <Tabs.Panel value="styles" pt="sm">
                    <TextInput
                        placeholder="Search styles"
                        value={styleQ}
                        onChange={e => setStyleQ(e.currentTarget.value)}
                        leftSection={<SearchIcon size={16} />}
                        radius="md"
                        size="md"
                        styles={{
                            input: {
                                backgroundColor: 'transparent',
                                color: 'white',
                                borderColor: 'white',
                            },
                        }}
                    />
                    <Box mt="xs">{renderChips(filteredStyles, 'styles')}</Box>
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
};

export default Explorer;
