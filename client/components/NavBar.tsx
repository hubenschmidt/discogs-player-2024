// NavBar.tsx
import React from 'react';
import { Stack, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Menu, ChevronLeft } from 'lucide-react';

type SidebarLinkProps = {
    label: string;
    active?: boolean;
    collapsed: boolean;
    onClick: () => void;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
    label,
    active,
    collapsed,
    onClick,
}) => (
    <Tooltip
        label={label}
        position="right"
        withArrow
        disabled={!collapsed}
        transitionProps={{ duration: 0 }}
    >
        <button
            type="button"
            className="sidebar-link"
            data-active={active || undefined}
            onClick={onClick}
        >
            {!collapsed && <span className="sidebar-link__label">{label}</span>}
        </button>
    </Tooltip>
);

type NavBarProps = {
    isCollapsed: boolean;
    setIsCollapsed: (v: boolean) => void;
    activePanel: string | null;
    onSelect: (panel: string) => void;
};

const NavBar: React.FC<NavBarProps> = ({
    isCollapsed,
    setIsCollapsed,
    activePanel,
    onSelect,
}) => {
    const navLinks = [
        { key: 'history', label: 'History' },
        { key: 'playlists', label: 'Playlists' },
        { key: 'genres', label: 'Genres' },
        { key: 'styles', label: 'Styles' },
    ];

    return (
        <Stack
            pos="fixed"
            w={isCollapsed ? '30px' : '120px'}
            p={isCollapsed ? 0 : 4}
            h="100vh"
            align="flex-start"
            style={{
                position: 'sticky',
                top: 0,
                background: isCollapsed ? 'transparent' : 'black',
                zIndex: 1000,
                overflow: 'hidden', // <-- keep stragglers hidden
            }}
        >
            <Group justify="space-between" w="100%" align="center">
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle sidebar"
                    color="white"
                >
                    {isCollapsed ? (
                        <Menu size={30} />
                    ) : (
                        <ChevronLeft size={30} />
                    )}
                </ActionIcon>
            </Group>

            {/* Unmount instead of display:none */}
            {!isCollapsed && (
                <Stack align="flex-start">
                    <Stack gap={4} px={6}>
                        {navLinks.map(l => (
                            <SidebarLink
                                key={l.key}
                                label={l.label}
                                active={activePanel === l.key}
                                collapsed={isCollapsed}
                                onClick={() => {
                                    onSelect(
                                        activePanel === l.key ? '' : l.key,
                                    );
                                    setIsCollapsed(true); // collapse after selecting
                                }}
                            />
                        ))}
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
};

export default NavBar;
