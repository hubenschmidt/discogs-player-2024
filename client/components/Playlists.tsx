import React, { useState, useContext } from 'react';
import {
    Button,
    Modal,
    TextInput,
    Textarea,
    Group,
    Stack,
    Text,
    Center,
    Divider,
    Box,
    ActionIcon,
} from '@mantine/core';
import { UserContext } from '../context/userContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { Play, X } from 'lucide-react';
import PlaylistsTable from './PlaylistsTable';
import classes from '../styles/Playlists.module.css';
import { createPlaylist } from '../api';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists } = playlistState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;
    const bearerToken = useBearerToken();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

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
            setOpen(false);
            setName('');
            setDescription('');
        } catch (error: any) {
            console.log(error);
        } finally {
            setCreating(false);
        }
    };

    const handleClose = payload => {
        dispatchPlaylist({ type: 'SET_SHOW_PLAYLIST_VIEW', payload: payload });
    };

    return (
        <>
            <Group justify="space-between" mb="sm">
                <Text fw={700} size="lg">
                    Playlists
                </Text>
                <ActionIcon
                    variant="light"
                    radius="md"
                    size="lg"
                    aria-label="Close playlists"
                    onClick={() => handleClose(false)}
                >
                    <X size={18} />
                </ActionIcon>
            </Group>

            {playlists?.items?.length > 0 ? (
                <Box>
                    {/* TODO: render your playlists list/grid here */}
                    {/* Example placeholder: */}
                    <PlaylistsTable />
                </Box>
            ) : (
                <Center mih={160}>
                    <Stack align="center" gap="xs">
                        <Text c="dimmed">No playlists yet</Text>
                        <Button variant="light" onClick={() => setOpen(true)}>
                            Create
                        </Button>
                    </Stack>
                </Center>
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
                        backgroundColor: 'var(--mantine-color-dark-7)',
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
