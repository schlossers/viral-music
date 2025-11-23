import { useState, useRef, useEffect } from 'react';
import { AudioUploader } from './components/AudioUploader';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { Controls } from './components/Controls';
import { audioAnalyzer, type NoteEvent } from './services/AudioAnalyzer';
import './index.css';

function App() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<NoteEvent[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isRecording, setIsRecording] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleFileSelect = async (file: File) => {
    setAudioFile(file);
    setIsAnalyzing(true);
    setIsPlaying(false);

    try {
      // Create object URL for playback
      if (audioRef.current) {
        audioRef.current.src = URL.createObjectURL(file);
      }

      // Analyze
      // Note: Real progress events aren't available from the library yet,
      // so we use an indeterminate loading state.
      const analyzedNotes = await audioAnalyzer.analyze(file);
      setNotes(analyzedNotes);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Failed to analyze audio. Please try another file.");
      setAudioFile(null); // Reset on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const stream = canvas.captureStream(30); // 30 FPS

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'piano-visualization.webm';
        a.click();
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  // Sync audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  return (
    <div className={`app-container ${orientation}`}>
      <header>
        <h1>Viral Music</h1>
        {/* Placeholder for future nav items or user profile */}
      </header>

      <main>
        {!audioFile ? (
          <AudioUploader onFileSelect={handleFileSelect} isAnalyzing={isAnalyzing} />
        ) : (
          <div className="visualizer-container">
            {isAnalyzing ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <h2>Analyzing Audio...</h2>
                <p>This may take a moment depending on the file size.</p>
              </div>
            ) : (
              <>
                <VisualizerCanvas
                  notes={notes}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  orientation={orientation}
                />
                <div className="controls-dock">
                  <Controls
                    isPlaying={isPlaying}
                    isRecording={isRecording}
                    orientation={orientation}
                    onPlayPause={togglePlayPause}
                    onRecordToggle={toggleRecording}
                    onOrientationToggle={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
                    disabled={isAnalyzing}
                  />
                </div>
              </>
            )}
          </div>
        )}

        <audio ref={audioRef} style={{ display: 'none' }} />
      </main>
    </div>
  );
}

export default App;
