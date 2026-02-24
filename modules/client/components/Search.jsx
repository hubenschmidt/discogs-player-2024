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
import { Search as SearchIcon, Sparkles, Radar, RotateCcw, Send } from 'lucide-react';
import { useBearerToken } from '../hooks/useBearerToken';
import { UserContext } from '../context/userContext';
import { searchCollection, streamCuratorMessage, semanticSearch as semanticSearchApi } from '../api';
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

    const [mode, setMode] = useState('search');
    const [aiInput, setAiInput] = useState('');
    const [aiOpen, setAiOpen] = useState(false);
    const [semanticResults, setSemanticResults] = useState([]);
    const [semanticOpen, setSemanticOpen] = useState(false);
    const [semanticInput, setSemanticInput] = useState('');
    const [semanticLoading, setSemanticLoading] = useState(false);

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
        if (mode === 'ai' && messages.length) setAiOpen(true);
    }, [messages.length, mode]);

    // Restore curator shelf when entering AI mode with stashed releases
    useEffect(() => {
        if (mode !== 'ai' || !collectionState.curatorReleases) return;
        dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: true });
    }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const handleSemanticSend = () => {
        const text = semanticInput.trim();
        if (!text || semanticLoading) return;

        setSemanticLoading(true);
        setSemanticOpen(true);
        semanticSearchApi(userState.username, text, bearerToken)
            .then(results => setSemanticResults(results))
            .catch(() => setSemanticResults([]))
            .finally(() => setSemanticLoading(false));
    };

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;

        if (mode === 'ai') { handleAiSend(); return; }
        if (mode === 'semantic') { handleSemanticSend(); return; }
        if (!query.trim()) triggerOpenSearch();
    };

    // Search debounce effect (only in search mode)
    useEffect(() => {
        if (mode !== 'search') return;

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
    }, [debouncedQuery, searchType, mode]);

    // Click outside: close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                dispatchSearch({ type: 'SET_OPEN', payload: false });
                setAiOpen(false);
                setSemanticOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Right section ───────────────────────────────────────────────

    const rightSectionMap = {
        search: (
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
        ),
        ai: (
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
        ),
        semantic: (
            <ActionIcon
                variant="transparent"
                onClick={handleSemanticSend}
                disabled={!semanticInput.trim() || semanticLoading}
                onMouseDown={e => e.preventDefault()}
                styles={{ root: { backgroundColor: 'transparent', '&[data-disabled]': { backgroundColor: 'transparent' } } }}
            >
                <Send size={16} color="gold" />
            </ActionIcon>
        ),
    };

    const rightSection = rightSectionMap[mode];

    // ── Dropdown content ────────────────────────────────────────────

    const showSearchDropdown = mode === 'search' && open;
    const showAiDropdown = mode === 'ai' && aiOpen && (messages.length > 0 || isLoading);
    const showSemanticDropdown = mode === 'semantic' && semanticOpen && (semanticResults.length > 0 || semanticLoading);

    return (
        <Box pos="relative" w="100%" ref={containerRef}>
            <TextInput
                placeholder={{ search: 'Search', ai: 'Ask', semantic: 'Semantic search' }[mode]}
                size="lg"
                radius="lg"
                leftSection={
                    <Box
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: 4,
                        }}
                    >
                        <SearchIcon
                            size="1rem"
                            color={mode === 'search' ? 'white' : '#555'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
                                setMode('search');
                                setAiOpen(false);
                                setSemanticOpen(false);
                            }}
                        />
                        <Sparkles
                            size="1rem"
                            color={mode === 'ai' ? 'limegreen' : '#555'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                setMode('ai');
                                dispatchSearch({ type: 'SET_OPEN', payload: false });
                                setSemanticOpen(false);
                            }}
                        />
                        <Radar
                            size="1rem"
                            color={mode === 'semantic' ? 'gold' : '#555'}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
                                setMode('semantic');
                                dispatchSearch({ type: 'SET_OPEN', payload: false });
                                setAiOpen(false);
                            }}
                        />
                    </Box>
                }
                leftSectionWidth={80}
                rightSection={rightSection}
                rightSectionWidth={40}
                value={{ search: query, ai: aiInput, semantic: semanticInput }[mode]}
                onChange={e => {
                    const val = e.currentTarget.value;
                    if (mode === 'ai') { setAiInput(val); return; }
                    if (mode === 'semantic') { setSemanticInput(val); return; }
                    dispatchSearch({ type: 'SET_QUERY', payload: val });
                }}
                onFocus={() => {
                    if (mode === 'ai' && messages.length) {
                        setAiOpen(true);
                        if (collectionState.curatorReleases && !collectionState.curatorActive) {
                            dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: true });
                        }
                        return;
                    }
                    if (mode === 'semantic' && semanticResults.length) {
                        setSemanticOpen(true);
                        return;
                    }
                    if (mode === 'search' && query.trim().length > 0) {
                        dispatchSearch({ type: 'SET_OPEN', payload: true });
                    }
                }}
                onKeyDown={handleKeyDown}
                styles={{
                    input: {
                        backgroundColor: 'transparent',
                        color: 'white',
                        borderColor: { search: 'white', ai: 'limegreen', semantic: 'gold' }[mode],
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

            {/* Semantic search results dropdown */}
            {showSemanticDropdown && (
                <Paper
                    shadow="md"
                    radius="md"
                    mt="xs"
                    withBorder
                    style={{
                        width: '100%',
                        backgroundColor: '#1a1a1a',
                    }}
                >
                    <Box>
                        {semanticLoading && (
                            <Box p="sm" style={{ display: 'flex', justifyContent: 'center' }}>
                                <Loader size="xs" color="gold" />
                            </Box>
                        )}
                        {semanticResults.map((item, idx) => (
                            <Box
                                key={idx}
                                px="sm"
                                py="xs"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#333'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                onClick={() => {
                                    dispatchSearch({ type: 'SET_SEARCH_SELECTION', payload: { Release_Id: item.Release_Id, Title: item.Title, Thumb: item.Thumb } });
                                    dispatchSearch({ type: 'SET_SHELF_COLLECTION_OVERRIDE', payload: false });
                                    dispatchExplorer({ type: 'CLEAR_FILTER' });
                                    setSemanticOpen(false);
                                }}
                            >
                                <Box className="flex items-center gap-2">
                                    <img
                                        src={item.Thumb}
                                        alt={item.Title}
                                        style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                    <span>{item.Title}</span>
                                    <Text size="xs" c="gold" ml="auto" style={{ whiteSpace: 'nowrap' }}>
                                        {(item.similarity * 100).toFixed(0)}%
                                    </Text>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}
        </Box>
    );
};

export default Search;
