import React, { useContext } from 'react';
import { Box, Text } from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { CollectionContext } from '../context/collectionContext';

const RELEASE_LINK_RE = /\[([^\]]+)\]\(release:(\d+)\)/g;

const parseContent = (content, onReleaseClick) => {
    if (!content) return null;

    const parts = [];
    let lastIndex = 0;
    let match;

    RELEASE_LINK_RE.lastIndex = 0;
    while ((match = RELEASE_LINK_RE.exec(content)) !== null) {
        // Text before the match
        if (match.index > lastIndex) {
            parts.push(content.slice(lastIndex, match.index));
        }

        const label = match[1];
        const releaseId = Number(match[2]);
        parts.push(
            <span
                key={match.index}
                onClick={() => onReleaseClick(releaseId)}
                style={{
                    color: 'limegreen',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textDecorationColor: 'rgba(50,205,50,0.4)',
                }}
            >
                {label}
            </span>,
        );

        lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < content.length) {
        parts.push(content.slice(lastIndex));
    }

    return parts.length ? parts : content;
};

const CuratorMessageBubble = ({ role, content }) => {
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(DiscogsReleaseContext);
    const { collectionState } = useContext(CollectionContext);
    const isUser = role === 'user';

    const handleReleaseClick = (releaseId) => {
        // Find the release in the curator shelf items
        const items = collectionState.items ?? [];
        const release = items.find(r => r.Release_Id === releaseId);
        if (!release) return;

        const action = discogsReleaseState.selectedRelease ? 'SET_PREVIEW_RELEASE' : 'SET_SELECTED_RELEASE';
        dispatchDiscogsRelease({ type: action, payload: release });
    };

    return (
        <Box
            style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '8px 12px',
                borderRadius: 12,
                background: isUser
                    ? 'rgba(255,255,0,0.15)'
                    : 'rgba(255,255,255,0.08)',
                borderBottomRightRadius: isUser ? 2 : 12,
                borderBottomLeftRadius: isUser ? 12 : 2,
            }}
        >
            <Text
                size="sm"
                c={isUser ? 'yellow' : 'white'}
                style={{ whiteSpace: 'pre-wrap' }}
            >
                {isUser ? content : parseContent(content, handleReleaseClick)}
            </Text>
        </Box>
    );
};

export default CuratorMessageBubble;
