import React from "react";
import DashboardCard from "./DashboardCard";

const AudioPlayerCard = ({ audioUrl, onPlay, onPause, isPlaying }) => {
    return (
        <DashboardCard title="Station Stream">
            <audio controls src={audioUrl} onPlay={onPlay} onPause={onPause} />
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
}

export default AudioPlayerCard;