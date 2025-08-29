import React, { useState, useEffect, useContext } from 'react';
import { TextInput, Tabs, Paper, ScrollArea, Box } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon } from 'lucide-react';
import { CollectionContext } from '../context/collectionContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection } from '../api';
import { CollectionResponse } from '../interfaces';

const Search = () => {
    const { userState } = useContext(UserContext);
    const { dispatchCollection } = useContext(CollectionContext);
    const bearerToken = useBearerToken();

    // Local state
    const [query, setQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(query, 400);
    const [results, setResults] = useState([]);
    const [searchType, setSearchType] = useState<string>('all');
    const [open, setOpen] = useState(false);

    // Effect: search when query changes
    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            setOpen(true);

            searchCollection(
                debouncedQuery,
                searchType === 'all' ? undefined : searchType, // pass `type` param only if narrowed
                userState?.username,
                bearerToken,
            )
                .then(collection => {
                    console.log(
                        collection,
                        'results',
                        searchType,
                        'searchType',
                    );
                    setResults(collection);
                    dispatchCollection({
                        type: 'SET_SEARCH_RESULTS',
                        payload: collection,
                    });
                })
                .catch(err => {
                    console.error('Search failed:', err);
                    setResults([]);
                    dispatchCollection({
                        type: 'SET_SEARCH_RESULTS',
                        payload: [],
                    });
                });
            return;
        }

        // Clear results if no input
        setOpen(false);
        setResults([]);
        dispatchCollection({ type: 'SET_SEARCH_RESULTS', payload: [] });
    }, [debouncedQuery, searchType]);

    return (
        <Box pos="relative" w="100%">
            {/* Search input */}
            <TextInput
                placeholder="search..."
                size="lg"
                radius="lg"
                leftSection={<SearchIcon size="1rem" />}
                value={query}
                onChange={e => setQuery(e.currentTarget.value)}
                styles={{
                    input: {
                        backgroundColor: 'transparent',
                        color: 'white',
                        borderColor: 'white',
                    },
                }}
            />

            {/* Dropdown results */}
            {open && (
                <Paper
                    shadow="md"
                    radius="md"
                    mt="xs"
                    withBorder
                    style={{
                        position: 'absolute',
                        width: '100%',
                        zIndex: 1000,
                        backgroundColor: '#1a1a1a',
                    }}
                >
                    {/* Tabs */}
                    <Tabs
                        value={searchType}
                        onChange={tab => setSearchType(tab || 'all')}
                    >
                        <Tabs.List grow>
                            <Tabs.Tab value="all">All</Tabs.Tab>
                            <Tabs.Tab value="release">Releases</Tabs.Tab>
                            <Tabs.Tab value="artist">Artists</Tabs.Tab>
                            <Tabs.Tab value="label">Labels</Tabs.Tab>
                        </Tabs.List>
                    </Tabs>

                    {/* Results list */}
                    <ScrollArea.Autosize mah={300}>
                        {results.length > 0
                            ? results?.map(
                                  (item, idx) => (
                                      console.log(item, 'item'),
                                      (
                                          <Box key={idx} px="sm" py="xs">
                                              {item?.Title || item?.Name}
                                          </Box>
                                      )
                                  ),
                              )
                            : null}
                    </ScrollArea.Autosize>
                </Paper>
            )}
        </Box>
    );
};

export default Search;
