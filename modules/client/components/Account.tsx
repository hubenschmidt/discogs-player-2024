// components/Account.tsx
import React, { useContext, useMemo, useState } from 'react';
import {
    Box,
    Stack,
    Group,
    Text,
    Badge,
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

const Account: React.FC = () => {
    const { userState } = useContext(UserContext);
    const bearerToken = useBearerToken();

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                    }
                })
                .catch(err => console.log(err));
        } catch (e: any) {
            setError(e?.message || 'Failed to delete account.');
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <Stack gap="xs">
                <Text fw={700} fz="lg">
                    Profile
                </Text>
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
                <Group>
                    <Text c="dimmed" w={120}>
                        Auth
                    </Text>
                    <Badge variant="light">Discogs + Auth0</Badge>
                </Group>

                <Divider my="sm" />

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

            <Modal
                opened={confirmOpen}
                onClose={() => !submitting && setConfirmOpen(false)}
                centered
                title="Confirm account deletion"
            >
                <Stack gap="sm">
                    <Alert
                        color="red"
                        icon={<AlertTriangle size={16} />}
                        title="Warning"
                        variant="light"
                    >
                        This is a dangerous action that <b>cannot be undone</b>.
                    </Alert>

                    <Text size="sm">
                        Please type your email{' '}
                        <b>{userState?.email || '(no email)'}</b> to confirm:
                    </Text>

                    <TextInput
                        placeholder="your@email.com"
                        value={confirmEmail}
                        onChange={e => setConfirmEmail(e.currentTarget.value)}
                        disabled={submitting}
                    />

                    {error && (
                        <Alert color="red" variant="light">
                            {error}
                        </Alert>
                    )}

                    <Group justify="flex-end" mt="xs">
                        <Button
                            variant="default"
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
            </Modal>
        </Box>
    );
};

export default Account;
