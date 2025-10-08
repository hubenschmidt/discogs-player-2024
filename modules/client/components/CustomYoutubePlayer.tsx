import React, { useEffect, useRef, useContext, useState, FC } from 'react';
import { Group } from '@mantine/core';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlayerContext } from '../context/playerContext';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';

interface YouTubePlayerProps {
    width?: string;
    height?: string; // e.g. "430px"
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const CustomYouTubePlayer: FC<YouTubePlayerProps> = ({
    width = '100%',
    height = '430px',
}) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const playerInstance = useRef<any>(null);

    const { dispatchPlayer } = useContext(PlayerContext);
    const { collectionState } = useContext(CollectionContext);
    const { releases } = collectionState;

    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const {
        queue,
        queueIndex,
        playbackMode,
        continuousPlay,
        selectedVideo,
        selectedRelease,
    } = discogsReleaseState;

    // collapsed by default
    const [collapsed, setCollapsed] = useState(true);

    const handleNextRelease = () => {
        if (!selectedRelease || !releases?.length) return;
        const i = releases.findIndex(
            r => r.Release_Id === selectedRelease.Release_Id,
        );
        const next = releases[(i + 1) % releases.length];
        dispatchDiscogsRelease({ type: 'SET_SELECTED_RELEASE', payload: next });
    };

    const handleVideoEnd = () => {
        if (!queue?.length || queueIndex < 0) return;
        const atEnd = queueIndex >= queue.length - 1;
        const inPlaylist = playbackMode === 'playlist';

        if (inPlaylist && atEnd) {
            dispatchDiscogsRelease({
                type: 'SET_PLAYBACK_QUEUE',
                payload: { items: queue, startIndex: 0, mode: 'playlist' },
            });
            return;
        }
        if (inPlaylist) {
            dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
            return;
        }
        if (atEnd && !continuousPlay) {
            handleNextRelease();
            return;
        }
        dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
    };

    const safeSetVolume = (t: any, v: number, n = 5) => {
        try {
            t?.setVolume(v);
        } catch {
            if (n > 0) setTimeout(() => safeSetVolume(t, v, n - 1), 10);
        }
    };

    const createPlayer = () => {
        if (!playerRef.current || !selectedVideo?.uri) return;
        playerInstance.current = new window.YT.Player(playerRef.current, {
            height,
            width,
            videoId: extractYouTubeVideoId(selectedVideo.uri),
            playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                iv_load_policy: 3,
                fs: 0,
                disablekb: 1,
                playsinline: 1,
            },
            events: {
                onReady: (e: any) => {
                    dispatchPlayer({
                        type: 'SET_CONTROLS',
                        payload: {
                            play: () => e.target.playVideo(),
                            pause: () => e.target.pauseVideo(),
                            stop: () => e.target.stopVideo(),
                            setVolume: (v: number) =>
                                safeSetVolume(e.target, v),
                            setPlaybackRate: (r: number) =>
                                e.target.setPlaybackRate(r),
                            getAvailablePlaybackRates: () =>
                                e.target.getAvailablePlaybackRates(),
                            getCurrentTime: () => e.target.getCurrentTime(),
                            seekTo: (s: number) => e.target.seekTo(s, true),
                            videoTitle: e.target.videoTitle,
                            getDuration: () => e.target.getDuration(),
                        },
                    });
                    dispatchPlayer({ type: 'SET_PLAYER_READY', payload: true });
                },
                onStateChange: (e: any) => {
                    if (e.data === window.YT.PlayerState.ENDED)
                        handleVideoEnd();
                },
            },
        });
    };

    // keep selectedVideo in sync with queue index
    useEffect(() => {
        const next = queue?.[queueIndex];
        if (next && selectedVideo?.uri !== next?.uri) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: next,
            });
        }
    }, [queueIndex, queue, selectedVideo?.uri, dispatchDiscogsRelease]);

    // load YT api & create player
    useEffect(() => {
        if (!window.YT || !window.YT.Player) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);
            window.onYouTubeIframeAPIReady = () => createPlayer();
        } else {
            createPlayer();
        }
        return () => playerInstance.current?.destroy?.();
    }, [selectedVideo, width, height]);

    return (
        <div style={{ width }}>
            {/* Header bar with chevron (always visible) */}
            <Group
                justify="space-between"
                align="center"
                px="xs"
                py={4}
                style={{
                    background: 'transparent',
                }}
            ></Group>
            <div
                style={{
                    width: '100%',
                    height: '430px',
                    overflow: 'hidden',
                    transition: 'height 200ms ease',
                    position: 'relative',
                }}
            >
                {/* The YouTube player */}
                <div
                    ref={playerRef}
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Click-blocking shield  */}
                <div
                    aria-hidden="true"
                    tabIndex={-1}
                    onClick={e => e.stopPropagation()}
                    onMouseDown={e => e.preventDefault()}
                    onContextMenu={e => e.preventDefault()}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        background: 'transparent',
                        pointerEvents: 'auto',
                        cursor: 'default',
                    }}
                />
            </div>
        </div>
    );
};

export default CustomYouTubePlayer;
