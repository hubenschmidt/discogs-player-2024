import React, { useState, useContext, useMemo } from 'react';
import {
    Box,
    Divider,
    Text,
    Table,
    Modal,
    Group,
    ActionIcon,
    Tooltip,
    Stack,
    Button,
} from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';
import { X } from 'lucide-react';
import classes from '../styles/PlaylistsTable.module.css';

const PlaylistsTable = () => {
    const { playlistState } = useContext(PlaylistContext);
    const { playlists = [] } = playlistState || {};
    const [opened, setOpened] = useState(false);
    const [selected, setSelected] = useState<any | null>(null);

    const rows = useMemo(
        () =>
            [...playlists].sort(
                (a, b) =>
                    new Date(b.updatedAt || b.createdAt || 0).getTime() -
                    new Date(a.updatedAt || a.createdAt || 0).getTime(),
            ),
        [playlists],
    );

    const openModal = (pl: any) => {
        setSelected(pl);
        setOpened(true);
    };
    const closeModal = () => {
        setOpened(false);
        setSelected(null);
    };

    const fmtDate = (d?: string) =>
        d ? new Date(d).toLocaleDateString() : '—';

    return (
        <Box>
            <Divider my="sm" />
            <Text c="dimmed">You have {playlists.length} playlist(s).</Text>

            <Table.ScrollContainer minWidth={640} mt="sm">
                <Table highlightOnHover withTableBorder withColumnBorders>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th style={{ width: '32%' }}>Name</Table.Th>
                            <Table.Th>Description</Table.Th>
                            <Table.Th style={{ width: 140 }}>Updated</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {rows.map(pl => (
                            <Table.Tr
                                key={pl.Playlist_Id}
                                onClick={() => openModal(pl)}
                                style={{ cursor: 'pointer' }}
                            >
                                <Table.Td>
                                    <Text lineClamp={1} title={pl.Name}>
                                        {pl.Name}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text
                                        lineClamp={1}
                                        title={pl.Description || ''}
                                    >
                                        {pl.Description || '—'}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Text>
                                        {fmtDate(pl.updatedAt || pl.createdAt)}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                        {rows.length === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={3}>
                                    <Text c="dimmed" ta="center">
                                        No playlists yet
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            {/* Playlist modal */}
            <Modal
                opened={opened}
                onClose={closeModal}
                title={selected?.Name || 'Playlist'}
                centered
                overlayProps={{
                    color: '#000',
                    backgroundOpacity: 0.75,
                    blur: 2,
                }}
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
                {selected && (
                    <Stack gap="sm">
                        <Group justify="space-between" align="center">
                            <Text fw={700}>{selected.Name}</Text>
                            <Tooltip
                                label="Close"
                                withArrow
                                openDelay={400}
                                closeDelay={100}
                                withinPortal
                            >
                                <ActionIcon
                                    variant="subtle"
                                    radius="md"
                                    size="lg"
                                    onClick={closeModal}
                                    aria-label="Close"
                                >
                                    <X size={18} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>

                        <Text c="dimmed" size="sm">
                            {selected.Description || 'No description'}
                        </Text>

                        <Text size="sm">
                            Created: {fmtDate(selected.createdAt)} • Updated:{' '}
                            {fmtDate(selected.updatedAt)}
                        </Text>

                        {/* TODO: render the playlist’s videos here if you load them; or show actions */}
                        <Group justify="flex-end" mt="sm">
                            <Button variant="light-transparent">
                                Open full view
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </Box>
    );
};

export default PlaylistsTable;
