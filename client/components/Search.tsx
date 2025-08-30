import React, { useEffect, useContext, useRef, useState } from 'react';
import {
    TextInput,
    Tabs,
    Paper,
    ScrollArea,
    Box,
    Tooltip,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon, Sparkles } from 'lucide-react';
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
    // Ref for the container of the search input + dropdown
    const containerRef = useRef<HTMLDivElement>(null);

    // todo.. implemnt AI mode
    const [aiMode, setAiMode] = useState(false);

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

    // Effect: handle clicks outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                dispatchSearch({ type: 'SET_OPEN', payload: false });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <Box pos="relative" w="100%" ref={containerRef}>
            {/* Search input */}
            <TextInput
                placeholder={aiMode ? 'Ask' : 'Search'}
                size="lg"
                radius="lg"
                leftSection={
                    <Tooltip
                        label={aiMode ? 'Search mode' : 'AI mode'}
                        position="left"
                    >
                        <Box
                            onClick={() => setAiMode(!aiMode)}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 4,
                            }}
                        >
                            {aiMode ? (
                                <Sparkles size="1rem" color="limegreen" />
                            ) : (
                                <SearchIcon size="1rem" />
                            )}
                        </Box>
                    </Tooltip>
                }
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
