import React, { useContext, useState, useEffect } from 'react';
import {
    Modal,
    Stack,
    Text,
    Button,
    Group,
    ScrollArea,
    Textarea,
    TextInput,
} from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { addToPlaylist, createPlaylist, getPlaylists } from '../api';
import classes from '../styles/Playlists.module.css';

const AddToPlaylistModal = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { addModalOpen, playlists } = playlistState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;
    const bearerToken = useBearerToken();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const handleClose = () =>
        dispatchPlaylist({ type: 'SET_ADD_MODAL', payload: false });

    const onPick = (pl: any) => {
        if (!selectedVideo) return;

        // keep track of last-picked in context
        dispatchPlaylist({ type: 'SET_SELECTED_PLAYLIST', payload: pl });
        setLoadingId(pl.Playlist_Id);

        addToPlaylist(userState.username, bearerToken, pl, selectedVideo)
            .then(res => {
                dispatchPlaylist({ type: 'SET_PLAYLIST_VERSION' });
                dispatchPlaylist({
                    type: 'SET_SELECTED_PLAYLIST',
                    payload: null,
                });
                handleClose();
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoadingId(null));
    };

    const onSubmit = async () => {
        setCreating(true);
        try {
            await createPlaylist(
                userState?.username,
                bearerToken,
                name.trim(),
                description?.trim(),
                selectedVideo,
            );

            dispatchPlaylist({ type: 'SET_PLAYLIST_VERSION' });

            // close + reset form
            setOpen(false);
            setName('');
            setDescription('');
        } catch (error: any) {
            console.log(error);
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        getPlaylists(userState.username, bearerToken, {
            orderBy: 'updatedAt',
            order: 'DESC',
        })
            .then(res =>
                dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res }),
            )
            .catch(err => console.log(err));
    }, [open]);

    return (
        <Modal.Root
            opened={addModalOpen}
            onClose={() => handleClose()}
            centered
            size="lg"
        >
            <Modal.Overlay backgroundOpacity={0.5} />
            <Modal.Content
                style={{
                    border: '1px solid #fff',
                    borderRadius: 12, // optional, match your design
                }}
            >
                <Modal.Header
                    style={{
                        backgroundColor: '#141516',
                    }}
                >
                    <Modal.Title>Add Track</Modal.Title>
                    {!open && (
                        <Group ml="auto" gap="xs" align="center">
                            <Button
                                variant="light"
                                onClick={() => setOpen(true)}
                            >
                                Create Playlist
                            </Button>
                            <Modal.CloseButton />
                        </Group>
                    )}
                </Modal.Header>

                <Modal.Body
                    style={{
                        backgroundColor: '#141516',
                        color: 'white',
                    }}
                >
                    {open && (
                        <Stack>
                            <TextInput
                                label="Name"
                                placeholder="Name"
                                value={name}
                                onChange={e => setName(e.currentTarget.value)}
                                withAsterisk
                            />
                            <Textarea
                                label="Description"
                                placeholder="Optional description"
                                value={description}
                                onChange={e =>
                                    setDescription(e.currentTarget.value)
                                }
                                autosize
                                minRows={2}
                            />
                            <Group justify="flex-end" mt="xs">
                                <Button
                                    variant="light-transparent"
                                    onClick={() => setOpen(false)}
                                    disabled={creating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="light-transparent"
                                    onClick={onSubmit}
                                    loading={creating}
                                    disabled={!name.trim()}
                                    classNames={classes}
                                >
                                    Save
                                </Button>
                            </Group>
                            {selectedVideo && (
                                <Text>Track: {selectedVideo.title}</Text>
                            )}
                        </Stack>
                    )}
                    {!open && (
                        <Stack gap="sm">
                            {selectedVideo && (
                                <Text size="sm">
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
                                            loading={
                                                loadingId === p.Playlist_Id
                                            }
                                            rightSection={
                                                <Group mr="8">
                                                    <Text
                                                        size="sm"
                                                        span
                                                        style={{
                                                            whiteSpace:
                                                                'nowrap',
                                                        }}
                                                    >
                                                        {p?.Videos?.length ??
                                                            '—'}{' '}
                                                        tracks
                                                    </Text>
                                                </Group>
                                            }
                                            styles={{
                                                label: {
                                                    justifyContent:
                                                        'space-between',
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
                    )}
                </Modal.Body>
            </Modal.Content>
        </Modal.Root>
    );
};

export default AddToPlaylistModal;
