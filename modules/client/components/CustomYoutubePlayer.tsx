import React, { useEffect, useRef, useContext, FC } from 'react';
import { Group } from '@mantine/core';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { PlayerContext } from '../context/playerContext';
import { extractYouTubeVideoId } from '../lib/extract-youtube-video-id';

interface YouTubePlayerProps {
    width?: string;
    height?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

const CustomYouTubePlayer: FC<YouTubePlayerProps> = ({
    width = '100%',
    height = '430px',
}) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const playerInstance = useRef<any>(null);

    const { dispatchPlayer } = useContext(PlayerContext);
    const { collectionState } = useContext(CollectionContext);
    const shelfItems = collectionState?.items ?? []; // <- use shelf items

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

    const handleNextRelease = () => {
        // guards
        if (!selectedRelease) return;
        if (!Array.isArray(shelfItems) || !shelfItems.length) return;

        const curId = selectedRelease.Release_Id;
        let i = shelfItems.findIndex(r => r?.Release_Id === curId);
        if (i === -1) i = 0; // fallback if current isn't on this page

        const next = shelfItems[(i + 1) % shelfItems.length];

        // one shot: clear previews, select next release, and on iOS stop autoplay
        dispatchDiscogsRelease({
            type: 'MERGE_STATE',
            payload: {
                previewRelease: null,
                previewDiscogsRelease: null,
                selectedRelease: next,
                ...(isIOS() ? { isPlaying: false } : {}),
            },
        });
    };

    const pauseIOS = () => {
        if (!isIOS()) return;
        dispatchDiscogsRelease({
            type: 'MERGE_STATE',
            payload: { isPlaying: false },
        });
    };

    const handleVideoEnd = () => {
        if (!queue?.length || queueIndex < 0) return;

        const atEnd = queueIndex >= queue.length - 1;
        const inPlaylist = playbackMode === 'playlist';

        // playlist: wrap to start
        if (inPlaylist && atEnd) {
            dispatchDiscogsRelease({
                type: 'SET_PLAYBACK_QUEUE',
                payload: { items: queue, startIndex: 0, mode: 'playlist' },
            });
            pauseIOS();
            return;
        }

        // playlist: advance within queue
        if (inPlaylist) {
            dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
            return;
        }

        // release mode: hit end and not looping → go to next release on shelf
        if (atEnd && !continuousPlay) {
            handleNextRelease(); // this already clears preview + does iOS pause logic
            return;
        }

        // release mode: advance within release queue
        dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
        pauseIOS();
    };

    const safeSetVolume = (t: any, v: number, n = 5) => {
        try {
            t?.setVolume(v);
        } catch {
            if (n > 0) setTimeout(() => safeSetVolume(t, v, n - 1), 10);
        }
    };

    const ensureIframeAttributes = async (target: any) => {
        // 🔧 add allow + playsinline on the real iframe
        try {
            const iframe: HTMLIFrameElement = await target.getIframe();
            if (iframe) {
                iframe.setAttribute('playsinline', '1');
                iframe.setAttribute('webkit-playsinline', '1');

                const allow = new Set(
                    (iframe.getAttribute('allow') || '')
                        .split(';')
                        .map(s => s.trim())
                        .filter(Boolean),
                );
                allow.add('autoplay');
                allow.add('encrypted-media');
                iframe.setAttribute('allow', Array.from(allow).join('; '));
            }
        } catch {}
    };

    const createPlayer = () => {
        if (!playerRef.current || !selectedVideo?.uri) return;

        playerInstance.current = new window.YT.Player(playerRef.current, {
            height,
            width,
            videoId: extractYouTubeVideoId(selectedVideo.uri),
            playerVars: {
                autoplay: isIOS() ? 0 : 1, // ✅ desktop autoplays, iOS does not
                controls: 0,
                rel: 0,
                iv_load_policy: 3,
                fs: 0,
                disablekb: 1,
                playsinline: 1,
            },
            events: {
                onReady: async (e: any) => {
                    // make sure iframe allows autoplay + inline
                    await ensureIframeAttributes(e.target);

                    // expose player controls to your PlayerContext
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

                    const isiOS = isIOS();

                    if (!isiOS) {
                        // Desktop: go ahead and autoplay
                        e.target.playVideo();
                        return;
                    }
                },
                onStateChange: (e: any) => {
                    if (e.data === window.YT.PlayerState.ENDED) {
                        handleVideoEnd();
                    }
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

    const iosShieldStyle: React.CSSProperties = isIOS()
        ? { pointerEvents: 'none' } // 🔧 let first tap reach page/iframe on iOS
        : { pointerEvents: 'auto' };

    return (
        <div style={{ width }}>
            <Group
                justify="space-between"
                align="center"
                px="xs"
                py={4}
                style={{ background: 'transparent' }}
            />
            <div
                style={{
                    width: '100%',
                    height: '430px',
                    overflow: 'hidden',
                    transition: 'height 200ms ease',
                    position: 'relative',
                }}
            >
                <div
                    ref={playerRef}
                    style={{ width: '100%', height: '100%' }}
                />

                {/* Click-blocking shield (disable on iOS so the first gesture works) */}
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
                        cursor: 'default',
                        ...iosShieldStyle, // 🔧
                    }}
                />
            </div>
        </div>
    );
};

export default CustomYouTubePlayer;
