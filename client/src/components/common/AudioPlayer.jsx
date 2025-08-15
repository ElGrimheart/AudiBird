import React, { useRef, useContext, useEffect } from "react";
import { PlayFill, PauseFill } from "react-bootstrap-icons";
import AudioPlayerContext from "../../contexts/AudioPlayerContext";

// Custom AudioPlayer component with minimal UI for playing audio files
export default function AudioPlayer({ src, audioId }) {
    const audioRef = useRef(null);
    const { playingId, setPlayingId } = useContext(AudioPlayerContext);

    useEffect(() => {
        if (playingId !== audioId && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [playingId, audioId]);

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (playingId === audioId) {
            audioRef.current.pause();
        } else {
            setPlayingId(audioId);
            audioRef.current.play();
        }
    };

    return (
        <span>
            <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={handlePlayPause}
            >
                {playingId === audioId && !audioRef.current?.paused ? (
                    <PauseFill size={20} />
                ) : (
                    <PlayFill size={20} />
                )}
            </button>
            <audio
                ref={audioRef}
                src={src}
                onPlay={() => setPlayingId(audioId)}
                onPause={() => {
                    if (playingId === audioId) setPlayingId(null);
                }}
                style={{ display: "none" }}
            />
        </span>
    );
}