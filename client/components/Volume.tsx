import React, { useContext, useEffect } from 'react';
import { Slider } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import classes from '../styles/Slider.module.css';

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
            value={volume}
            min={0}
            max={100}
            onChangeEnd={handleVolumeChange}
            mb="8"
            classNames={classes}
        />
    ) : null;
};

export default Volume;
