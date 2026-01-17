// components/Account.jsx
import React, { useContext, useMemo, useState } from 'react';
import {
    Box,
    Stack,
    Group,
    Text,
    Button,
    Divider,
    Modal,
    TextInput,
    Alert,
} from '@mantine/core';
import { AlertTriangle } from 'lucide-react';
import { UserContext } from '../context/userContext';
import { useBearerToken } from '../hooks/useBearerToken';
import { deleteUser } from '../api';

const Account = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const canConfirm = useMemo(
        () =>
            !!userState?.email &&
            confirmEmail.trim().toLowerCase() ===
                userState.email.trim().toLowerCase(),
        [confirmEmail, userState?.email],
    );

    const handleDelete = async () => {
        if (!userState?.username || !bearerToken) return;
        setSubmitting(true);
        setError(null);
        try {
            deleteUser(userState.userId, bearerToken)
                .then(res => {
                    if (res) {
                        window.location.href = '/auth/logout'; // Hard-logout after deletion
                        return;
                    }
                    // else deletion did not happen
                    setError(
                        'User was not deleted. Please contact support or try again.',
                    );
                })
                .catch(err => {
                    setError(
                        'User was not deleted. Please contact support or try again.',
                    );
                    console.log(err);
                })
                .finally(() => setSubmitting(false));
        } catch (e) {
            setError(e?.message || 'Failed to delete account.');
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Stack gap="xs">
                <Group>
                    <Text c="dimmed" w={120}>
                        Username
                    </Text>
                    <Text>{userState?.username || '—'}</Text>
                </Group>
                <Group>
                    <Text c="dimmed" w={120}>
                        Email
                    </Text>
                    <Text>{userState?.email || '—'}</Text>
                </Group>

                <Divider my="sm" color="rgba(255,255,255,0.12)" />

                <Stack gap="xs">
                    <Text fw={700} fz="lg">
                        Danger zone
                    </Text>
                    <Text c="dimmed">
                        Deleting your account removes your playlists, history,
                        and all user-linked data. This cannot be undone.
                    </Text>
                    <Group>
                        <Button
                            color="red"
                            variant="filled"
                            onClick={() => {
                                setConfirmEmail('');
                                setError(null);
                                setConfirmOpen(true);
                            }}
                        >
                            Delete account
                        </Button>
                    </Group>
                </Stack>
            </Stack>

            {/* Dark-styled modal to match AddToPlaylistModal */}
            <Modal.Root
                opened={confirmOpen}
                onClose={() => !submitting && setConfirmOpen(false)}
                centered
                size="lg"
            >
                <Modal.Overlay backgroundOpacity={0.5} />
                <Modal.Content
                    style={{
                        border: '1px solid #fff',
                        borderRadius: 12,
                    }}
                >
                    <Modal.Header
                        style={{ backgroundColor: '#141516', color: 'white' }}
                    >
                        <Modal.Title>Confirm account deletion</Modal.Title>
                        <Modal.CloseButton disabled={submitting} />
                    </Modal.Header>

                    <Modal.Body
                        style={{ backgroundColor: '#141516', color: 'white' }}
                    >
                        <Stack gap="sm">
                            <Alert
                                color="red"
                                icon={<AlertTriangle size={16} />}
                                title="Warning"
                                variant="light"
                                styles={{
                                    message: { color: '#fff' },
                                }}
                            >
                                This action <b>cannot be undone</b>.
                            </Alert>

                            <Text size="sm">
                                Please type your email{' '}
                                <b>{userState?.email || '(no email)'}</b> to
                                confirm:
                            </Text>

                            <TextInput
                                placeholder="your@email.com"
                                value={confirmEmail}
                                onChange={e =>
                                    setConfirmEmail(e.currentTarget.value)
                                }
                                disabled={submitting}
                                styles={{
                                    input: {
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        borderColor: 'rgba(255,255,255,0.35)',
                                    },
                                }}
                            />

                            {error && (
                                <Alert
                                    color="yellow"
                                    variant="light"
                                    styles={{
                                        message: { color: '#fff' },
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            <Group justify="flex-end" mt="xs">
                                <Button
                                    variant="light-transparent"
                                    onClick={() => setConfirmOpen(false)}
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="red"
                                    onClick={handleDelete}
                                    disabled={!canConfirm || submitting}
                                    loading={submitting}
                                >
                                    Permanently delete
                                </Button>
                            </Group>
                        </Stack>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </Box>
    );
};

export default Account;
