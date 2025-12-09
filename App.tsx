import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { AppState } from './types';
import { CONFIG } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WAITING);
  const [micActive, setMicActive] = useState<boolean>(false);
  
  // Microphone Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const requestRef = useRef<number>();

  const handleBlow = useCallback(() => {
    if (appState === AppState.WAITING) {
      setAppState(AppState.BLOWING);
      
      // Auto-transition to finished after the duration
      setTimeout(() => {
        setAppState(AppState.FINISHED);
      }, CONFIG.blowDuration);
    }
  }, [appState]);

  const handleReset = useCallback(() => {
    setAppState(AppState.WAITING);
  }, []);

  // Initialize Microphone
  const initMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      source.connect(analyserRef.current);
      setMicActive(true);
      startListening();
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      setMicActive(false);
    }
  };

  const startListening = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    const detectBlow = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        sum += dataArrayRef.current[i];
      }
      const average = sum / dataArrayRef.current.length;

      // Threshold for "Blowing" - Sensitivity can be adjusted
      // Usually blowing produces low frequency noise, but simple volume check works well for this.
      const threshold = 40; 
      
      if (average > threshold && appState === AppState.WAITING) {
        handleBlow();
      }

      if (appState !== AppState.FINISHED) {
        requestRef.current = requestAnimationFrame(detectBlow);
      }
    };

    detectBlow();
  };

  useEffect(() => {
    // Attempt to initialize mic on mount, though browsers might block it without interaction.
    // We provide a fallback button if needed.
    // initMicrophone(); // Commented out to prefer user interaction
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [appState, handleBlow]);

  // Restart listening loop when resetting
  useEffect(() => {
    if (appState === AppState.WAITING && micActive) {
      startListening();
    }
  }, [appState, micActive]);


  return (
    <div className="relative w-full h-full bg-[#FFF0F5] overflow-hidden select-none">
      
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows dpr={[1, 2]}>
          <Scene appState={appState} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-between py-12 px-4">
        
        {/* Header */}
        <div className="text-center transform transition-all duration-700 ease-out translate-y-0 opacity-100 mt-8 md:mt-0">
          <h1 className="text-5xl md:text-7xl font-bold text-pink-500 drop-shadow-md mb-2 tracking-wide" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            Happy Birthday!
          </h1>
          <p className="text-pink-400 text-xl font-medium">
            {micActive ? "Make a wish and blow into the mic!" : "Make a wish..."}
          </p>
        </div>

        {/* Interaction Controls */}
        <div className="pointer-events-auto flex flex-col items-center gap-4 mb-8 md:mb-0">
          
          {appState === AppState.WAITING && (
            <div className="flex flex-col gap-3 items-center">
              {!micActive && (
                 <button
                 onClick={initMicrophone}
                 className="px-6 py-2 bg-pink-100 text-pink-500 rounded-full font-bold text-sm hover:bg-pink-200 transition-colors shadow-sm"
               >
                 🎙️ Enable Microphone
               </button>
              )}

              <button
                onClick={handleBlow}
                className="group relative px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-bold rounded-full shadow-lg transform transition-all hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🌬️ {micActive ? "Blowing..." : "Blow Candles"}
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              
              {micActive && (
                <p className="text-pink-400 text-sm animate-pulse">
                  Listening for your breath...
                </p>
              )}
            </div>
          )}

          {(appState === AppState.FINISHED) && (
            <div className="animate-fade-in-up">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                  Yay! May your wishes come true! ✨
                </p>
              </div>
              <button
                onClick={handleReset}
                className="mx-auto block px-6 py-3 bg-white text-pink-500 border-2 border-pink-500 rounded-full font-bold shadow-sm hover:bg-pink-50 transition-colors"
              >
                Light them again
              </button>
            </div>
          )}
        </div>

        {/* Footer Credit */}
        <div className="text-pink-300 text-sm opacity-60">
          Interactive 3D Experience
        </div>

      </div>
    </div>
  );
};

export default App;