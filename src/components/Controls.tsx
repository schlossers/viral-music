import React from 'react';
import { FaPlay, FaPause, FaCircle, FaStop, FaMobileAlt, FaDesktop } from 'react-icons/fa';

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
        <>
            <button
                className="control-btn"
                onClick={onOrientationToggle}
                disabled={disabled}
                title="Toggle Orientation"
            >
                {orientation === 'vertical' ? <FaMobileAlt /> : <FaDesktop />}
            </button>

            <button
                className="control-btn primary"
                onClick={onPlayPause}
                disabled={disabled}
                title={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '4px' }} />}
            </button>

            <button
                className={`control-btn ${isRecording ? 'recording' : ''}`}
                onClick={onRecordToggle}
                disabled={disabled}
                title={isRecording ? "Stop Recording" : "Start Recording"}
            >
                {isRecording ? <FaStop /> : <FaCircle style={{ fontSize: '0.8em' }} />}
            </button>
        </>
    );
};
