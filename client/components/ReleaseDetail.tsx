import React, { useContext } from 'react';
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
    Modal,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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
        Artists,
        Labels,
        Genres,
        Styles,
        Date_Added,
        Release_Id,
    } = rel;

    const [opened, { open, close }] = useDisclosure(false);

    const imgSrc = Cover_Image || Thumb || '';
    const discogsUrl = Release_Id
        ? `https://www.discogs.com/release/${Release_Id}`
        : undefined;

    if (!rel) return null;

    return (
        <Stack>
            <Group justify="space-between" align="center" mb="10px">
                <Text fw={700} c="white">
                    About
                </Text>
            </Group>

            <Card radius="md" p="md" style={{ background: '#0e0e0f' }}>
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
                            src={imgSrc}
                            alt={Title || 'Cover'}
                            mah={420}
                            fit="cover"
                            onClick={imgSrc ? open : undefined}
                            style={{ cursor: imgSrc ? 'zoom-in' : 'default' }}
                            role={imgSrc ? 'button' : undefined}
                            tabIndex={imgSrc ? 0 : -1}
                            onKeyDown={
                                imgSrc
                                    ? e => {
                                          if (
                                              e.key === 'Enter' ||
                                              e.key === ' '
                                          ) {
                                              e.preventDefault();
                                              open();
                                          }
                                      }
                                    : undefined
                            }
                        />

                        {/* Full-size viewer */}
                        <Modal.Root
                            opened={opened}
                            onClose={close}
                            centered
                            size="auto"
                            zIndex={1000}
                        >
                            <Modal.Overlay />

                            <Modal.Content
                                style={{
                                    backgroundColor: '#000',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    borderRadius: 12,
                                }}
                            >
                                <Modal.Header
                                    style={{
                                        backgroundColor: '#141516',
                                    }}
                                >
                                    <Group>
                                        <Text c="dimmed">
                                            a:{' '}
                                            {Artists.length
                                                ? Artists.map(
                                                      (a: any) => a?.Name,
                                                  )
                                                      .filter(Boolean)
                                                      .join(', ')
                                                : '—'}
                                        </Text>
                                        <Text c="dimmed">
                                            r: {Title || 'Untitled'}
                                        </Text>
                                        <Text c="dimmed">
                                            #:{' '}
                                            {Labels.length
                                                ? Labels.map((l: any) =>
                                                      [l?.Name, l?.Cat_No]
                                                          .filter(Boolean)
                                                          .join(' • '),
                                                  ).join(', ')
                                                : '—'}
                                        </Text>
                                    </Group>

                                    <Modal.CloseButton
                                        style={{ color: 'white' }}
                                    />
                                </Modal.Header>

                                <Modal.Body
                                    style={{
                                        backgroundColor: '#141516',
                                        paddingBottom: 8,
                                    }}
                                >
                                    <Image
                                        src={imgSrc}
                                        alt={Title || 'Cover'}
                                        radius="md"
                                        fit="contain"
                                        maw="90vw"
                                        mah="80vh"
                                    />
                                </Modal.Body>
                            </Modal.Content>
                        </Modal.Root>
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
                                    <Text c="dimmed">
                                        {formatDate(Date_Added)}
                                    </Text>
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
        </Stack>
    );
};

export default ReleaseDetail;
