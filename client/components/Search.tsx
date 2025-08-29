import React, { useEffect, useContext } from 'react';
import { TextInput, Tabs, Paper, ScrollArea, Box } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon } from 'lucide-react';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection } from '../api';
import { SearchContext } from '../context/searchContext';

const Search = () => {
    const { userState } = useContext(UserContext);
    const { searchState, dispatchSearch } = useContext(SearchContext);
    const { query, results, searchType, open } = searchState;
    const [debouncedQuery] = useDebouncedValue(query, 400);

    const bearerToken = useBearerToken();

    // Effect: search when query changes
    useEffect(() => {
        if (debouncedQuery.trim().length > 0) {
            dispatchSearch({ type: 'SET_OPEN', payload: true });

            searchCollection(
                debouncedQuery,
                searchType === 'all' ? undefined : searchType,
                userState?.username,
                bearerToken,
            )
                .then(collection => {
                    dispatchSearch({
                        type: 'SET_RESULTS',
                        payload: collection,
                    });
                })
                .catch(err => {
                    console.error('Search failed:', err);
                    dispatchSearch({ type: 'SET_RESULTS', payload: [] });
                });

            return;
        }

        dispatchSearch({ type: 'SET_OPEN', payload: false });
        dispatchSearch({ type: 'SET_RESULTS', payload: [] });
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
                onChange={e =>
                    dispatchSearch({
                        type: 'SET_QUERY',
                        payload: e.currentTarget.value,
                    })
                }
                onFocus={() => {
                    if (query.trim().length > 0) {
                        dispatchSearch({ type: 'SET_OPEN', payload: true });
                    }
                }}
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
                        onChange={tab =>
                            dispatchSearch({
                                type: 'SET_SEARCH_TYPE',
                                payload: tab || 'all',
                            })
                        }
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
                            ? results.map((item, idx) => (
                                  <Box
                                      key={idx}
                                      px="sm"
                                      py="xs"
                                      style={{
                                          cursor: 'pointer',
                                          transition: 'background-color 0.2s',
                                      }}
                                      onMouseEnter={e => {
                                          e.currentTarget.style.backgroundColor =
                                              '#333';
                                      }}
                                      onMouseLeave={e => {
                                          e.currentTarget.style.backgroundColor =
                                              'transparent';
                                      }}
                                      onClick={() => {
                                          dispatchSearch({
                                              type: 'SET_SEARCH_SELECTION',
                                              payload: item,
                                          });
                                          dispatchSearch({
                                              type: 'SET_OPEN',
                                              payload: false,
                                          });
                                      }}
                                  >
                                      {item.Release_Id && (
                                          <Box className="flex items-center gap-2">
                                              <img
                                                  src={item.Thumb}
                                                  alt={item.Title}
                                                  style={{
                                                      width: 40,
                                                      height: 40,
                                                      objectFit: 'cover',
                                                      borderRadius: 4,
                                                  }}
                                              />
                                              <span>{item.Title}</span>
                                          </Box>
                                      )}

                                      {item.Artist_Id && (
                                          <Box>
                                              <span
                                                  style={{
                                                      color: 'gray',
                                                      marginRight: 4,
                                                  }}
                                              >
                                                  artist
                                              </span>
                                              {item.Name}
                                          </Box>
                                      )}

                                      {item.Label_Id && (
                                          <Box>
                                              <span
                                                  style={{
                                                      color: 'gray',
                                                      marginRight: 4,
                                                  }}
                                              >
                                                  {item.Cat_No ?? 'label'}
                                              </span>
                                              {item.Name}
                                          </Box>
                                      )}
                                  </Box>
                              ))
                            : null}
                    </ScrollArea.Autosize>
                </Paper>
            )}
        </Box>
    );
};

export default Search;
