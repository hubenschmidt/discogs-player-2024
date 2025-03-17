import React, { useEffect, useRef, useContext, FC } from 'react';
import { CollectionContext } from '../context/collectionContext';
import { DiscogsReleaseContext } from '../context/discogsReleaseContext';
import { ReleaseContext } from '../context/releaseContext';
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
    const { selectedDiscogsRelease, continuousPlay, selectedVideo } =
        discogsReleaseState;
    const { releaseState, dispatchRelease } = useContext(ReleaseContext);
    const { selectedRelease } = releaseState;

    const handleNextRelease = () => {
        if (!selectedRelease || !releases || releases.length === 0) return;
        const currentIndex = releases.findIndex(
            r => r.Release_Id === selectedRelease.Release_Id,
        );
        const nextIndex = (currentIndex + 1) % releases.length;
        const nextRelease = releases[nextIndex];
        dispatchRelease({ type: 'SET_SELECTED_RELEASE', payload: nextRelease });
    };

    const handleVideoEnd = () => {
        if (
            !selectedDiscogsRelease ||
            !selectedDiscogsRelease.videos ||
            selectedDiscogsRelease.videos.length === 0
        )
            return;

        // If not at the last video, dispatch NEXT_VIDEO
        dispatchDiscogsRelease({ type: 'SET_NEXT_VIDEO' });

        // If continuous play is enabled, trigger it
        if (continuousPlay) {
            handleNextRelease();
            return;
        }
    };

    // Function to create the YouTube player
    const createPlayer = () => {
        if (playerRef.current) {
            playerInstance.current = new window.YT.Player(playerRef.current, {
                height,
                width,
                videoId: selectedVideo,
                playerVars: {
                    autoplay: 1,
                    controls: 1,
                },
                events: {
                    onStateChange: (event: any) => {
                        // When the video ends (state 0), call onEnd
                        if (event.data === window.YT.PlayerState.ENDED) {
                            handleVideoEnd();
                        }
                    },
                },
            });
        }

        dispatchPlayer({
            type: 'SET_CONTROLS',
            payload: {
                play: () => playerInstance.current.playVideo(),
                pause: () => playerInstance.current.pauseVideo(),
                stop: () => playerInstance.current.stopVideo(),
                setVolume: (volume: number) =>
                    playerInstance.current.setVolume(volume),
            },
        });
    };

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

    return <div ref={playerRef} />;
};

export default CustomYouTubePlayer;
