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
    MantineProvider,
} from '@mantine/core';
import { UserContext } from '../context/userContext';
import { PlaylistContext } from '../context/playlistContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { X } from 'lucide-react';
import { variantColorResolver } from '../lib/variantColorResolver';

const Playlists = () => {
    const { userState } = useContext(UserContext);
    const { playlistState, dispatchPlaylist } = useContext(PlaylistContext);
    const { playlists } = playlistState;
    const bearerToken = useBearerToken();

    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = () => {};

    const handleClose = payload => {
        dispatchPlaylist({ type: 'SET_SHOW_PLAYLIST_VIEW', payload: payload });
    };

    return (
        <MantineProvider theme={{ variantColorResolver }}>
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

            {playlists?.length > 0 ? (
                <Box>
                    {/* TODO: render your playlists list/grid here */}
                    {/* Example placeholder: */}
                    <Divider my="sm" />
                    <Text c="dimmed">
                        You have {playlists.length} playlist(s).
                    </Text>
                </Box>
            ) : (
                <Center mih={160}>
                    <Stack align="center" gap="xs">
                        <Text c="dimmed">No playlists yet</Text>
                        <Button onClick={() => setOpen(true)}>
                            Create your first playlist
                        </Button>
                    </Stack>
                </Center>
            )}

            <Modal
                opened={open}
                onClose={() => setOpen(false)}
                title="Create playlist"
                centered
            >
                <Stack>
                    <TextInput
                        label="Name"
                        placeholder="Late Night Dubs"
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
                    {error && <Text c="red">{error}</Text>}
                    <Group justify="flex-end" mt="xs">
                        <Button
                            variant="default"
                            onClick={() => setOpen(false)}
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onSubmit}
                            loading={creating}
                            disabled={!name.trim()}
                        >
                            Create
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </MantineProvider>
    );
};

export default Playlists;
