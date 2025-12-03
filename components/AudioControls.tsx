
import React, { useState, useEffect } from 'react';

interface AudioControlsProps {
  isInput?: boolean;
  onTranscript?: (text: string) => void;
  text?: string; // For TTS
}

const AudioControls: React.FC<AudioControlsProps> = ({ isInput, onTranscript, text }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [support, setSupport] = useState({ stt: false, tts: false });

  useEffect(() => {
    setSupport({
      stt: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
      tts: 'speechSynthesis' in window
    });
  }, []);

  const handleToggleListen = () => {
    if (!support.stt) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    if (isListening) {
      setIsListening(false);
      // Logic to stop would be here if we held the instance ref
      return;
    }

    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.start();
  };

  const handleSpeak = () => {
    if (!support.tts || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isInput) {
    return (
      <button 
        onClick={handleToggleListen}
        className={`p-3 rounded-full transition-colors ${
            isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/5 text-slate-400'
        }`}
        title="Speak"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>
    );
  }

  // TTS Output
  return (
    <button 
      onClick={handleSpeak}
      className={`text-slate-400 hover:text-cyan-400 transition-colors ${isSpeaking ? 'text-cyan-400' : ''}`}
      title="Read Aloud"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    </button>
  );
};

export default AudioControls;
