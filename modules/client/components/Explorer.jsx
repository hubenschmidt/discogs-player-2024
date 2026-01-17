import React, { useContext, useEffect, useState } from 'react';
import {
    Paper,
    Stack,
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
import { SearchContext } from '../context/searchContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { getExplorer } from '../api';
import { PlaylistContext } from '../context/playlistContext';
import classes from '../styles/Explorer.module.css';

const filterList = (list, q) => {
    const n = q.toLowerCase();
    return list.filter(v => v.toLowerCase().includes(n));
};

const Explorer = () => {
    const { userState } = useContext(UserContext);
    const { explorerState, dispatchExplorer } = useContext(ExplorerContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlistOpen } = playlistState;
    const { searchState, dispatchSearch } = useContext(SearchContext);
    const { searchSelection } = searchState;
    const bearerToken = useBearerToken();

    const {
        genresFilter = [],
        stylesFilter = [],
        yearsFilter = [],
    } = explorerState;

    const [tab, setTab] = useState('genres');
    const [styleQ, setStyleQ] = useState('');
    const [yearQ, setYearQ] = useState('');

    useEffect(() => {
        if (playlistOpen) {
            dispatchPlaylist({ type: 'SET_PLAYLIST_OPEN', payload: false });
        }

        if (!userState?.username) return;

        const params = {
            username: userState.username,
            ...(genresFilter.length ? { genre: genresFilter } : {}),
            ...(stylesFilter.length ? { style: stylesFilter } : {}),
            ...(yearsFilter.length ? { year: yearsFilter } : {}),
        };

        getExplorer(params, bearerToken)
            .then(res =>
                dispatchExplorer({ type: 'SET_EXPLORER', payload: res }),
            )
            .catch(console.error);
    }, [
        userState?.username,
        bearerToken,
        genresFilter,
        stylesFilter,
        yearsFilter,
        dispatchExplorer,
    ]);

    const genres = explorerState?.Genres ?? [];
    const styles = explorerState?.Styles ?? [];
    const years = (explorerState?.Years ?? []).filter(y => y).map(String);

    const filteredStyles = filterList(styles, styleQ);
    const filteredYears = filterList(years, yearQ);

    const toggleFilter = (key, name) => {
        if (searchSelection) {
            // Reset search + force shelf to show full collection
            dispatchSearch({ type: 'SET_RESULTS', payload: [] });
            dispatchSearch({ type: 'SET_OPEN', payload: false });
            dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null });
            dispatchSearch({ type: 'SET_QUERY', payload: '' });
        }

        const selectedList =
            key === 'genresFilter'
                ? genresFilter
                : key === 'stylesFilter'
                ? stylesFilter
                : yearsFilter;

        const selected = selectedList.includes(name);
        dispatchExplorer({
            type: selected ? 'UNSET_FILTER' : 'SET_FILTER',
            payload: { key, value: name },
        });
    };

    const clearKind = (key) => {
        dispatchExplorer({ type: 'CLEAR_FILTER', payload: { key } });
    };

    const clearAll = () => {
        dispatchExplorer({ type: 'CLEAR_FILTER' }); // no payload -> clear all
    };

    const renderSelected = () => {
        const any =
            genresFilter.length || stylesFilter.length || yearsFilter.length;
        if (!any) return null;

        return (
            <Box mb="sm">
                <Group justify="space-between" align="center">
                    <Text fw={700} c="white">
                        Selected filters
                    </Text>
                    <Group gap="xs">
                        {genresFilter.length && (
                            <Badge
                                variant="outline"
                                radius="sm"
                                color="green"
                                style={{ cursor: 'pointer' }}
                                onClick={() => clearKind('genresFilter')}
                                title="Clear genres"
                            >
                                Clear genres
                            </Badge>
                        )}
                        {stylesFilter.length && (
                            <Badge
                                variant="outline"
                                radius="sm"
                                color="green"
                                style={{ cursor: 'pointer' }}
                                onClick={() => clearKind('stylesFilter')}
                                title="Clear styles"
                            >
                                Clear styles
                            </Badge>
                        )}
                        {yearsFilter.length && (
                            <Badge
                                variant="outline"
                                radius="sm"
                                color="green"
                                style={{ cursor: 'pointer' }}
                                onClick={() => clearKind('yearsFilter')}
                                title="Clear years"
                            >
                                Clear years
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
                            color="green"
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="white"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFilter('genresFilter', g);
                                    }}
                                    aria-label={`Remove ${g}`}
                                    title="Remove"
                                    style={{ marginLeft: 4 }}
                                >
                                    <X size={12} />
                                </ActionIcon>
                            }
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleFilter('genresFilter', g)}
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
                            color="green"
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="white"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFilter('stylesFilter', s);
                                    }}
                                    aria-label={`Remove ${s}`}
                                    title="Remove"
                                    style={{ marginLeft: 4 }}
                                >
                                    <X size={12} />
                                </ActionIcon>
                            }
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleFilter('stylesFilter', s)}
                            title={s}
                        >
                            {s}
                        </Badge>
                    ))}
                    {yearsFilter.map(y => (
                        <Badge
                            key={`Y:${y}`}
                            variant="filled"
                            radius="sm"
                            color="green"
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="white"
                                    onClick={e => {
                                        e.stopPropagation();
                                        toggleFilter('yearsFilter', y);
                                    }}
                                    aria-label={`Remove ${y}`}
                                    title="Remove"
                                    style={{ marginLeft: 4 }}
                                >
                                    <X size={12} />
                                </ActionIcon>
                            }
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleFilter('yearsFilter', y)}
                            title={y}
                        >
                            {y}
                        </Badge>
                    ))}
                </Group>
            </Box>
        );
    };

    const renderChips = (items, key) => {
        const selected = new Set(
            key === 'genresFilter'
                ? genresFilter
                : key === 'stylesFilter'
                ? stylesFilter
                : yearsFilter,
        );

        return (
            <ScrollArea.Autosize mah={380} type="auto">
                <Group gap="xs" p="xs" wrap="wrap">
                    {items.map(name => {
                        const isActive = selected.has(name);
                        return (
                            <Badge
                                key={name}
                                variant={
                                    isActive ? 'filled' : 'light-transparent'
                                }
                                size="lg"
                                radius="sm"
                                color="green"
                                style={{ cursor: 'pointer' }}
                                title={`${isActive ? 'Remove' : 'Add'} ${name}`}
                                onClick={() => toggleFilter(key, name)}
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
        <Stack>
            <Paper p="sm" radius="md" style={{ background: '#0e0e0f' }}>
                {renderSelected()}

                <Tabs
                    value={tab}
                    onChange={t => setTab(t ?? 'genres')}
                    keepMounted={false}
                    color="green"
                    classNames={{ tab: classes.tab, list: classes.list }}
                >
                    <Tabs.List grow>
                        <Tabs.Tab value="genres">
                            Genres ({genres.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="styles">
                            Styles ({styles.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="years">
                            Years ({years.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="genres" pt="sm">
                        <Box mt="xs">{renderChips(genres, 'genresFilter')}</Box>
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
                        <Box mt="xs">
                            {renderChips(filteredStyles, 'stylesFilter')}
                        </Box>
                    </Tabs.Panel>

                    <Tabs.Panel value="years" pt="sm">
                        <TextInput
                            placeholder="Search years"
                            value={yearQ}
                            onChange={e => setYearQ(e.currentTarget.value)}
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
                        <Box mt="xs">
                            {renderChips(filteredYears, 'yearsFilter')}
                        </Box>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Stack>
    );
};

export default Explorer;
