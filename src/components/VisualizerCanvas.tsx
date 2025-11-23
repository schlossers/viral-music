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

            // Clear with new dark theme background
            ctx.fillStyle = '#0f172a'; // --bg-dark
            ctx.fillRect(0, 0, width, height);

            // Calculate dimensions
            // Always map keys to the width, regardless of orientation
            // The orientation prop now controls the container aspect ratio via CSS
            const keyWidth = width / PIANO_KEYS;
            const pianoHeight = height * 0.15; // 15% for piano

            const timeWindow = 4; // seconds to fall
            const fallSpeed = (height - pianoHeight) / timeWindow; // pixels per second

            notes.forEach(note => {
                // We want to show notes that started recently
                const timeSinceStart = currentTime - note.startTime;

                if (timeSinceStart >= 0 && timeSinceStart < timeWindow + 2) {
                    // Calculate X position based on pitch
                    const keyIndex = note.pitch - START_NOTE;
                    const x = keyIndex * keyWidth;
                    const y = pianoHeight + (timeSinceStart * fallSpeed);

                    // Draw Ball
                    // OPTIMIZATION: Removed shadowBlur as it causes severe performance drops
                    // Use a radial gradient to simulate glow efficiently
                    const hue = (note.pitch * 10) % 360;
                    const radius = keyWidth / 2 * 0.8;

                    // Only draw if visible
                    if (y > -radius && y < height + radius) {
                        ctx.beginPath();
                        ctx.arc(x + keyWidth / 2, y, radius, 0, Math.PI * 2);
                        ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
                        ctx.fill();

                        // Draw Note Name text (only if large enough)
                        if (radius > 8) {
                            ctx.fillStyle = '#fff';
                            ctx.font = `bold ${Math.floor(radius)}px Inter, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(getNoteName(note.pitch), x + keyWidth / 2, y);
                        }
                    }
                }
            });

            // Draw Piano Overlay (at top)
            const pianoGradient = ctx.createLinearGradient(0, 0, 0, pianoHeight);
            pianoGradient.addColorStop(0, '#1e293b');
            pianoGradient.addColorStop(1, '#0f172a');
            ctx.fillStyle = pianoGradient;
            ctx.fillRect(0, 0, width, pianoHeight);

            for (let i = 0; i < PIANO_KEYS; i++) {
                const x = i * keyWidth;
                const note = START_NOTE + i;
                const isWhite = isWhiteKey(note);

                if (isWhite) {
                    ctx.fillStyle = '#e2e8f0'; // Off-white
                } else {
                    ctx.fillStyle = '#1e293b'; // Dark slate
                }

                ctx.fillRect(x, 0, keyWidth, pianoHeight);
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, 0, keyWidth, pianoHeight);

                // Highlight active keys
                const isActive = notes.some(n =>
                    n.pitch === note &&
                    currentTime >= n.startTime &&
                    currentTime < n.endTime
                );

                if (isActive) {
                    const hue = (note * 10) % 360;
                    ctx.fillStyle = `hsla(${hue}, 90%, 60%, 0.8)`;
                    ctx.fillRect(x, 0, keyWidth, pianoHeight);
                    // Minimal glow for active keys is okay as it's just a few rects
                }
            }

            animationId = requestAnimationFrame(render);
        };

        let animationId = requestAnimationFrame(render);
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
