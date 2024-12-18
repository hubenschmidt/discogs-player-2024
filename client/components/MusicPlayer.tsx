import React from 'react';

const MusicPlayer = () => {
    return (
        <div>
            <button className="player-button">⏮</button>
            <button className="player-button">⏯</button>
            <button className="player-button">⏭</button>
            <input
                type="range"
                className="player-slider"
                min="0"
                max="100"
                defaultValue="50"
            />
        </div>
    );
};

export default MusicPlayer;
