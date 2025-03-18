import React, { useContext, useEffect, useState } from 'react';
import { PlayerContext } from '../context/playerContext';
import { ActionIcon, Slider, Group } from '@mantine/core';
import {
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    StopCircle,
} from 'lucide-react';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

const MusicPlayer = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;
    const { dispatchDiscogsRelease, discogsReleaseState } = useContext(
        DiscogsReleaseContext,
    );
    const { selectedVideo } = discogsReleaseState;

    // State to control playback rate select
    const [playbackRate, setPlaybackRate] = useState<string>('1');

    const [availableRates, setAvailableRates] = useState<number[]>([]);

    // When controls become available, fetch the available playback rates
    useEffect(() => {
        if (controls && controls.getAvailablePlaybackRates) {
            const rates = controls.getAvailablePlaybackRates();
            if (rates && Array.isArray(rates) && rates.length > 0) {
                setAvailableRates(rates);
            }
            console.log(rates);
        }
    }, [controls]);

    // Whenever the selected video changes, reset the playback rate to "Normal"
    useEffect(() => {
        setPlaybackRate('1');
    }, [selectedVideo]);

    const handlePlay = () => controls?.play();
    const handlePause = () => controls?.pause();
    const handleStop = () => controls?.stop();
    const handleVolumeChange = (value: number) => controls?.setVolume(value);

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

    return (
        <div>
            <Group>
                <ActionIcon onClick={handlePrevVideo}>
                    <ChevronLeft />
                </ActionIcon>
                <ActionIcon onClick={handleNextVideo}>
                    <ChevronRight />
                </ActionIcon>
                <ActionIcon onClick={handlePlay}>
                    <Play />
                </ActionIcon>
                <ActionIcon onClick={handlePause}>
                    <Pause />
                </ActionIcon>
                <ActionIcon onClick={handleStop}>
                    <StopCircle />
                </ActionIcon>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '20px',
                    }}
                >
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
                                <option value="0.75">0.75x</option>
                                <option value="1">1x</option>
                                <option value="1.25">1.25x</option>
                                <option value="1.5">1.5x</option>
                                <option value="2">2x</option>
                            </>
                        )}
                    </select>
                </div>
                <Slider
                    defaultValue={50}
                    min={0}
                    max={100}
                    onChangeEnd={handleVolumeChange}
                />
            </Group>
        </div>
    );
};

export default MusicPlayer;
