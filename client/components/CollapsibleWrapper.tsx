import React, { useState, type ReactNode } from 'react';
import { Box, Group, Text, ActionIcon, Collapse, Divider } from '@mantine/core';
import { ChevronUp, ChevronDown } from 'lucide-react';

type Props = {
    title?: string;
    defaultOpen?: boolean;
    children: ReactNode;
    rightExtras?: ReactNode; // optional extra controls in header
};

const CollapsibleWrapper: React.FC<Props> = ({
    title,
    defaultOpen = true,
    children,
    rightExtras,
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <Box
            p="xs"
            style={{
                background: '#0e0e0f',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <Group justify="space-between" align="center">
                {title ? (
                    <Text fw={700} c="white" mb="5">
                        {title}
                    </Text>
                ) : (
                    <span />
                )}

                <Group gap="xs">
                    {rightExtras}
                    <ActionIcon
                        variant="subtle"
                        color="white"
                        aria-label={
                            open ? 'Collapse section' : 'Expand section'
                        }
                        onClick={() => setOpen(o => !o)}
                    >
                        {open ? (
                            <ChevronUp size={18} />
                        ) : (
                            <ChevronDown size={18} />
                        )}
                    </ActionIcon>
                </Group>
            </Group>

            <Collapse in={open} transitionDuration={150}>
                {children}
            </Collapse>
        </Box>
    );
};

export default CollapsibleWrapper;
