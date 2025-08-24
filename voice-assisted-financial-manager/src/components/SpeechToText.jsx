import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Upload, Volume2, Square, Play } from "lucide-react";
import speechService from "../services/speechService";

const SpeechToText = ({
  onTranscription,
  placeholder = "Click the microphone to start recording...",
  className = "",
  showFileUpload = true,
  autoSubmit = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Format recording time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Start recording
  const startRecording = async () => {
    setError("");
    setTranscription("");

    try {
      const result = await speechService.startRecording();

      if (result.success) {
        setIsRecording(true);
        console.log("Recording started successfully");
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // Stop recording and transcribe
  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      const result = await speechService.stopRecording();

      if (result.success) {
        setTranscription(result.text);

        // Call parent callback
        if (onTranscription) {
          onTranscription(result.text);
        }

        // Auto-submit if enabled
        if (autoSubmit && result.text.trim()) {
          // You can add auto-submit logic here
          console.log("Auto-submitting:", result.text);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setIsProcessing(true);

    try {
      const result = await speechService.transcribeFile(file);

      if (result.success) {
        setTranscription(result.text);

        if (onTranscription) {
          onTranscription(result.text);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Clear transcription
  const clearTranscription = () => {
    setTranscription("");
    setError("");
  };

  // Cancel recording
  const cancelRecording = () => {
    speechService.cancelRecording();
    setIsRecording(false);
    setIsProcessing(false);
    setError("");
  };

  return (
    <div className={`speech-to-text ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center space-x-4 mb-4">
        {/* Record Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500"
          }`}
        >
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Recording Status */}
        {isRecording && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-600">
                Recording {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={cancelRecording}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-blue-600">Processing audio...</span>
          </div>
        )}

        {/* File Upload */}
        {showFileUpload && !isRecording && !isProcessing && (
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">Upload Audio</span>
            </button>
          </div>
        )}
      </div>

      {/* Transcription Display */}
      <div className="relative">
        <textarea
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
          disabled={isRecording || isProcessing}
        />

        {/* Clear Button */}
        {transcription && (
          <button
            onClick={clearTranscription}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MicOff className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Instructions */}
      {!transcription && !error && !isRecording && !isProcessing && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Voice Input Tips:</p>
              <ul className="text-xs space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Minimize background noise</li>
                <li>• Click the microphone to start/stop recording</li>
                <li>• Or upload an audio file for transcription</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {transcription && !error && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✅ Transcription complete! You can edit the text above if needed.
          </p>
        </div>
      )}
    </div>
  );
};

export default SpeechToText;
