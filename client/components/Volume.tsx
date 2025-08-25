import React, { useContext, useEffect } from 'react';
import { Slider } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';

const Volume = () => {
    const { playerState, dispatchPlayer } = useContext(PlayerContext);
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { controls, volume } = playerState;
    const { selectedVideo } = discogsReleaseState;

    useEffect(() => {
        if (controls) {
            controls.setVolume(volume);
        }
    }, [selectedVideo, controls]);

    const handleVolumeChange = (value: number) => {
        dispatchPlayer({ type: 'SET_VOLUME', payload: value });
        controls?.setVolume(value);
    };

    return selectedVideo ? (
        <Slider
            color="orange"
            value={volume}
            min={0}
            max={100}
            onChangeEnd={handleVolumeChange}
            mb="10"
        />
    ) : null;
};

export default Volume;
