import React, { useContext, useState } from 'react';
import { Modal, Stack, Text, Button, Group, ScrollArea } from '@mantine/core';
import { Music2 } from 'lucide-react';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { UserContext } from '../context/userContext';
import { addToPlaylist } from '../api';
import { useBearerToken } from '../hooks/useBearerToken';

const AddToPlaylistModal = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { addModalOpen, playlists } = playlistState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;
    const bearerToken = useBearerToken();
    const [loadingId, setLoadingId] = useState<number | null>(null);

    const handleClose = () =>
        dispatchPlaylist({ type: 'SET_ADD_MODAL', payload: false });

    const onPick = (pl: any) => {
        if (!selectedVideo) return;

        // optional: keep track of last-picked in context
        dispatchPlaylist({ type: 'SET_SELECTED_PLAYLIST', payload: pl });

        setLoadingId(pl.Playlist_Id);

        addToPlaylist(userState.username, bearerToken, pl, selectedVideo)
            .then(res => {
                // clear selection, close modal, refresh listing if you want newest first
                dispatchPlaylist({
                    type: 'SET_SELECTED_PLAYLIST',
                    payload: null,
                });
                // handleClose();
                console.log(res);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoadingId(null));
    };

    return (
        <Modal
            opened={!!addModalOpen}
            onClose={handleClose}
            title="Add to playlist:"
            centered
            size="lg"
            styles={{
                content: { backgroundColor: 'var(--mantine-color-dark-7)' },
                header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                body: {
                    backgroundColor: 'var(--mantine-color-dark-7)',
                    color: 'white',
                },
                title: { color: 'white' },
                close: { color: 'white' },
            }}
        >
            <Stack gap="sm">
                {selectedVideo && (
                    <Text size="sm" c="dimmed">
                        Track: {selectedVideo.title}
                    </Text>
                )}

                <ScrollArea.Autosize mah={320} type="auto">
                    <Stack gap={6}>
                        {playlists?.items?.map((p: any) => (
                            <Button
                                key={p.Playlist_Id}
                                variant="light"
                                onClick={() => onPick(p)}
                                loading={loadingId === p.Playlist_Id}
                                rightSection={
                                    <Group gap={6}>
                                        <Music2 size={14} />
                                        <Text size="xs">
                                            {p.tracksCount ?? '—'}
                                        </Text>
                                    </Group>
                                }
                                styles={{
                                    label: {
                                        justifyContent: 'space-between',
                                        width: '100%',
                                    },
                                }}
                            >
                                {p.Name}
                            </Button>
                        ))}
                        {(!playlists?.items ||
                            playlists.items.length === 0) && (
                            <Text c="dimmed" ta="center">
                                No playlists yet
                            </Text>
                        )}
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Modal>
    );
};

export default AddToPlaylistModal;
