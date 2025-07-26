import React, { useEffect, useRef, useContext } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DashboardCard from "./DashboardCard";
import SocketContext from "../../contexts/SocketContext";
import { Spinner } from "react-bootstrap";

// MicStreamCard component to play the live audio stream from the microphone
const MicStreamCard = ({ onPlay, onPause, isPlaying, loading, error }) => {

    const { socketRef, isConnected } = useContext(SocketContext);
    const socket = socketRef?.current;
    const audioContextRef = useRef(null);
    const bufferQueueRef = useRef([]); 
    const isPlayingRef = useRef(isPlaying);

    const renderSkeleton = () => {
        return (
            <div>
                <div className="text-center mb-3">
                    <Spinner animation="border" role="status" variant="primary">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
                <div className="d-flex justify-content-center">
                    <Skeleton width={80} height={40} className="me-2" />
                    <Skeleton width={80} height={40} />
                </div>
            </div>
        );
    };

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        if (!socket || !isConnected) return;

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
            }, 20); // Try to play a chunk every 20ms
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
    }, [socket, isPlaying, isConnected]);

    return (
        <DashboardCard title="Station Stream">
            {error && (
                <div className="alert alert-danger">
                    {error.message || "Error connecting to audio stream"}
                </div>
            )}
            
            {loading ? renderSkeleton() : (
                !socket || !isConnected ? (
                    <div className="alert alert-warning">
                        Waiting for connection to station...
                    </div>
                ) : (
                    <div className="mt-2">
                        <button 
                            className="btn btn-primary" 
                            onClick={onPlay} 
                            disabled={isPlaying || !isConnected}
                        >
                            Play
                        </button>
                        <button 
                            className="btn btn-secondary ms-2" 
                            onClick={onPause} 
                            disabled={!isPlaying || !isConnected}
                        >
                            Pause
                        </button>
                    </div>
                )
            )}
        </DashboardCard>
    );
};

export default MicStreamCard;