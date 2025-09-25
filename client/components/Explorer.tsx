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
} from '@mantine/core';
import { Search as SearchIcon } from 'lucide-react';
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

    const filteredGenres = useMemo(
        () => filterList(genres, genreQ),
        [genres, genreQ],
    );
    const filteredStyles = useMemo(
        () => filterList(styles, styleQ),
        [styles, styleQ],
    );

    const renderChips = (items: string[], kind: 'genre' | 'style') => (
        <ScrollArea.Autosize mah={380} type="auto">
            <Group gap="xs" p="xs" wrap="wrap">
                {items.map(name => (
                    <Badge
                        key={name}
                        variant="light"
                        size="lg"
                        radius="sm"
                        style={{ cursor: 'pointer' }}
                        title={`Select ${name}`}
                        onClick={() => {
                            // TODO: wire this to your filtering action
                            // e.g. dispatchExplorer({ type: 'SET_FILTER', payload: { kind, name } })
                            // or open a shelf filtered by this tag
                            console.log('pick', kind, name);
                        }}
                    >
                        {name}
                    </Badge>
                ))}
                {!items.length && (
                    <Box p="md">
                        <Text c="dimmed">No matches</Text>
                    </Box>
                )}
            </Group>
        </ScrollArea.Autosize>
    );

    return (
        <Paper p="sm" radius="md" style={{ background: '#0e0e0f' }}>
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
                    <Box mt="xs">{renderChips(filteredGenres, 'genre')}</Box>
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
                    <Box mt="xs">{renderChips(filteredStyles, 'style')}</Box>
                </Tabs.Panel>
            </Tabs>
        </Paper>
    );
};

export default Explorer;
