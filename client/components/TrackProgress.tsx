import React, { useContext, useEffect, useRef, useState } from 'react';
import { Slider, Group, Text } from '@mantine/core';
import { PlayerContext } from '../context/playerContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import classes from '../styles/Slider.module.css';

const fmt = (s: number) => {
    if (!isFinite(s) || s < 0) s = 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const ss = Math.floor(s % 60);
    return h
        ? `${h}:${m.toString().padStart(2, '0')}:${ss
              .toString()
              .padStart(2, '0')}`
        : `${m}:${ss.toString().padStart(2, '0')}`;
};

const POLL_MS = 250;

const TrackProgress = () => {
    const { playerState } = useContext(PlayerContext);
    const { controls } = playerState;
    const { discogsReleaseState } = useContext(DiscogsReleaseContext);
    const { selectedVideo } = discogsReleaseState;

    const [pos, setPos] = useState(0);
    const [dur, setDur] = useState(0);
    const seekingRef = useRef(false);

    // 1) reset on track change, prefer provided duration
    useEffect(() => {
        if (!selectedVideo) return;

        setPos(0);

        const provided = Number((selectedVideo as any)?.duration) || 0;
        if (provided > 0) {
            setDur(provided);
            return;
        }

        setDur(0);
    }, [selectedVideo]);

    // 2) if no provided duration, try YouTube API duration (no nesting)
    useEffect(() => {
        if (!selectedVideo) return;
        if (Number((selectedVideo as any)?.duration) > 0) return;
        if (!controls?.getDuration) return;

        const first = controls.getDuration?.() || 0;
        if (first > 0) {
            setDur(first);
            return;
        }

        const t = setTimeout(() => {
            const later = controls.getDuration?.() || 0;
            if (later > 0) setDur(later);
        }, 300);

        return () => clearTimeout(t);
    }, [selectedVideo, controls]);

    // 3) poll current time; opportunistically fill duration (no nesting)
    useEffect(() => {
        if (!controls) return;
        if (!selectedVideo) return;

        const tick = () => {
            if (seekingRef.current) return;

            const now = controls.getCurrentTime?.() ?? 0;
            setPos(now);

            if (dur) return;
            if (!controls.getDuration) return;

            const d = controls.getDuration() || 0;
            if (d > 0) setDur(d);
        };

        const id = setInterval(tick, POLL_MS);
        return () => clearInterval(id);
    }, [controls, selectedVideo, dur]);

    if (!selectedVideo) return null;

    const max = dur || Math.max(dur, pos) || 1;
    const value = Math.min(pos, max);

    return (
        <div>
            <Group justify="space-between" mb={4}>
                <Text size="sm" c="dimmed">
                    {fmt(value)}
                </Text>
                <Text size="sm" c="dimmed">
                    {fmt(max)}
                </Text>
            </Group>

            <Slider
                min={0}
                max={max}
                value={value}
                step={0.1}
                label={v => fmt(Number(v))}
                onChange={v => {
                    seekingRef.current = true;
                    setPos(v as number);
                }}
                onChangeEnd={v => {
                    seekingRef.current = false;
                    controls?.seekTo?.(v as number);
                }}
                classNames={classes}
                mb="xs"
            />
        </div>
    );
};

export default TrackProgress;
