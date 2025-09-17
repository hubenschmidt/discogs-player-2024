import React, { useContext, useMemo } from 'react';
import {
    Box,
    Card,
    Grid,
    Image,
    Group,
    Stack,
    Text,
    Badge,
    Anchor,
    Divider,
} from '@mantine/core';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

const ReleaseDetail: React.FC = () => {
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedRelease, previewRelease } = discogsReleaseState;

    const rel = previewRelease ?? selectedRelease;
    const isPreview =
        !!previewRelease &&
        previewRelease?.Release_Id !== selectedRelease?.Release_Id;

    const {
        Title,
        Year,
        Cover_Image,
        Thumb,
        Artists = [],
        Labels = [],
        Genres = [],
        Styles = [],
        Date_Added,
        Release_Id,
    } = rel || ({} as any);

    const discogsUrl = useMemo(
        () =>
            Release_Id
                ? `https://www.discogs.com/release/${Release_Id}`
                : undefined,
        [Release_Id],
    );

    if (!rel) return null;

    return (
        <Card
            radius="md"
            withBorder
            p="md"
            style={{ background: '#0e0e0f', color: 'white' }}
        >
            {/* Header */}
            <Group justify="space-between" align="center" mb="xs">
                <Group gap="sm" align="baseline">
                    <Text fw={700} fz="lg" c="white">
                        {Title || 'Untitled'}
                    </Text>
                    {Year ? <Badge variant="light">{Year}</Badge> : null}
                    {isPreview ? (
                        <Badge color="yellow" variant="light">
                            Previewing
                        </Badge>
                    ) : null}
                </Group>

                {discogsUrl && (
                    <Anchor
                        href={discogsUrl}
                        target="_blank"
                        rel="noreferrer"
                        c="cyan"
                    >
                        View on Discogs
                    </Anchor>
                )}
            </Group>

            <Divider my="sm" color="rgba(255,255,255,0.12)" />

            {/* Body */}
            <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 4, md: 3 }}>
                    <Image
                        radius="md"
                        src={Cover_Image || Thumb}
                        alt={Title || 'Cover'}
                        mah={420}
                        fit="cover"
                    />
                </Grid.Col>

                <Grid.Col span={{ base: 12, sm: 8, md: 9 }}>
                    <Stack gap="xs">
                        {/* Artists */}
                        <Box>
                            <Text fw={700} c="white" mb={4}>
                                Artist{Artists.length > 1 ? 's' : ''}
                            </Text>
                            <Text c="dimmed">
                                {Artists.length
                                    ? Artists.map((a: any) => a?.Name)
                                          .filter(Boolean)
                                          .join(', ')
                                    : '—'}
                            </Text>
                        </Box>

                        {/* Labels */}
                        <Box>
                            <Text fw={700} c="white" mb={4}>
                                Label{Labels.length > 1 ? 's' : ''} / Cat#
                            </Text>
                            <Text c="dimmed">
                                {Labels.length
                                    ? Labels.map((l: any) =>
                                          [l?.Name, l?.Cat_No]
                                              .filter(Boolean)
                                              .join(' • '),
                                      ).join(', ')
                                    : '—'}
                            </Text>
                        </Box>

                        {/* Genres & Styles */}
                        <Group gap="xs" mt="xs" wrap="wrap">
                            {Genres?.map((g: any, i: number) => (
                                <Badge key={`g-${i}`} variant="light">
                                    {g?.Name || g}
                                </Badge>
                            ))}
                            {Styles?.map((s: any, i: number) => (
                                <Badge key={`s-${i}`} variant="outline">
                                    {s?.Name || s}
                                </Badge>
                            ))}
                            {!Genres?.length && !Styles?.length && (
                                <Text c="dimmed">No genre/style tags</Text>
                            )}
                        </Group>

                        {/* Meta */}
                        <Divider my="sm" color="rgba(255,255,255,0.12)" />
                        <Group gap="xl" wrap="wrap">
                            <Box>
                                <Text fw={700} c="white" mb={2}>
                                    Added
                                </Text>
                                <Text c="dimmed">{formatDate(Date_Added)}</Text>
                            </Box>
                            <Box>
                                <Text fw={700} c="white" mb={2}>
                                    Release ID
                                </Text>
                                <Text c="dimmed">{Release_Id ?? '—'}</Text>
                            </Box>
                        </Group>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Card>
    );
};

export default ReleaseDetail;
