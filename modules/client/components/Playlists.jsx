import React, { useEffect, useContext, useState } from 'react';
import {
    Button,
    Modal,
    TextInput,
    Textarea,
    Group,
    Stack,
    Text,
    Box,
} from '@mantine/core';
import { UserContext } from '../context/userContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';
import PlaylistsTable from './PlaylistsTable';
import classes from '../styles/Playlists.module.css';
import { createPlaylist, getPlaylists } from '../api';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists, createOpen } = playlistState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;
    const bearerToken = useBearerToken();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const page = playlistState.page;
        const limit = playlistState.limit ?? 10;
        const orderBy = playlistState.orderBy ?? 'updatedAt';
        const order = playlistState.order ?? 'DESC';
        if (!page) return;

        getPlaylists(userState.username, bearerToken, {
            page,
            limit,
            orderBy,
            order,
        })
            .then(res =>
                dispatchPlaylist({ type: 'SET_PLAYLISTS', payload: res }),
            )
            .catch(console.log);
    }, [
        playlistState.page,
        playlistState.limit,
        playlistState.orderBy,
        playlistState.order,
        playlistState.playlistsVersion,
        userState.username,
        bearerToken,
        createOpen, // refetch after create/close
    ]);

    const close = () => {
        dispatchPlaylist({ type: 'SET_PLAYLIST_CREATE_OPEN', payload: false });
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

            // reset form + close
            setName('');
            setDescription('');
            close();

            // keep page size, jump to page 1 (optional)
            dispatchPlaylist({
                type: 'SET_PLAYLISTS_LIMIT',
                payload: { limit: playlistState.limit, page: 1 },
            });

            // trigger refetch
            dispatchPlaylist({ type: 'SET_PLAYLISTS_VERSION' });
        } catch (error) {
            console.log(error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <Box mt="sm">
                {playlists?.items?.length > 0 ? (
                    <PlaylistsTable />
                ) : (
                    <Text c="dimmed">No playlists yet</Text>
                )}
            </Box>

            <Modal
                opened={!!createOpen}
                onClose={close}
                title="Create playlist"
                centered
                styles={{
                    content: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    body: {
                        backgroundColor: 'var(--mantine-color-dark-7)',
                        color: 'white',
                    }, // fixed var
                    title: { color: 'white' },
                    close: { color: 'white' },
                }}
            >
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
                        onChange={e => setDescription(e.currentTarget.value)}
                        autosize
                        minRows={2}
                    />
                    <Group justify="flex-end" mt="xs">
                        <Button
                            variant="light-transparent"
                            onClick={close}
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
                    {selectedVideo && <Text>{selectedVideo.title}</Text>}
                </Stack>
            </Modal>
        </>
    );
};

export default Playlists;

// components/Playlists.tsx (exported helper)
export const PlaylistCreateButton = () => {
    const { dispatchPlaylist } = useContext(PlaylistContext);
    return (
        <Button
            mb="-10"
            variant="light"
            color="white"
            onClick={() =>
                dispatchPlaylist({
                    type: 'SET_PLAYLIST_CREATE_OPEN',
                    payload: true,
                })
            }
        >
            Create
        </Button>
    );
};
