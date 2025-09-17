import React, { useContext, useEffect, useRef, useState } from 'react';
import { Slider, Group, Text } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import classes from '../styles/Slider.module.css';

const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss.toString().padStart(2, '0')}`;
};

const POLL_MS = 250;

const TrackProgress = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;

    const [pos, setPos] = useState(0); // seconds
    const [dur, setDur] = useState<number>(0); // seconds
    const seekingRef = useRef(false);

    // When the track changes, reset progress and (re)derive duration.
    useEffect(() => {
        if (!selectedVideo) return;
        setPos(0);
        // prefer backend-provided duration if present; else ask the player
        const dv = Number((selectedVideo as any)?.duration) || 0;
        if (dv > 0) {
            setDur(dv);
        } else if (controls?.getDuration) {
            // sometimes YT returns 0 right away; try once after a tick
            const d = controls.getDuration() || 0;
            if (d > 0) {
                setDur(d);
            } else {
                setTimeout(() => setDur(controls.getDuration() || 0), 300);
            }
        } else {
            setDur(0);
        }
    }, [selectedVideo, controls]);

    // Poll current time
    useEffect(() => {
        if (!controls || !selectedVideo) return;
        const id = setInterval(() => {
            if (seekingRef.current) return; // don't fight the user while dragging
            const t = controls.getCurrentTime?.() ?? 0;
            setPos(t);
            // if duration was unknown, try to learn it lazily
            if (!dur && controls.getDuration) {
                const d = controls.getDuration() || 0;
                if (d > 0) setDur(d);
            }
        }, POLL_MS);
        return () => clearInterval(id);
    }, [controls, selectedVideo, dur]);

    if (!selectedVideo) return null;

    const clampedDur = dur > 0 ? dur : Math.max(dur, pos); // never let max < value

    return (
        <div>
            <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">
                    {fmt(pos)}
                </Text>
                <Text size="sm" c="dimmed">
                    {fmt(clampedDur)}
                </Text>
            </Group>

            <Slider
                min={0}
                max={clampedDur || 1}
                value={Math.min(pos, clampedDur || 1)}
                onChange={v => {
                    // live-preview while dragging
                    seekingRef.current = true;
                    setPos(v as number);
                }}
                onChangeEnd={v => {
                    seekingRef.current = false;
                    controls?.seekTo?.(v as number);
                }}
                classNames={classes} // reuse your volume slider styles
                mb="xs"
            />
        </div>
    );
};

export default TrackProgress;
