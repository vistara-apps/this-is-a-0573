import React, { useState, useRef } from 'react';
import { Mic, MicOff, Loader2, Play, Square } from 'lucide-react';
import { useOpenAI } from '../hooks/useOpenAI';

export function VoiceInput({ onTaskCreated, onEventCreated, isPremium }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { transcribeAndParse } = useOpenAI();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      const result = await transcribeAndParse(audioBlob);
      
      if (result.type === 'task') {
        onTaskCreated(result.data);
      } else if (result.type === 'event') {
        onEventCreated(result.data);
      }
      
      setAudioBlob(null);
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing voice input. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Voice Button */}
      <div className="flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`
            relative w-20 h-20 rounded-full transition-all duration-300 transform hover:scale-105
            ${isRecording 
              ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' 
              : 'bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-xl'
            }
            ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8 text-white mx-auto" />
          ) : (
            <Mic className="w-8 h-8 text-white mx-auto" />
          )}
          
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {isRecording && (
          <p className="text-white/90 animate-pulse">
            🎤 Listening... Tap to stop
          </p>
        )}
        {isProcessing && (
          <p className="text-white/90">
            🧠 Processing your voice...
          </p>
        )}
        {!isRecording && !isProcessing && (
          <p className="text-white/70">
            Tap the microphone to start speaking
          </p>
        )}
      </div>

      {/* Process Audio Button */}
      {audioBlob && !isProcessing && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={processAudio}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Process Audio</span>
          </button>
          <button
            onClick={() => setAudioBlob(null)}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <Square className="w-4 h-4" />
            <span>Discard</span>
          </button>
        </div>
      )}

      {/* Quick Example Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => onTaskCreated({
            description: "Buy groceries",
            due_date: new Date(Date.now() + 86400000).toISOString(),
            priority: "medium"
          })}
          className="p-3 glass-card rounded-lg text-white/80 hover:text-white transition-colors text-sm"
        >
          📝 Try: "Remind me to buy groceries tomorrow"
        </button>
        <button
          onClick={() => onEventCreated({
            title: "Team Meeting",
            start_time: new Date(Date.now() + 3600000).toISOString(),
            end_time: new Date(Date.now() + 7200000).toISOString(),
            location: "Conference Room"
          })}
          className="p-3 glass-card rounded-lg text-white/80 hover:text-white transition-colors text-sm"
        >
          📅 Try: "Schedule team meeting in 1 hour"
        </button>
      </div>
    </div>
  );
}