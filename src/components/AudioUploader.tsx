import React from 'react';
// Actually, standard input is fine for MVP, but drag and drop is nicer.
// I'll stick to standard input first to avoid extra deps unless I add it.
// Let's add it, it's standard. I'll add it to the install command next time or just use standard input.
// I'll use standard input for now to keep it simple.

interface AudioUploaderProps {
    onFileSelect: (file: File) => void;
    isAnalyzing: boolean;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({ onFileSelect, isAnalyzing }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
        }
    };

    return (
        <div className="audio-uploader">
            <label htmlFor="audio-upload" className="upload-btn">
                {isAnalyzing ? 'Analyzing...' : 'Upload MP3/WAV'}
            </label>
            <input
                id="audio-upload"
                type="file"
                accept="audio/mp3,audio/wav,audio/mpeg"
                onChange={handleFileChange}
                disabled={isAnalyzing}
                style={{ display: 'none' }}
            />
            <p className="upload-hint">Select a music file to visualize</p>
        </div>
    );
};
