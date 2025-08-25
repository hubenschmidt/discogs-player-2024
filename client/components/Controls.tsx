import React, { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../context/playerContext';
import { ActionIcon, Group } from '@mantine/core';
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    StopCircle,
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
    const { selectedVideo } = discogsReleaseState;
    const [playbackRate, setPlaybackRate] = useState('1');
    const [availableRates, setAvailableRates] = useState<number[]>([]);
    const [isPlaying, setIsPlaying] = useState(true);

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
        setIsPlaying(true);
    };

    const handlePause = () => {
        controls?.pause();
        setIsPlaying(false);
    };

    const handleStop = () => {
        controls?.stop();
        setIsPlaying(false);
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
        dispatchDiscogsRelease({ type: 'SET_NEXT_VIDEO' });
    };

    const handlePrevVideo = () => {
        dispatchDiscogsRelease({ type: 'SET_PREV_VIDEO' });
    };

    return selectedVideo ? (
        <>
            {/* Slider wrapped in a container to push it to the right */}
            <Group style={{ flexWrap: 'nowrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label
                        style={{
                            color: '#fff',
                            marginRight: '5px',
                            fontSize: '0.8rem',
                        }}
                    >
                        Speed:
                    </label>
                    <select
                        value={playbackRate}
                        onChange={e => handlePlaybackRateChange(e.target.value)}
                        style={{
                            backgroundColor: '#222',
                            color: '#fff',
                            border: '1px solid #fff',
                            padding: '4px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
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
                                <option value="1">Normal</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </>
                        )}
                    </select>
                </div>
                <ActionIcon color="blue" onClick={handleRewind}>
                    <Rewind />
                </ActionIcon>
                <ActionIcon color="blue" onClick={handlePrevVideo}>
                    <ChevronLeft />
                </ActionIcon>

                {isPlaying ? (
                    <ActionIcon color="blue" onClick={handlePause}>
                        <Pause />
                    </ActionIcon>
                ) : (
                    <ActionIcon color="blue" onClick={handlePlay}>
                        <Play />
                    </ActionIcon>
                )}
                <ActionIcon color="blue" onClick={handleStop}>
                    <StopCircle />
                </ActionIcon>
                <ActionIcon color="blue" onClick={handleNextVideo}>
                    <ChevronRight />
                </ActionIcon>

                <ActionIcon color="blue" onClick={handleFastForward}>
                    <FastForward />
                </ActionIcon>
            </Group>
        </>
    ) : null;
};

export default Controls;
