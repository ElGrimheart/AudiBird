import React, { useEffect, useRef, useContext } from "react";
import DashboardCard from "./DashboardCard";
import SocketContext from "../../contexts/SocketContext";

// MicStreamCard component to play the live audio stream from the microphone
const MicStreamCard = ({ onPlay, onPause, isPlaying }) => {
    const socketRef = useContext(SocketContext);
    const socket = socketRef.current;
    const audioContextRef = useRef(null);
    const bufferQueueRef = useRef([]); 
    const isPlayingRef = useRef(isPlaying);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (!socket) return;

        if (isPlaying && !audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 48000 });
            console.log("AudioContext created");
        }

        // Add chunk to buffer queue
        const handleChunk = (chunk) => {
            bufferQueueRef.current.push(chunk);
        };

        socket.on("mic-audio-chunk", handleChunk);

        // Playback loop
        let playbackInterval;
        if (isPlaying) {
            playbackInterval = setInterval(() => {
                if (
                    audioContextRef.current &&
                    bufferQueueRef.current.length > 0 &&
                    isPlayingRef.current
                ) {
                    const chunk = bufferQueueRef.current.shift();
                    try {
                        const int16Array = new Int16Array(chunk);
                        const floatArray = new Float32Array(int16Array.length);
                        for (let i = 0; i < int16Array.length; i++) {
                            floatArray[i] = int16Array[i] / 32768;
                        }
                        const audioBuffer = audioContextRef.current.createBuffer(
                            1,
                            floatArray.length,
                            48000
                        );
                        audioBuffer.getChannelData(0).set(floatArray);
                        const source = audioContextRef.current.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(audioContextRef.current.destination);
                        source.start(audioContextRef.current.currentTime);
                        console.log("Played buffered audio chunk");
                    } catch (err) {
                        console.error("Error playing buffered audio chunk:", err);
                    }
                }
            }, 20); // Try to play a chunk every 20ms (adjust as needed)
        }

        return () => {
            socket.off("mic-audio-chunk", handleChunk);
            if (playbackInterval) clearInterval(playbackInterval);
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
                console.log("AudioContext closed");
            }
            bufferQueueRef.current = [];
        };
    }, [socket, isPlaying]);

    return (
        <DashboardCard title="Station Stream">
            <div className="mt-2">
                <button className="btn btn-primary" onClick={onPlay} disabled={isPlaying}>
                    Play
                </button>
                <button className="btn btn-secondary ms-2" onClick={onPause} disabled={!isPlaying}>
                    Pause
                </button>
            </div>
        </DashboardCard>
    );
};

export default MicStreamCard;