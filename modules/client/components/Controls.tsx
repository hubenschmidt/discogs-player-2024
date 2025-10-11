import React, { useContext, useEffect } from 'react';
import { PlayerContext } from '../context/playerContext';
import { ActionIcon, Group, Switch, Tooltip } from '@mantine/core';
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    Rewind,
    FastForward,
} from 'lucide-react';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

const Controls = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;
    const { dispatchDiscogsRelease, discogsReleaseState } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedVideo, continuousPlay, isPlaying, playbackMode } =
        discogsReleaseState;
    const isPlaylist = playbackMode === 'playlist';

    // (optional) ensure loop is OFF in playlist mode to avoid confusion
    useEffect(() => {
        if (isPlaylist && continuousPlay) {
            dispatchDiscogsRelease({
                type: 'SET_CONTINUOUS_PLAY',
                payload: false,
            });
        }
    }, [isPlaylist]); // eslint-disable-line react-hooks/exhaustive-deps

    const handlePlay = () => {
        controls?.play();
        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: true });
    };

    const handlePause = () => {
        controls?.pause();
        dispatchDiscogsRelease({ type: 'SET_IS_PLAYING', payload: false });
    };

    const handleFastForward = () => {
        if (controls?.getCurrentTime && controls?.seekTo) {
            controls.seekTo(controls.getCurrentTime() + 20);
        }
    };

    const handleRewind = () => {
        if (controls?.getCurrentTime && controls?.seekTo) {
            controls.seekTo(Math.max(0, controls.getCurrentTime() - 20));
        }
    };

    const handleNextVideo = () => {
        dispatchDiscogsRelease({ type: 'SET_PREVIEW_RELEASE', payload: null });
        dispatchDiscogsRelease({
            type: 'SET_PREVIEW_DISCOGS_RELEASE',
            payload: null,
        });
        dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
    };

    const handlePrevVideo = () => {
        dispatchDiscogsRelease({ type: 'SET_PREVIEW_RELEASE', payload: null });
        dispatchDiscogsRelease({
            type: 'SET_PREVIEW_DISCOGS_RELEASE',
            payload: null,
        });
        dispatchDiscogsRelease({ type: 'SET_PREV_IN_QUEUE' });
    };

    if (!selectedVideo) return null;

    return (
        <Group
            className="player-controls"
            style={{ flexWrap: 'nowrap', alignItems: 'center' }}
        >
            <ActionIcon color="transparent" onClick={handleRewind}>
                <Rewind />
            </ActionIcon>
            <ActionIcon color="transparent" onClick={handlePrevVideo}>
                <ChevronLeft />
            </ActionIcon>

            {isPlaying ? (
                <ActionIcon color="transparent" onClick={handlePause}>
                    <Pause />
                </ActionIcon>
            ) : (
                <ActionIcon color="transparent" onClick={handlePlay}>
                    <Play />
                </ActionIcon>
            )}

            <ActionIcon color="transparent" onClick={handleNextVideo}>
                <ChevronRight />
            </ActionIcon>
            <ActionIcon color="transparent" onClick={handleFastForward}>
                <FastForward />
            </ActionIcon>

            <Tooltip
                label={
                    isPlaylist
                        ? 'Disabled while playlist is playing'
                        : 'Loop release videos'
                }
            >
                <span>
                    {' '}
                    {/* wrap to make disabled Switch still show tooltip */}
                    <Switch
                        checked={continuousPlay && !isPlaylist}
                        disabled={isPlaylist}
                        styles={{
                            track: {
                                backgroundColor: isPlaylist
                                    ? '#222' // muted when disabled
                                    : continuousPlay
                                    ? 'gray'
                                    : 'black',
                                border: isPlaylist
                                    ? '1px solid #333'
                                    : continuousPlay
                                    ? 'none'
                                    : '1px solid white',
                                cursor: isPlaylist ? 'not-allowed' : 'pointer',
                                opacity: isPlaylist ? 0.6 : 1,
                            },
                            thumb: { backgroundColor: 'white' },
                        }}
                        onChange={e => {
                            if (isPlaylist) return; // guard when disabled
                            dispatchDiscogsRelease({
                                type: 'SET_CONTINUOUS_PLAY',
                                payload: e.currentTarget.checked,
                            });
                        }}
                    />
                </span>
            </Tooltip>
        </Group>
    );
};

export default Controls;
