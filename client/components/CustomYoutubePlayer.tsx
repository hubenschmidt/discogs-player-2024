import React, { useEffect, useRef, FC } from 'react';

interface YouTubePlayerProps {
    videoId: string;
    onEnd: () => void;
    width?: string;
    height?: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

const CustomYouTubePlayer: FC<YouTubePlayerProps> = ({
    videoId,
    onEnd,
    width = '100%',
    height = '450',
}) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const playerInstance = useRef<any>(null);

    useEffect(() => {
        // Function to create the YouTube player
        const createPlayer = () => {
            if (playerRef.current) {
                playerInstance.current = new window.YT.Player(
                    playerRef.current,
                    {
                        height,
                        width,
                        videoId,
                        playerVars: {
                            autoplay: 1,
                            controls: 1,
                        },
                        events: {
                            onStateChange: (event: any) => {
                                // When the video ends (state 0), call onEnd
                                if (
                                    event.data === window.YT.PlayerState.ENDED
                                ) {
                                    onEnd();
                                }
                            },
                        },
                    },
                );
            }
        };

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
    }, [videoId, onEnd, width, height]);

    return <div ref={playerRef} />;
};

export default CustomYouTubePlayer;
