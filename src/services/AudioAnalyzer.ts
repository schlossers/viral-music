import { OnsetsAndFrames } from '@magenta/music/es6/transcription';

export interface NoteEvent {
    startTime: number;
    endTime: number;
    pitch: number;
    velocity: number;
}

export class AudioAnalyzer {
    private model: OnsetsAndFrames;
    private isInitialized: boolean = false;

    constructor() {
        // Initialize the model
        // We use the 'https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni' checkpoint by default in the library
        this.model = new OnsetsAndFrames('https://storage.googleapis.com/magentadata/js/checkpoints/transcription/onsets_frames_uni');
    }

    async initialize() {
        if (!this.isInitialized) {
            await this.model.initialize();
            this.isInitialized = true;
        }
    }

    async analyze(audioBlob: Blob): Promise<NoteEvent[]> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        // Convert Blob to AudioBuffer
        const audioContext = new AudioContext();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Transcribe
        const noteSequence = await this.model.transcribeFromAudioBuffer(audioBuffer);

        if (!noteSequence || !noteSequence.notes) {
            return [];
        }

        // Convert NoteSequence to our NoteEvent format
        return noteSequence.notes.map(note => ({
            startTime: note.startTime || 0,
            endTime: note.endTime || 0,
            pitch: note.pitch || 0,
            velocity: note.velocity || 80
        }));
    }
}

export const audioAnalyzer = new AudioAnalyzer();
