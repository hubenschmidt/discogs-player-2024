import React, { useContext, useEffect, useRef, useState } from 'react';
import {
    Box,
    Stack,
    TextInput,
    ActionIcon,
    Text,
    ScrollArea,
    Loader,
} from '@mantine/core';
import { Send } from 'lucide-react';
import { UserContext } from '../context/userContext';
import { CuratorContext } from '../context/curatorContext';
import { CollectionContext } from '../context/collectionContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { streamCuratorMessage } from '../api';
import {
    SET_ACTIVE_SESSION,
    SET_CURATOR_MESSAGES,
    APPEND_CURATOR_MESSAGE,
    UPDATE_LAST_MESSAGE,
    SET_STAGED_PLAYLIST,
    SET_CURATOR_LOADING,
} from '../reducers/curatorReducer';
import { SET_CURATOR_ACTIVE, SET_CURATOR_RELEASES } from '../reducers/collectionReducer';
import CuratorMessageBubble from './CuratorMessageBubble';
import StagedPlaylistReview from './StagedPlaylistReview';

const CuratorChat = () => {
    const { userState } = useContext(UserContext);
    const { curatorState, dispatchCurator } = useContext(CuratorContext);
    const { dispatchCollection } = useContext(CollectionContext);
    const { messages, activeSessionId, stagedPlaylist, isLoading } =
        curatorState;
    const bearerToken = useBearerToken();
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const abortRef = useRef(null);
    const firstChunkRef = useRef(false);

    // Abort in-flight stream on unmount
    useEffect(() => () => abortRef.current?.abort(), []);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        requestAnimationFrame(() => {
            const viewport = scrollRef.current?.querySelector(
                '.mantine-ScrollArea-viewport',
            );
            if (!viewport) return;
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        });
    }, [messages, stagedPlaylist, isLoading]);

    const handleSend = () => {
        const text = input.trim();
        if (!text || isLoading) return;

        setInput('');
        dispatchCurator({ type: APPEND_CURATOR_MESSAGE, payload: { Role: 'user', Content: text } });
        dispatchCurator({ type: SET_CURATOR_LOADING, payload: true });

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        firstChunkRef.current = false;

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
                    if (!firstChunkRef.current) {
                        firstChunkRef.current = true;
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

    const handleKeyDown = (e) => {
        if (e.key !== 'Enter') return;
        handleSend();
    };

    const handleRefine = () => {
        inputRef.current?.focus();
    };

    const handleNewSession = () => {
        abortRef.current?.abort();
        dispatchCurator({ type: SET_ACTIVE_SESSION, payload: null });
        dispatchCurator({ type: SET_CURATOR_MESSAGES, payload: [] });
        dispatchCurator({ type: SET_STAGED_PLAYLIST, payload: null });
        dispatchCollection({ type: SET_CURATOR_ACTIVE, payload: false });
        dispatchCollection({ type: SET_CURATOR_RELEASES, payload: null });
    };

    return (
        <Stack gap={0} h="100%" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <Box
                p="xs"
                style={{
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <Text size="xs" c="dimmed" onClick={handleNewSession} style={{ cursor: 'pointer' }}>
                    + New conversation
                </Text>
            </Box>

            {/* Messages */}
            <ScrollArea ref={scrollRef} style={{ flex: 1 }} p="xs" styles={{ viewport: { overscrollBehavior: 'contain' } }}>
                <Stack gap="xs">
                    {!messages.length && (
                        <Text size="sm" c="dimmed" ta="center" mt="xl">
                            Describe the vibe, mood, or context for your set and
                            I'll find tracks from your collection.
                        </Text>
                    )}

                    {messages.map((m, i) => (
                        <CuratorMessageBubble
                            key={i}
                            role={m.Role}
                            content={m.Content}
                        />
                    ))}

                    {isLoading && (
                        <Box style={{ alignSelf: 'flex-start' }}>
                            <Loader size="xs" color="yellow" />
                        </Box>
                    )}

                    {stagedPlaylist && (
                        <StagedPlaylistReview
                            stagedPlaylist={stagedPlaylist}
                            onRefine={handleRefine}
                        />
                    )}
                </Stack>
            </ScrollArea>

            {/* Input */}
            <Box
                p="xs"
                style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <TextInput
                    ref={inputRef}
                    placeholder="Describe a vibe, mood, or context..."
                    value={input}
                    onChange={e => setInput(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    rightSection={
                        <ActionIcon
                            variant="subtle"
                            color="yellow"
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                        >
                            <Send size={16} />
                        </ActionIcon>
                    }
                    styles={{
                        input: {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: 'white',
                        },
                    }}
                />
            </Box>
        </Stack>
    );
};

export default CuratorChat;
