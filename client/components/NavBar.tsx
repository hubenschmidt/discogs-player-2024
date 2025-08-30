import React, { useState } from 'react';
import {
    Stack,
    Text,
    NavLink,
    Group,
    Image,
    ActionIcon,
    Tooltip,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { Menu, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const SidebarLink = ({ label, href, active, collapsed }) => {
    return (
        <Tooltip
            label={label}
            position="right"
            withArrow
            disabled={!collapsed ? true : false}
            transitionProps={{ duration: 0 }}
        >
            <Link
                href={href}
                className="sidebar-link"
                data-active={active || undefined}
            >
                {!collapsed && (
                    <span className="sidebar-link__label">{label}</span>
                )}
            </Link>
        </Tooltip>
    );
};

const NavBar = ({ isCollapsed, setIsCollapsed }) => {
    const router = useRouter();

    const navLinks = [
        { href: '/history', label: 'History' },
        { href: '/playlists', label: 'Playlists' },
        { href: '/genres', label: 'Genres' },
        { href: '/styles', label: 'Styles' },
    ];

    return (
        <Stack
            pos="fixed"
            w={isCollapsed ? '10px' : '120px'}
            p={4}
            h="100vh"
            align="flex-start"
            style={{
                position: 'sticky',
                top: 0,
                background: isCollapsed ? 'transparent' : 'black',
                zIndex: 1000,
            }}
        >
            {/* Logo with Toggle */}
            <Group justify="space-between" w="100%" align="center">
                <ActionIcon
                    variant="subtle"
                    size="lg"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label="Toggle sidebar"
                    color="white"
                >
                    {isCollapsed ? (
                        <Menu size={20} />
                    ) : (
                        <ChevronLeft size={20} />
                    )}
                </ActionIcon>
            </Group>

            {/* Navigation Links */}
            <Stack align="flex-start" display={isCollapsed ? 'none' : 'flex'}>
                <Stack gap={4} px={6}>
                    {navLinks.map(l => (
                        <SidebarLink
                            key={l.href}
                            {...l}
                            active={router.pathname === l.href}
                            collapsed={isCollapsed}
                        />
                    ))}
                </Stack>
            </Stack>
        </Stack>
    );
};

export default NavBar;
