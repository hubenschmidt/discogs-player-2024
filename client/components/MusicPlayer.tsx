import React, { useContext } from 'react';
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
    const { dispatchDiscogsRelease } = useContext(DiscogsReleaseContext);

    const handlePlay = () => {
        controls?.play();
    };

    const handlePause = () => {
        controls?.pause();
    };

    const handleStop = () => {
        controls?.stop();
    };

    const handleVolumeChange = (value: number) => {
        controls?.setVolume(value);
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
            </Group>
            <Slider
                defaultValue={50}
                min={0}
                max={100}
                onChangeEnd={handleVolumeChange}
            />
        </div>
    );
};

export default MusicPlayer;
