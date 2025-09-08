import React, { useEffect, useState, useContext } from 'react';
import {
    Button,
    Modal,
    TextInput,
    Textarea,
    Group,
    Stack,
    Text,
    Box,
    ActionIcon,
} from '@mantine/core';
import { UserContext } from '../context/userContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { X } from 'lucide-react';
import PlaylistsTable from './PlaylistsTable';
import classes from '../styles/Playlists.module.css';
import { createPlaylist } from '../api';
import { getPlaylists } from '../api';
import { NavContext } from '../context/navContext';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { dispatchNav } = useContext(NavContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists } = playlistState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;
    const bearerToken = useBearerToken();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        const page = playlistState.pendingPage;
        const limit =
            playlistState.pendingLimit ??
            playlistState.playlists?.pageSize ??
            10;
        const orderBy = playlistState.pendingOrderBy ?? 'updatedAt';
        const order = playlistState.pendingOrder ?? 'DESC';

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
            .catch(err => console.log(err));
    }, [
        playlistState.pendingPage,
        playlistState.pendingLimit,
        playlistState.pendingOrderBy,
        playlistState.pendingOrder,
        userState.username,
        bearerToken,
        open,
    ]);

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

            // close + reset form
            setOpen(false);
            setName('');
            setDescription('');

            // keep current page size, jump to page 1
            const prevLimit =
                playlistState.pendingLimit ??
                playlistState.playlists?.pageSize ??
                10;

            dispatchPlaylist({
                type: 'SET_PLAYLISTS_PAGE_SIZE',
                payload: { limit: prevLimit, page: 1 },
            });
        } catch (error: any) {
            console.log(error);
        } finally {
            setCreating(false);
        }
    };

    const handleClose = payload => {
        dispatchNav({ type: 'SET_NAV_KEY', payload: payload });
    };

    return (
        <>
            <Group align="center">
                <Text fw={700} size="lg">
                    Playlists
                </Text>
                <Button variant="light" onClick={() => setOpen(true)}>
                    Create
                </Button>

                <ActionIcon
                    ml="auto" // <- pushes this item to the far right
                    variant="light"
                    radius="md"
                    size="lg"
                    aria-label="Close playlists"
                    onClick={() => handleClose(null)}
                >
                    <X size={18} />
                </ActionIcon>
            </Group>

            {playlists?.items?.length > 0 ? (
                <Box>
                    <PlaylistsTable />
                </Box>
            ) : (
                <Text c="dimmed">No playlists yet</Text>
            )}

            <Modal
                opened={open}
                onClose={() => setOpen(false)}
                title="Create playlist"
                centered
                styles={{
                    content: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    header: { backgroundColor: 'var(--mantine-color-dark-7)' },
                    body: {
                        backgroundColor: 'var(--mantine-color-dark-`7`)',
                        color: 'white',
                    },
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
                    {selectedVideo && <Text>{selectedVideo.title}</Text>}
                </Stack>
            </Modal>
        </>
    );
};

export default Playlists;
