import React, { useContext, useEffect, useRef } from 'react';
import { Stack, Group, ActionIcon, Tooltip } from '@mantine/core';
import { Menu, ChevronLeft } from 'lucide-react';
import { NavContext } from '../context/navContext';

type SidebarLinkProps = {
    label: string;
    active?: boolean;
    collapsed: boolean;
    onClick: () => void;
    href?: string;
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
};

const NavBar: React.FC<NavBarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const { navState, dispatchNav } = useContext(NavContext);
    const navLinks = [
        { key: 'history', label: 'History' },
        { key: 'playlists', label: 'Playlists' },
        { key: 'genres', label: 'Genres' },
        { key: 'styles', label: 'Styles' },
        { key: 'logout', label: 'Logout', href: '/auth/logout' },
    ];

    // ⬇️ NEW: ref + outside click / Esc handlers
    const rootRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (isCollapsed) return;

        const handlePointerDown = (e: Event) => {
            const el = rootRef.current;
            if (!el) return;
            if (!el.contains(e.target as Node)) {
                setIsCollapsed(true);
            }
        };

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsCollapsed(true);
        };

        // use capture so it fires even if something stops propagation
        document.addEventListener('mousedown', handlePointerDown, true);
        document.addEventListener('touchstart', handlePointerDown, true);
        window.addEventListener('keydown', handleKey);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown, true);
            document.removeEventListener('touchstart', handlePointerDown, true);
            window.removeEventListener('keydown', handleKey);
        };
    }, [isCollapsed, setIsCollapsed]);
    // ⬆️ NEW

    return (
        <Stack
            ref={rootRef} // ⬅️ NEW
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
                    aria-expanded={!isCollapsed} // a11y hint
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
                                collapsed={isCollapsed}
                                href={l.href}
                                onClick={() => {
                                    if (!l.href) {
                                        dispatchNav({
                                            type: 'SET_NAV_KEY',
                                            payload: l.key,
                                        });
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
