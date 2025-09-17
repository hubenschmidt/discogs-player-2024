import React, { useEffect, useRef, useContext, FC } from 'react';
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

const CustomYouTubePlayer: FC<YouTubePlayerProps> = ({ width, height }) => {
    const playerRef = useRef<HTMLDivElement>(null); // keep DOM refs inside the component and not in PlayerContext
    const playerInstance = useRef<any>(null);
    const { dispatchPlayer } = useContext(PlayerContext);
    const { collectionState } = useContext(CollectionContext);
    const { releases } = collectionState;
    const { discogsReleaseState, dispatchDiscogsRelease } = useContext(
        DiscogsReleaseContext,
    );
    const { queue, queueIndex, playbackMode, continuousPlay, selectedVideo } =
        discogsReleaseState;
    const { selectedRelease } = discogsReleaseState;
    console.log(selectedRelease);
    const handleNextRelease = () => {
        if (!selectedRelease || !releases || releases.length === 0) return;
        const currentIndex = releases.findIndex(
            r => r.Release_Id === selectedRelease.Release_Id,
        );
        const nextIndex = (currentIndex + 1) % releases.length;
        const nextRelease = releases[nextIndex];
        dispatchDiscogsRelease({
            type: 'SET_SELECTED_RELEASE',
            payload: nextRelease,
        });
    };

    const handleVideoEnd = () => {
        if (!queue?.length || queueIndex < 0) return;

        const atEnd = queueIndex >= queue.length - 1;
        const inPlaylist = playbackMode === 'playlist';

        // Playlist mode
        if (inPlaylist && atEnd) {
            // Loop playlist; replace with `return;` to stop instead.
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

        // Release mode
        if (atEnd && !continuousPlay) {
            handleNextRelease?.();
            return;
        }

        dispatchDiscogsRelease({ type: 'SET_NEXT_IN_QUEUE' });
    };

    const safeSetVolume = (target: any, volume: number, attempts = 5) => {
        try {
            target?.setVolume(volume);
        } catch (err) {
            if (attempts > 0) {
                setTimeout(
                    () => safeSetVolume(target, volume, attempts - 1),
                    10,
                );
            }
        }
    };

    // Function to create the YouTube player
    const createPlayer = () => {
        if (playerRef.current && selectedVideo.uri) {
            playerInstance.current = new window.YT.Player(playerRef.current, {
                height,
                width,
                videoId: extractYouTubeVideoId(selectedVideo.uri),
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    rel: 0, // prevents showing related videos from other channels
                    iv_load_policy: 3, // <- hide annotations/cards
                    fs: 0, // <- no fullscreen button (optional)
                    disablekb: 1, // <- disable keyboard controls (optional)
                    playsinline: 1, // <- inline playback on mobile
                },
                events: {
                    onReady: (event: any) => {
                        // enable case we need to wait a little to ensure the player is fully ready
                        // setTimeout(() => {
                        dispatchPlayer({
                            type: 'SET_CONTROLS',
                            payload: {
                                // explicitly set some controls from YouTube API.. add more if needed
                                play: () => event.target.playVideo(),
                                pause: () => event.target.pauseVideo(),
                                stop: () => event.target.stopVideo(),
                                setVolume: (volume: number) =>
                                    safeSetVolume(event.target, volume),
                                setPlaybackRate: (rate: number) =>
                                    event.target.setPlaybackRate(rate),
                                getAvailablePlaybackRates: () =>
                                    event.target.getAvailablePlaybackRates(),
                                getCurrentTime: () =>
                                    event.target.getCurrentTime(),
                                seekTo: (seconds: number) =>
                                    event.target.seekTo(seconds, true),
                                videoTitle: event.target.videoTitle,
                            },
                        });
                        dispatchPlayer({
                            type: 'SET_PLAYER_READY',
                            payload: true,
                        });
                        // }, 50);
                    },

                    onStateChange: (event: any) => {
                        // When the video ends (state 0), call onEnd
                        if (event.data === window.YT.PlayerState.ENDED) {
                            handleVideoEnd();
                        }
                    },
                },
            });
        }
    };

    useEffect(() => {
        const next = queue?.[queueIndex];
        if (!next) return;
        if (selectedVideo?.uri !== next?.uri) {
            dispatchDiscogsRelease({
                type: 'SET_SELECTED_VIDEO',
                payload: next,
            });
        }
    }, [queueIndex, queue, selectedVideo?.uri, dispatchDiscogsRelease]);

    useEffect(() => {
        // Check if the YT API is loaded
        if (!window.YT || !window.YT.Player) {
            // Load the YouTube IFrame API script
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.body.appendChild(tag);

            // Set the callback for when the API is ready
            window.onYouTubeIframeAPIReady = () => {
                createPlayer();
            };
        } else {
            createPlayer();
        }

        // Cleanup on unmount
        return () => {
            if (playerInstance.current && playerInstance.current.destroy) {
                playerInstance.current.destroy();
            }
        };
    }, [selectedVideo, width, height]);

    return (
        <div style={{ position: 'relative', width, height }}>
            {/* The YouTube player */}
            <div ref={playerRef} style={{ width: '100%', height: '100%' }} />

            {/* Click-blocking shield */}
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
                    // transparent but intercepts pointer events:
                    background: 'transparent',
                    pointerEvents: 'auto',
                    cursor: 'default',
                }}
            />
        </div>
    );
};

export default CustomYouTubePlayer;
