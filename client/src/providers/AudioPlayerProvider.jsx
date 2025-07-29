import React, { useState } from 'react';
import AudioPlayerContext from '../contexts/AudioPlayerContext';

// AudioPlayerProvider component to manage audio player state
const AudioPlayerProvider = ({ children }) => {
    const [playingId, setPlayingId] = useState(null);
    return (
        <AudioPlayerContext.Provider value={{ playingId, setPlayingId }}>
            {children}
        </AudioPlayerContext.Provider>
    );
};

export default AudioPlayerProvider;