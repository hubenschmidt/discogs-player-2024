import React from 'react';
import { Box, Group, Text, ActionIcon, Collapse } from '@mantine/core';
import { ChevronUp, ChevronDown } from 'lucide-react';

type Props = {
    title?: string;
    defaultOpen?: boolean;
    isOpen?: boolean; // controlled
    onOpenChange?: (v: boolean) => void; // controlled
    children: React.ReactNode;
    rightExtras?: React.ReactNode;
};

const CollapsibleWrapper: React.FC<Props> = ({
    title,
    defaultOpen = true,
    isOpen,
    onOpenChange,
    children,
    rightExtras,
}) => {
    // internal state only used when NOT controlled
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);

    const open = isOpen ?? internalOpen;
    const setOpen = (v: boolean) => {
        if (isOpen === undefined) setInternalOpen(v); // uncontrolled path
        onOpenChange?.(v); // notify parent if controlled
    };

    const toggle = () => setOpen(!open);

    return (
        <Box
            p="xs"
            style={{
                background: '#0e0e0f',
                borderRadius: 8,
                marginTop: '40px',
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
