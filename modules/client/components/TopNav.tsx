// components/TopNav.tsx
import React, { useContext } from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { Library, Disc3, PlayCircle, History, ListMusic, Compass } from 'lucide-react';
import { NavContext } from '../context/navContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

type Props = { compact?: boolean };

function getHeaderOffset(extra = 40) {
  const header = document.querySelector<HTMLElement>('header, [data-app-header]');
  const headerH = header?.offsetHeight ?? 0;
  return headerH + extra; // <-- add the extra 40px
}

function scrollToWithOffset(id: string, extra = 40) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset(extra);
  window.scrollTo({ top, behavior: 'smooth' });
}

const TopNav: React.FC<Props> = ({ compact = false }) => {
  const { navState, dispatchNav } = useContext(NavContext);
  const { navKey } = navState;
  const { discogsReleaseState } = useContext(DiscogsReleaseContext);
  const { selectedRelease, selectedVideo } = discogsReleaseState;

  const togglePanel = (key: 'history' | 'playlists' | 'explorer') => {
    dispatchNav({ type: 'SET_NAV_KEY', payload: navKey === key ? '' : key });
  };

  const tabs = [
    {
      key: 'collection',
      label: 'Collection',
      icon: <Library size={18} />,
      disabled: false,
      active: true,
      onClick: () => scrollToWithOffset('section-collection'),
    },
    {
      key: 'release',
      label: 'Release',
      icon: <Disc3 size={18} />,
      disabled: !selectedRelease,
      active: !!selectedRelease,
      onClick: () => scrollToWithOffset('section-release'),
    },
    {
      key: 'video',
      label: 'Video',
      icon: <PlayCircle size={18} />,
      disabled: !selectedVideo,
      active: !!selectedVideo,
      onClick: () => scrollToWithOffset('section-video'),
    },
    {
      key: 'history',
      label: 'History',
      icon: <History size={18} />,
      disabled: false,
      active: navKey === 'history',
      onClick: () => {
        togglePanel('history');
        // ensure the panel mounts before measuring/scrolling
        requestAnimationFrame(() => requestAnimationFrame(() => {
          scrollToWithOffset('section-history');
        }));
      },
    },
    {
      key: 'playlists',
      label: 'Playlists',
      icon: <ListMusic size={18} />,
      disabled: false,
      active: navKey === 'playlists',
      onClick: () => {
        togglePanel('playlists');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          scrollToWithOffset('section-playlists');
        }));
      },
    },
    {
      key: 'explorer',
      label: 'Explorer',
      icon: <Compass size={18} />,
      disabled: false,
      active: navKey === 'explorer',
      onClick: () => {
        togglePanel('explorer');
        requestAnimationFrame(() => requestAnimationFrame(() => {
          scrollToWithOffset('section-explorer');
        }));
      },
    },
  ] as const;

  return (
    <Group
      gap="xs"
      wrap="nowrap"
      style={{
        padding: compact ? 0 : '6px 10px',
        borderBottom: compact ? 'none' : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {tabs.map(t => {
        const btn = (
          <ActionIcon
            key={t.key}
            size="lg"
            radius="md"
            variant={t.active ? 'filled' : 'subtle'}
            color={t.active ? 'green' : 'gray'}
            aria-label={t.label}
            aria-disabled={t.disabled}
            tabIndex={t.disabled ? -1 : 0}
            onClick={e => {
              e.preventDefault();
              if (!t.disabled) t.onClick();
            }}
            styles={{
              root: {
                opacity: t.disabled ? 0.5 : 1,
                cursor: t.disabled ? 'not-allowed' : 'pointer',
                border: t.active ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
                transition: 'background 120ms ease, border-color 120ms ease',
              },
            }}
          >
            {t.icon}
          </ActionIcon>
        );

        return (
          <Tooltip key={t.key} label={t.disabled ? 'Not available' : t.label} withArrow withinPortal zIndex={3000}>
            <span style={{ display: 'inline-flex' }}>{btn}</span>
          </Tooltip>
        );
      })}
    </Group>
  );
};

export default TopNav;
