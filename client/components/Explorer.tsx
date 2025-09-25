// components/Explorer.tsx
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
    Divider,
} from '@mantine/core';
import { Search as SearchIcon, X } from 'lucide-react';
import { UserContext } from '../context/userContext';
import { ExplorerContext } from '../context/explorerContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { getExplorer } from '../api';
import { NavContext } from '../context/navContext';

const filterList = (list: string[], q: string) => {
    const n = q.toLowerCase();
    return list.filter(v => v.toLowerCase().includes(n));
};

const Explorer: React.FC = () => {
    const { userState } = useContext(UserContext);
    const { explorerState, dispatchExplorer } = useContext(ExplorerContext);
    const { dispatchNav } = useContext(NavContext);
    const { genresFilter, stylesFilter } = explorerState;
    const bearerToken = useBearerToken();

    const [tab, setTab] = useState<'genres' | 'styles'>('genres');
    const [genreQ, setGenreQ] = useState('');
    const [styleQ, setStyleQ] = useState('');

    const handleClose = () => {
        // 👈 added
        dispatchNav({ type: 'SET_NAV_KEY', payload: null });
    };

    useEffect(() => {
        if (!userState?.username) return;

        const params: any = {
            username: userState.username,
            ...(genresFilter && { genre: genresFilter }),
            ...(stylesFilter && { style: stylesFilter }),
        };

        getExplorer(params, bearerToken)
            .then(res =>
                dispatchExplorer({ type: 'SET_EXPLORER', payload: res }),
            )
            .catch(console.error);
    }, [userState?.username, bearerToken, genresFilter, stylesFilter]);

    const genres = explorerState?.Genres ?? [];
    const styles = explorerState?.Styles ?? [];

    const filteredGenres = filterList(genres, genreQ);
    const filteredStyles = filterList(styles, styleQ);

    // use explicit keys only
    type FilterKey = 'genresFilter' | 'stylesFilter' | 'yearsFilter';

    const toggleFilter = (key: FilterKey, name: string) => {
        const selectedList =
            key === 'genresFilter'
                ? genresFilter
                : key === 'stylesFilter'
                ? stylesFilter
                : explorerState.yearsFilter ?? [];

        const selected = selectedList.includes(name);

        dispatchExplorer({
            type: selected ? 'UNSET_FILTER' : 'SET_FILTER',
            payload: { key, name },
        });
    };

    const clearKind = (key: FilterKey) => {
        dispatchExplorer({ type: 'CLEAR_FILTER', payload: { key } });
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
                                onClick={() => clearKind('genresFilter')}
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
                                onClick={() => clearKind('stylesFilter')}
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
                            rightSection={
                                <ActionIcon
                                    size="xs"
                                    variant="subtle"
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
                </Group>
            </Box>
        );
    };

    const renderChips = (items: string[], key: FilterKey) => {
        const selected = new Set(
            key === 'genresFilter'
                ? genresFilter
                : key === 'stylesFilter'
                ? stylesFilter
                : explorerState.yearsFilter ?? [],
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
            {/* Header with close button — mirrors History */}
            <Group justify="space-between" align="center">
                <Text fw={700} fz="lg" c="white">
                    Explorer
                </Text>
                <ActionIcon
                    variant="light"
                    radius="md"
                    size="lg"
                    aria-label="Close explorer"
                    onClick={handleClose}
                    title="Close explorer"
                >
                    <X size={18} />
                </ActionIcon>
            </Group>
            <Divider my="xs" color="rgba(255,255,255,0.12)" />

            <Paper p="sm" radius="md" style={{ background: '#0e0e0f' }}>
                {renderSelected()}

                <Tabs
                    value={tab}
                    onChange={t =>
                        setTab((t as 'genres' | 'styles') ?? 'genres')
                    }
                    keepMounted={false}
                >
                    <Tabs.List grow>
                        <Tabs.Tab value="genres">
                            Genres ({genres.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="styles">
                            Styles ({styles.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="genres" pt="sm">
                        <Box mt="xs">
                            {renderChips(filteredGenres, 'genresFilter')}
                        </Box>
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
                </Tabs>
            </Paper>
        </Stack>
    );
};

export default Explorer;
