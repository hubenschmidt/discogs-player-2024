import React, { useState } from 'react';
import { Stack, Text, NavLink, Group, Image, ActionIcon } from '@mantine/core';
import { useRouter } from 'next/router';
import { Menu, ChevronLeft } from 'lucide-react';

const NavBar = ({ isCollapsed, setIsCollapsed }) => {
    const router = useRouter();

    const navLinks = [
        { href: '/history', label: 'History' },
        { href: '/playlists', label: 'Playlists' },
        { href: '/genres', label: 'Genres' },
        { href: '/styles', label: 'Styles' },
    ];

    const renderNavLinks = links => {
        return links.map(({ href, label }) => (
            <Stack key={href} align="flex-start">
                <Text>
                    <NavLink
                        href={href}
                        label={label}
                        styles={{
                            label: {
                                fontWeight:
                                    router.pathname === href ? 700 : 400, // Mantine expects numbers here
                            },
                        }}
                    />
                </Text>
            </Stack>
        ));
    };

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
                {renderNavLinks(navLinks)}
            </Stack>
        </Stack>
    );
};

export default NavBar;
