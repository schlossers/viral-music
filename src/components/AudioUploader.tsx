import React, { useState, useCallback } from 'react';
import { FaCloudUploadAlt, FaMusic } from 'react-icons/fa';

interface AudioUploaderProps {
    onFileSelect: (file: File) => void;
    isAnalyzing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect, isAnalyzing }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAnalyzing) {
            setIsDragActive(true);
        }
    }, [isAnalyzing]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (isAnalyzing) return;

        const file = e.dataTransfer.files?.[0];
        if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
            onFileSelect(file);
        }
    }, [isAnalyzing, onFileSelect]);

    return (
        <div
            className={`audio-uploader ${isDragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isAnalyzing && document.getElementById('audio-upload')?.click()}
        >
            <div className="upload-icon">
                {isDragActive ? <FaMusic /> : <FaCloudUploadAlt />}
            </div>

            <div>
                <h3 className="upload-title">
                    {isAnalyzing ? 'Analyzing Audio...' : 'Upload Music File'}
                </h3>
                <p className="upload-hint">
                    {isDragActive
                        ? 'Drop the beat here!'
                        : 'Drag & drop an MP3/WAV file, or click to browse'}
                </p>
            </div>

            <input
                id="audio-upload"
                type="file"
                accept="audio/mp3,audio/wav,audio/mpeg"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                style={{ display: 'none' }}
            />
        </div>
    );
};
