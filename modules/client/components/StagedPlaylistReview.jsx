import React, { useContext, useState } from 'react';
import {
    Box,
    Text,
    Stack,
    Group,
    Button,
    ActionIcon,
    Image,
} from '@mantine/core';
import { X } from 'lucide-react';
import { UserContext } from '../context/userContext';
import { CuratorContext } from '../context/curatorContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';
import {
    confirmStagedPlaylist,
    discardStagedPlaylist,
    updateStagedPlaylist,
} from '../api';
import {
    SET_STAGED_PLAYLIST,
    CLEAR_STAGED_PLAYLIST,
} from '../reducers/curatorReducer';
import { SET_PLAYLISTS_VERSION } from '../reducers/playlistReducer';

const StagedPlaylistReview = ({ stagedPlaylist, onRefine }) => {
    const { userState } = useContext(UserContext);
    const { dispatchCurator } = useContext(CuratorContext);
    const { dispatchPlaylist } = useContext(PlaylistContext);
    const bearerToken = useBearerToken();
    const [confirming, setConfirming] = useState(false);
    const [discarding, setDiscarding] = useState(false);

    const videos = stagedPlaylist?.Videos ?? [];

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await confirmStagedPlaylist(
                userState.username,
                bearerToken,
                stagedPlaylist.StagedPlaylist_Id,
            );
            dispatchCurator({ type: CLEAR_STAGED_PLAYLIST });
            dispatchPlaylist({ type: SET_PLAYLISTS_VERSION });
        } finally {
            setConfirming(false);
        }
    };

    const handleDiscard = async () => {
        setDiscarding(true);
        try {
            await discardStagedPlaylist(
                userState.username,
                bearerToken,
                stagedPlaylist.StagedPlaylist_Id,
            );
            dispatchCurator({ type: CLEAR_STAGED_PLAYLIST });
        } finally {
            setDiscarding(false);
        }
    };

    const handleRemoveTrack = async (videoId) => {
        const remaining = videos
            .filter(v => v.Video_Id !== videoId)
            .map(v => v.Video_Id);

        const updated = await updateStagedPlaylist(
            userState.username,
            bearerToken,
            stagedPlaylist.StagedPlaylist_Id,
            remaining,
        );
        dispatchCurator({ type: SET_STAGED_PLAYLIST, payload: updated });
    };

    return (
        <Box
            style={{
                border: '1px solid rgba(255,255,0,0.3)',
                borderRadius: 8,
                padding: 12,
                background: 'rgba(255,255,0,0.05)',
            }}
        >
            <Text fw={700} c="yellow" size="sm">
                {stagedPlaylist.Name}
            </Text>
            {stagedPlaylist.Description && (
                <Text size="xs" c="dimmed" mb="xs">
                    {stagedPlaylist.Description}
                </Text>
            )}

            <Stack gap={6} mt="xs">
                {videos.map((sv, i) => (
                    <Group
                        key={sv.StagedPlaylistVideo_Id}
                        gap="xs"
                        align="flex-start"
                        wrap="nowrap"
                    >
                        <Text size="xs" c="dimmed" w={18} ta="right">
                            {i + 1}.
                        </Text>

                        {sv.Release?.Thumb && (
                            <Image
                                src={sv.Release.Thumb}
                                w={32}
                                h={32}
                                radius={4}
                                alt=""
                            />
                        )}

                        <Box style={{ flex: 1, minWidth: 0 }}>
                            <Text size="xs" c="white" truncate>
                                {sv.Release?.Artists?.map(a => a.Name).join(', ')}
                                {' \u2014 '}
                                {sv.Video?.Title}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                                from &ldquo;{sv.Release?.Title}&rdquo;
                                {sv.Release?.Year ? ` (${sv.Release.Year})` : ''}
                            </Text>
                            {sv.AI_Rationale && (
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    fs="italic"
                                    mt={2}
                                >
                                    {sv.AI_Rationale}
                                </Text>
                            )}
                        </Box>

                        <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="xs"
                            onClick={() => handleRemoveTrack(sv.Video_Id)}
                        >
                            <X size={12} />
                        </ActionIcon>
                    </Group>
                ))}
            </Stack>

            <Group mt="sm" gap="xs">
                <Button
                    size="xs"
                    color="yellow"
                    variant="filled"
                    loading={confirming}
                    onClick={handleConfirm}
                    disabled={!videos.length}
                >
                    Confirm
                </Button>
                <Button
                    size="xs"
                    color="gray"
                    variant="light"
                    loading={discarding}
                    onClick={handleDiscard}
                >
                    Discard
                </Button>
                <Button
                    size="xs"
                    color="yellow"
                    variant="outline"
                    onClick={onRefine}
                >
                    Refine...
                </Button>
            </Group>
        </Box>
    );
};

export default StagedPlaylistReview;
