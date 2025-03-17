import React, { useContext } from 'react';
import { PlayerContext } from '../context/playerContext';
import { ActionIcon, Slider, Group } from '@mantine/core';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const MusicPlayer = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

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

    return (
        <div>
            <Group>
                <ActionIcon onClick={handleStop}>
                    <ChevronLeft />
                </ActionIcon>
                <ActionIcon onClick={handlePlay}>
                    <Play />
                </ActionIcon>
                <ActionIcon onClick={handlePause}>
                    <Pause />
                </ActionIcon>
                <ActionIcon onClick={handleStop}>
                    <ChevronRight />
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
