import React from 'react';
import { FaPlay, FaPause, FaVideo, FaStop, FaMobileAlt, FaDesktop } from 'react-icons/fa';

interface ControlsProps {
    isPlaying: boolean;
    isRecording: boolean;
    orientation: 'horizontal' | 'vertical';
    onPlayPause: () => void;
    onRecordToggle: () => void;
    onOrientationToggle: () => void;
    disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    isRecording,
    orientation,
    onPlayPause,
    onRecordToggle,
    onOrientationToggle,
    disabled
}) => {
    return (
        <div className="controls">
            <button
                className="control-btn"
                onClick={onPlayPause}
                disabled={disabled}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
                className={`control-btn ${isRecording ? 'recording' : ''}`}
                onClick={onRecordToggle}
                disabled={disabled}
                title={isRecording ? "Stop Recording" : "Start Recording"}
            >
                {isRecording ? <FaStop /> : <FaVideo />}
            </button>

            <button
                className="control-btn"
                onClick={onOrientationToggle}
                disabled={disabled}
                title="Toggle Orientation"
            >
                {orientation === 'vertical' ? <FaMobileAlt /> : <FaDesktop />}
            </button>
        </div>
    );
};
