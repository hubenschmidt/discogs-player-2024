import React, { useContext, useMemo } from 'react';
import {
    Box,
    Group,
    Stack,
    Text,
    Divider,
    Badge,
    ScrollArea,
    Card,
} from '@mantine/core';
import { PlaylistContext } from '../context/playlistContext';

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '—');

const Playlist = () => {
    const { playlistState } = useContext(PlaylistContext);
    const pl = playlistState?.playlistDetail;

    const tracksCount = useMemo(
        () => pl?.Tracks_Count ?? pl?.Videos?.length ?? 0,
        [pl],
    );

    if (!pl) {
        return (
            <Box p="sm">
                <Text c="dimmed">No playlist selected.</Text>
            </Box>
        );
    }

    return (
        <Card
            withBorder
            p="md"
            style={{ backgroundColor: 'var(--mantine-color-dark-9)' }}
        >
            <Stack gap="xs">
                <Group justify="space-between" align="center">
                    <Text fw={700} fz="lg">
                        {pl.Name || 'Untitled playlist'}
                    </Text>
                    <Badge variant="light">
                        {tracksCount} track{tracksCount === 1 ? '' : 's'}
                    </Badge>
                </Group>

                {pl.Description && (
                    <Text c="dimmed" size="sm">
                        {pl.Description}
                    </Text>
                )}

                <Group gap="md" c="dimmed" fz="xs">
                    <Text>Created: {fmtDate(pl.createdAt)}</Text>
                    <Text>Updated: {fmtDate(pl.updatedAt)}</Text>
                </Group>

                <Divider my="xs" />

                <Text fw={600} size="sm">
                    Tracks
                </Text>

                <ScrollArea.Autosize mah={280} type="auto">
                    <Stack gap={6}>
                        {(pl.Videos ?? []).map((v: any, idx: number) => {
                            const title =
                                v.Title ?? v.title ?? v.Name ?? 'Untitled';
                            const uri = v.URI ?? v.uri ?? '';
                            return (
                                <Group
                                    key={v.Video_Id ?? uri ?? idx}
                                    justify="space-between"
                                    wrap="nowrap"
                                    style={{
                                        padding: '6px 8px',
                                        borderRadius: 6,
                                        background: 'rgba(255,255,255,0.04)',
                                    }}
                                >
                                    <Text lineClamp={1} title={title}>
                                        {title}
                                    </Text>
                                    {uri && (
                                        <Text c="dimmed" size="xs" title={uri}>
                                            {uri}
                                        </Text>
                                    )}
                                </Group>
                            );
                        })}
                        {(!pl.Videos || pl.Videos.length === 0) && (
                            <Text c="dimmed" ta="center">
                                No tracks yet
                            </Text>
                        )}
                    </Stack>
                </ScrollArea.Autosize>
            </Stack>
        </Card>
    );
};

export default Playlist;
