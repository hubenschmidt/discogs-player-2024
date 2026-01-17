import React, { useEffect, useContext, useRef, useState } from 'react';
import {
    TextInput,
    Tabs,
    Paper,
    ScrollArea,
    Box,
    Tooltip,
    ActionIcon,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon, Sparkles, RotateCcw } from 'lucide-react';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection } from '../api';
import { SearchContext } from '../context/searchContext';
import { ExplorerContext } from '../context/explorerContext';

const Search = () => {
    const { userState } = useContext(UserContext);
    const { searchState, dispatchSearch } = useContext(SearchContext);
    const { query, results, searchType, open } = searchState;
    const [debouncedQuery] = useDebouncedValue(query, 400);
    const { dispatchExplorer } = useContext(ExplorerContext);
    const bearerToken = useBearerToken();
    const containerRef = useRef(null);

    // todo.. implement AI mode
    const [aiMode, setAiMode] = useState(false);

    const triggerOpenSearch = () => {
        // Reset search + force shelf to show full collection
        dispatchSearch({ type: 'SET_RESULTS', payload: [] });
        dispatchSearch({ type: 'SET_OPEN', payload: false });
        dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null });
        dispatchSearch({ type: 'SET_QUERY', payload: '' });
        dispatchSearch({
            type: 'SET_SHELF_COLLECTION_OVERRIDE',
            payload: true,
        });
        dispatchExplorer({ type: 'CLEAR_FILTER' });
    };

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        if (query.trim()) return; // non-empty behaves as usual
        triggerOpenSearch();
    };

    // search when query changes
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

    // clicks outside: close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                dispatchSearch({ type: 'SET_OPEN', payload: false });
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Box pos="relative" w="100%" ref={containerRef}>
            <TextInput
                placeholder={aiMode ? 'Ask' : 'Search'}
                size="lg"
                radius="lg"
                leftSection={
                    <Tooltip
                        label={aiMode ? 'Search mode' : 'AI mode'}
                        position="bottom"
                        zIndex="4000"
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
                                <Sparkles
                                    className="ai-icon"
                                    size="1rem"
                                    color="limegreen"
                                />
                            ) : (
                                <SearchIcon
                                    className="search-icon"
                                    size="1rem"
                                    color="white"
                                />
                            )}
                        </Box>
                    </Tooltip>
                }
                // mobile-friendly "open search" button
                rightSection={
                    <Tooltip
                        label="Show full collection"
                        position="bottom"
                        zIndex="4000"
                    >
                        <ActionIcon
                            className="search-icon"
                            variant="subtle"
                            aria-label="Refresh collection"
                            onClick={triggerOpenSearch}
                            // prevent the input from losing focus on mobile tap
                            onMouseDown={e => e.preventDefault()}
                            color="white"
                        >
                            <RotateCcw size={16} />
                        </ActionIcon>
                    </Tooltip>
                }
                rightSectionWidth={40}
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
                onKeyDown={handleKeyDown}
                styles={{
                    input: {
                        backgroundColor: 'transparent',
                        color: 'white',
                        borderColor: 'white',
                    },
                }}
            />

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
                                          dispatchSearch({
                                              type: 'SET_SHELF_COLLECTION_OVERRIDE',
                                              payload: false,
                                          });
                                          dispatchExplorer({
                                              type: 'CLEAR_FILTER',
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
