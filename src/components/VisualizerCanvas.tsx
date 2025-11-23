import React, { useRef, useEffect } from 'react';
import type { NoteEvent } from '../services/AudioAnalyzer';

interface VisualizerCanvasProps {
    notes: NoteEvent[];
    isPlaying: boolean;
    currentTime: number; // In seconds
    orientation: 'horizontal' | 'vertical';
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
    notes,
    isPlaying,
    currentTime,
    orientation
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Constants
    const PIANO_KEYS = 88;
    const START_NOTE = 21; // A0

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas
        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // Render function
        const render = () => {
            const width = canvas.width;
            const height = canvas.height;

            // Clear
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, width, height);

            // Calculate dimensions
            // We need to map 88 keys to the width (or height if vertical)
            const isVertical = orientation === 'vertical';
            const longSide = isVertical ? height : width;
            const shortSide = isVertical ? width : height;

            const keyWidth = longSide / PIANO_KEYS;

            const pianoHeight = shortSide * 0.15; // 15% for piano

            const timeWindow = 4; // seconds to fall
            const fallSpeed = (shortSide - pianoHeight) / timeWindow; // pixels per second

            notes.forEach(note => {
                // We want to show notes that started recently
                const timeSinceStart = currentTime - note.startTime;

                if (timeSinceStart >= 0 && timeSinceStart < timeWindow + 2) {
                    // Calculate X position based on pitch
                    const keyIndex = note.pitch - START_NOTE;
                    const x = keyIndex * keyWidth;
                    const y = pianoHeight + (timeSinceStart * fallSpeed);

                    // Draw Ball
                    ctx.fillStyle = `hsl(${note.pitch * 10}, 70%, 60%)`;
                    ctx.beginPath();
                    const radius = keyWidth / 2 * 0.8;
                    ctx.arc(x + keyWidth / 2, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw Note Name text
                    if (radius > 5) {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${Math.floor(radius)}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(getNoteName(note.pitch), x + keyWidth / 2, y);
                    }
                }
            });

            // Draw Piano Overlay (at top)
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, width, pianoHeight);

            for (let i = 0; i < PIANO_KEYS; i++) {
                const x = i * keyWidth;
                const note = START_NOTE + i;
                const isWhite = isWhiteKey(note);

                ctx.fillStyle = isWhite ? '#fff' : '#000';
                ctx.fillRect(x, 0, keyWidth, pianoHeight);
                ctx.strokeRect(x, 0, keyWidth, pianoHeight);

                // Highlight active keys
                const isActive = notes.some(n =>
                    n.pitch === note &&
                    currentTime >= n.startTime &&
                    currentTime < n.endTime
                );

                if (isActive) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.fillRect(x, 0, keyWidth, pianoHeight);
                }
            }
        };

        const animationId = requestAnimationFrame(render);
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [notes, isPlaying, currentTime, orientation]);

    return <canvas ref={canvasRef} className="visualizer-canvas" />;
};

function isWhiteKey(midi: number): boolean {
    const note = midi % 12;
    return [0, 2, 4, 5, 7, 9, 11].includes(note);
}

function getNoteName(midi: number): string {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return notes[midi % 12];
}
