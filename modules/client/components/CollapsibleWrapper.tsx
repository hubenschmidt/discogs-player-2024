// CollapsibleWrapper.tsx
import React from 'react';
import { Box, Group, Text, ActionIcon, Collapse } from '@mantine/core';
import { ChevronUp, ChevronDown } from 'lucide-react';

type Props = {
    title?: string;
    defaultOpen?: boolean;
    isOpen?: boolean;
    onOpenChange?: (v: boolean) => void;
    children: React.ReactNode;
    rightExtras?: React.ReactNode;
    leftExtras?: React.ReactNode; // ← create button goes here
};

const CollapsibleWrapper: React.FC<Props> = ({
    title,
    defaultOpen = true,
    isOpen,
    onOpenChange,
    children,
    rightExtras,
    leftExtras,
}) => {
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const open = isOpen ?? internalOpen;
    const setOpen = (v: boolean) => {
        if (isOpen === undefined) setInternalOpen(v);
        onOpenChange?.(v);
    };
    const toggle = () => setOpen(!open);

    return (
        <Box
            p="xs"
            style={{
                background: '#0e0e0f',
                borderRadius: 8,
                marginTop: '40px',
                border: '1px solid rgba(255,255,255,0.12)',
            }}
        >
            <Group justify="space-between" align="center">
                {/* LEFT SIDE: title + leftExtras inline */}
                <Group gap="sm" align="center">
                    <Text fw={700} c="white" mb={2}>
                        {title}
                    </Text>
                    {leftExtras}
                </Group>

                {/* RIGHT SIDE: rightExtras + toggle */}
                <Group gap="xs" align="center">
                    {rightExtras}
                    <ActionIcon
                        variant="light"
                        color="white"
                        radius="md"
                        size="lg"
                        aria-label={
                            open ? 'Collapse section' : 'Expand section'
                        }
                        onClick={toggle}
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
