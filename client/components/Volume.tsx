import React, { useContext } from 'react';
import { PlayerContext } from '../context/playerContext';
import { Slider } from '@mantine/core';

const Volume = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;

    const handleVolumeChange = (value: number) => controls?.setVolume(value);

    return (
        <Slider
            color="orange"
            defaultValue={50}
            min={0}
            max={100}
            onChangeEnd={handleVolumeChange}
            mb="10"
        />
    );
};

export default Volume;
