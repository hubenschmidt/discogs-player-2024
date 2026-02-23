import React, { useEffect, useContext, useRef, useState } from 'react';
import {
    TextInput,
    Tabs,
    Paper,
    ScrollArea,
    Box,
    Tooltip,
    ActionIcon,
    Stack,
    Text,
    Loader,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search as SearchIcon, Sparkles, RotateCcw, Send } from 'lucide-react';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection, streamCuratorMessage } from '../api';
import { SearchContext } from '../context/searchContext';
import { ExplorerContext } from '../context/explorerContext';
import { CuratorContext } from '../context/curatorContext';
import { CollectionContext } from '../context/collectionContext';
import {
    SET_ACTIVE_SESSION,
    APPEND_CURATOR_MESSAGE,
    UPDATE_LAST_MESSAGE,
    SET_STAGED_PLAYLIST,
    SET_CURATOR_LOADING,
    SET_CURATOR_MESSAGES,
} from '../reducers/curatorReducer';
import { SET_CURATOR_ACTIVE, SET_CURATOR_RELEASES } from '../reducers/collectionReducer';
import CuratorMessageBubble from './CuratorMessageBubble';
import StagedPlaylistReview from './StagedPlaylistReview';

const Search = () => {
    const { userState } = useContext(UserContext);
    const { searchState, dispatchSearch } = useContext(SearchContext);
    const { query, results, searchType, open } = searchState;
    const [debouncedQuery] = useDebouncedValue(query, 400);
    const { dispatchExplorer } = useContext(ExplorerContext);
    const { curatorState, dispatchCurator } = useContext(CuratorContext);
    const { collectionState, dispatchCollection } = useContext(CollectionContext);
    const bearerToken = useBearerToken();
    const containerRef = useRef(null);
    const chatScrollRef = useRef(null);
    const aiAbortRef = useRef(null);
    const aiFirstChunkRef = useRef(false);

    const [aiMode, setAiMode] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiOpen, setAiOpen] = useState(false);

    const { messages, activeSessionId, stagedPlaylist, isLoading } = curatorState;

    // Auto-scroll chat to bottom
    useEffect(() => {
        requestAnimationFrame(() => {
            const el = chatScrollRef.current;
            if (!el) return;
            el.scrollTop = el.scrollHeight;
        });
    }, [messages, stagedPlaylist, isLoading]);

    // Open chat panel when there are messages
    useEffect(() => {
        if (aiMode && messages.length) setAiOpen(true);
    }, [messages.length, aiMode]);

    // Restore curator shelf when entering AI mode with stashed releases
    useEffect(() => {
        if (!aiMode || !collectionState.curatorReleases) return;
        dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: true });
    }, [aiMode]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Search mode helpers ─────────────────────────────────────────

    const triggerOpenSearch = () => {
        dispatchSearch({ type: 'SET_RESULTS', payload: [] });
        dispatchSearch({ type: 'SET_OPEN', payload: false });
        dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: null });
        dispatchSearch({ type: 'SET_QUERY', payload: '' });
        dispatchSearch({ type: 'SET_SHELF_COLLECTION_OVERRIDE', payload: true });
        dispatchExplorer({ type: 'CLEAR_FILTER' });
        dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
    };

    // ── AI mode helpers ─────────────────────────────────────────────

    const handleAiSend = () => {
        const text = aiInput.trim();
        if (!text || isLoading) return;

        setAiInput('');
        setAiOpen(true);
        dispatchCurator({ type: APPEND_CURATOR_MESSAGE, payload: { Role: 'user', Content: text } });
        dispatchCurator({ type: SET_CURATOR_LOADING, payload: true });

        aiAbortRef.current?.abort();
        const controller = new AbortController();
        aiAbortRef.current = controller;
        aiFirstChunkRef.current = false;

        streamCuratorMessage(
            userState.username,
            bearerToken,
            activeSessionId,
            text,
            {
                session: ({ sessionId }) => {
                    dispatchCurator({ type: SET_ACTIVE_SESSION, payload: sessionId });
                },
                message: ({ chunk }) => {
                    if (!aiFirstChunkRef.current) {
                        aiFirstChunkRef.current = true;
                        dispatchCurator({ type: APPEND_CURATOR_MESSAGE, payload: { Role: 'assistant', Content: chunk } });
                        return;
                    }
                    dispatchCurator({ type: UPDATE_LAST_MESSAGE, payload: chunk });
                },
                releases: (payload) => {
                    dispatchCollection({ type: SET_CURATOR_RELEASES, payload });
                },
                staged: ({ stagedPlaylist: sp }) => {
                    dispatchCurator({ type: SET_STAGED_PLAYLIST, payload: sp });
                },
                done: () => {
                    dispatchCurator({ type: SET_CURATOR_LOADING, payload: false });
                },
                error: () => {
                    dispatchCurator({ type: APPEND_CURATOR_MESSAGE, payload: { Role: 'assistant', Content: 'Something went wrong. Please try again.' } });
                    dispatchCurator({ type: SET_CURATOR_LOADING, payload: false });
                },
            },
            controller.signal,
        );
    };

    const handleNewSession = () => {
        aiAbortRef.current?.abort();
        dispatchCurator({ type: SET_ACTIVE_SESSION, payload: null });
        dispatchCurator({ type: SET_CURATOR_MESSAGES, payload: [] });
        dispatchCurator({ type: SET_STAGED_PLAYLIST, payload: null });
        dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
        dispatchCollection({ type: SET_CURATOR_RELEASES, payload: null });
        setAiInput('');
    };

    // ── Shared handlers ─────────────────────────────────────────────

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;

        if (aiMode) {
            handleAiSend();
            return;
        }

        if (!query.trim()) triggerOpenSearch();
    };

    // Search debounce effect (only in search mode)
    useEffect(() => {
        if (aiMode) return;

        if (debouncedQuery.trim().length > 0) {
            dispatchSearch({ type: 'SET_OPEN', payload: true });
            searchCollection(
                debouncedQuery,
                searchType === 'all' ? undefined : searchType,
                userState?.username,
                bearerToken,
            )
                .then(collection => dispatchSearch({ type: 'SET_RESULTS', payload: collection }))
                .catch(err => {
                    console.error('Search failed:', err);
                    dispatchSearch({ type: 'SET_RESULTS', payload: [] });
                });
            return;
        }

        dispatchSearch({ type: 'SET_OPEN', payload: false });
        dispatchSearch({ type: 'SET_RESULTS', payload: [] });
    }, [debouncedQuery, searchType, aiMode]);

    // Click outside: close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                dispatchSearch({ type: 'SET_OPEN', payload: false });
                setAiOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Right section ───────────────────────────────────────────────

    const rightSection = aiMode ? (
        <ActionIcon
            variant="transparent"
            color="limegreen"
            onClick={handleAiSend}
            disabled={!aiInput.trim() || isLoading}
            onMouseDown={e => e.preventDefault()}
            styles={{ root: { backgroundColor: 'transparent', '&[data-disabled]': { backgroundColor: 'transparent' } } }}
        >
            <Send size={16} color="limegreen" />
        </ActionIcon>
    ) : (
        <Tooltip label="Show full collection" position="bottom" zIndex="4000">
            <ActionIcon
                className="search-icon"
                variant="subtle"
                aria-label="Refresh collection"
                onClick={triggerOpenSearch}
                onMouseDown={e => e.preventDefault()}
                color="white"
            >
                <RotateCcw size={16} />
            </ActionIcon>
        </Tooltip>
    );

    // ── Dropdown content ────────────────────────────────────────────

    const showSearchDropdown = !aiMode && open;
    const showAiDropdown = aiMode && aiOpen && (messages.length > 0 || isLoading);

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
                            onClick={() => {
                                if (aiMode) dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
                                setAiMode(!aiMode);
                                dispatchSearch({ type: 'SET_OPEN', payload: false });
                                setAiOpen(false);
                            }}
                            style={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 4,
                            }}
                        >
                            {aiMode ? (
                                <Sparkles className="ai-icon" size="1rem" color="limegreen" />
                            ) : (
                                <SearchIcon className="search-icon" size="1rem" color="white" />
                            )}
                        </Box>
                    </Tooltip>
                }
                rightSection={rightSection}
                rightSectionWidth={40}
                value={aiMode ? aiInput : query}
                onChange={e => {
                    if (aiMode) {
                        setAiInput(e.currentTarget.value);
                        return;
                    }
                    dispatchSearch({ type: 'SET_QUERY', payload: e.currentTarget.value });
                }}
                onFocus={() => {
                    if (aiMode && messages.length) {
                        setAiOpen(true);
                        if (collectionState.curatorReleases && !collectionState.curatorActive) {
                            dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: true });
                        }
                        return;
                    }
                    if (!aiMode && query.trim().length > 0) {
                        dispatchSearch({ type: 'SET_OPEN', payload: true });
                    }
                }}
                onKeyDown={handleKeyDown}
                styles={{
                    input: {
                        backgroundColor: 'transparent',
                        color: 'white',
                        borderColor: aiMode ? 'limegreen' : 'white',
                    },
                    section: {
                        backgroundColor: 'transparent',
                    },
                }}
            />

            {/* Search results dropdown */}
            {showSearchDropdown && (
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
                            dispatchSearch({ type: 'SET_SEARCH_TYPE', payload: tab || 'all' })
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
                                          e.currentTarget.style.backgroundColor = '#333';
                                      }}
                                      onMouseLeave={e => {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                      onClick={() => {
                                          dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: item });
                                          dispatchSearch({ type: 'SET_OPEN', payload: false });
                                          dispatchSearch({ type: 'SET_SHELF_COLLECTION_OVERRIDE', payload: false });
                                          dispatchExplorer({ type: 'CLEAR_FILTER' });
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
                                              <span style={{ color: 'gray', marginRight: 4 }}>
                                                  artist
                                              </span>
                                              {item.Name}
                                          </Box>
                                      )}
                                      {item.Label_Id && (
                                          <Box>
                                              <span style={{ color: 'gray', marginRight: 4 }}>
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

            {/* AI chat dropdown */}
            {showAiDropdown && (
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
                    <Box
                        px="xs"
                        py={4}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <Text
                            size="xs"
                            c="dimmed"
                            onClick={handleNewSession}
                            style={{ cursor: 'pointer' }}
                        >
                            + New conversation
                        </Text>
                    </Box>

                    <div
                        ref={chatScrollRef}
                        style={{ maxHeight: '60vh', overflow: 'auto', overscrollBehavior: 'contain' }}
                        onWheel={e => e.stopPropagation()}
                    >
                        <Stack gap="xs" px="xs" py="xs">
                            {messages.map((m, i) => (
                                <CuratorMessageBubble key={i} role={m.Role} content={m.Content} />
                            ))}

                            {isLoading && (
                                <Box style={{ alignSelf: 'flex-start' }}>
                                    <Loader size="xs" color="limegreen" />
                                </Box>
                            )}

                            {stagedPlaylist && (
                                <StagedPlaylistReview
                                    stagedPlaylist={stagedPlaylist}
                                    onRefine={() => {}}
                                />
                            )}
                        </Stack>
                    </div>
                </Paper>
            )}
        </Box>
    );
};

export default Search;
