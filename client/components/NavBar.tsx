// NavBar.tsx
import React from 'react';
import { Stack, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Menu, ChevronLeft } from 'lucide-react';

type SidebarLinkProps = {
    label: string;
    active?: boolean;
    collapsed: boolean;
    onClick: () => void;
    href?: string; // allow external links
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
    label,
    active,
    collapsed,
    onClick,
    href,
}) => {
    const content = (
        <span className="sidebar-link__label">{!collapsed && label}</span>
    );

    return (
        <Tooltip
            label={label}
            position="right"
            withArrow
            disabled={!collapsed}
            transitionProps={{ duration: 0 }}
        >
            {href ? (
                // Normal anchor for external navigation (logout)
                <a href={href} className="sidebar-link">
                    {content}
                </a>
            ) : (
                <button
                    type="button"
                    className="sidebar-link"
                    data-active={active || undefined}
                    onClick={onClick}
                >
                    {content}
                </button>
            )}
        </Tooltip>
    );
};

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
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
    ];

    return (
        <Stack
            pos="fixed"
            top={8}
            left={8}
            w={isCollapsed ? 40 : 120}
            h={isCollapsed ? 40 : '100vh'}
            align="flex-start"
            justify={isCollapsed ? 'center' : 'flex-start'}
            style={{
                background: 'black',
                zIndex: 950,
                overflow: 'hidden',
                borderRadius: 8,
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

            {!isCollapsed && (
                <Stack align="flex-start">
                    <Stack gap={4} px={6}>
                        {navLinks.map(l => (
                            <SidebarLink
                                key={l.key}
                                label={l.label}
                                active={activePanel === l.key}
                                collapsed={isCollapsed}
                                href={l.href}
                                onClick={() => {
                                    if (!l.href) {
                                        onSelect(
                                            activePanel === l.key ? '' : l.key,
                                        );
                                        setIsCollapsed(true);
                                    }
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
