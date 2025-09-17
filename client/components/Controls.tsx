import React, { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../context/playerContext';
import { ActionIcon, Group, Switch } from '@mantine/core';
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
    const { selectedVideo, continuousPlay, isPlaying } = discogsReleaseState;
    const [playbackRate, setPlaybackRate] = useState('1');
    const [availableRates, setAvailableRates] = useState<number[]>([]);
    console.log(isPlaying);

    useEffect(() => {
        if (controls && controls.getAvailablePlaybackRates) {
            const rates = controls.getAvailablePlaybackRates();
            if (rates && Array.isArray(rates) && rates.length > 0) {
                setAvailableRates(rates);
            }
        }
    }, [controls]);

    useEffect(() => {
        setPlaybackRate('1');
    }, [selectedVideo]);

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
            const currentTime = controls.getCurrentTime();
            controls.seekTo(currentTime + 20); // skip forward 10s
        }
    };

    const handleRewind = () => {
        if (controls?.getCurrentTime && controls?.seekTo) {
            const currentTime = controls.getCurrentTime();
            controls.seekTo(Math.max(0, currentTime - 20)); // rewind 10s, avoid negative time
        }
    };

    const handlePlaybackRateChange = (value: string) => {
        setPlaybackRate(value);
        const newRate = parseFloat(value);
        controls?.setPlaybackRate(newRate);
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

    return selectedVideo ? (
        <>
            {/* Slider wrapped in a container to push it to the right */}
            <Group
                style={{ flexWrap: 'nowrap', alignItems: 'center' }}
                mb="10px"
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <select
                        value={playbackRate}
                        onChange={e => handlePlaybackRateChange(e.target.value)}
                        style={{
                            backgroundColor: '#222',
                            color: '#fff',
                            border: '1px solid #fff',
                            padding: '4px',
                            borderRadius: '0px',
                            fontSize: '0.8rem',
                            width: '60px',
                        }}
                    >
                        {availableRates.length > 0 ? (
                            availableRates.map(rate => (
                                <option key={rate} value={rate}>
                                    {rate}x
                                </option>
                            ))
                        ) : (
                            <>
                                <option value="0.25">0.25x</option>
                                <option value="0.5">0.5x</option>
                                <option value="1">1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </>
                        )}
                    </select>
                </div>
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

                <Switch
                    checked={continuousPlay}
                    styles={{
                        track: {
                            backgroundColor: continuousPlay ? 'gray' : 'black', // ON vs OFF
                            border: continuousPlay ? 'none' : '1px solid white', // white border when OFF
                        },
                        thumb: {
                            backgroundColor: 'white',
                        },
                    }}
                    onChange={e =>
                        dispatchDiscogsRelease({
                            type: 'SET_CONTINUOUS_PLAY',
                            payload: e.currentTarget.checked,
                        })
                    }
                />
            </Group>
        </>
    ) : null;
};

export default Controls;
