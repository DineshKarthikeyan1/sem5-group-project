import Groq from "groq-sdk";

class SpeechService {
  constructor() {
    this.groq = new Groq({
      apiKey: import.meta.env.VITE_GROQ_API_KEY,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
  }

  // Check if browser supports speech recognition
  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  // Start recording audio
  async startRecording() {
    try {
      if (!this.isSupported()) {
        throw new Error("Speech recognition not supported in this browser");
      }

      console.log("Starting audio recording...");

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.audioChunks = [];
      this.isRecording = true;

      // Collect audio data
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log("Recording started successfully");

      return { success: true, message: "Recording started" };
    } catch (error) {
      console.error("Error starting recording:", error);
      this.isRecording = false;
      return { success: false, error: error.message };
    }
  }

  // Stop recording and transcribe
  async stopRecording() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve({ success: false, error: "No active recording" });
        return;
      }

      console.log("Stopping audio recording...");

      this.mediaRecorder.onstop = async () => {
        try {
          // Stop all tracks
          const tracks = this.mediaRecorder.stream.getTracks();
          tracks.forEach((track) => track.stop());

          // Create audio blob
          const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
          console.log("Audio blob created, size:", audioBlob.size, "bytes");

          if (audioBlob.size === 0) {
            resolve({ success: false, error: "No audio data recorded" });
            return;
          }

          // Transcribe audio
          const transcription = await this.transcribeAudio(audioBlob);
          resolve(transcription);
        } catch (error) {
          console.error("Error processing recording:", error);
          resolve({ success: false, error: error.message });
        } finally {
          this.isRecording = false;
          this.audioChunks = [];
        }
      };

      this.mediaRecorder.stop();
    });
  }

  // Transcribe audio using Groq Whisper
  async transcribeAudio(audioBlob) {
    try {
      console.log("Starting transcription with Groq Whisper...");

      // Convert blob to file
      const audioFile = new File([audioBlob], "audio.webm", {
        type: "audio/webm",
      });

      // Call Groq Whisper API
      const transcription = await this.groq.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-large-v3",
        language: "en", // Optional: specify language
        response_format: "json",
        temperature: 0.0, // For more consistent results
      });

      console.log("Transcription successful:", transcription.text);

      return {
        success: true,
        text: transcription.text,
        confidence: 1.0, // Groq doesn't provide confidence scores
      };
    } catch (error) {
      console.error("Transcription error:", error);

      // Handle specific Groq API errors
      if (error.status === 401) {
        return { success: false, error: "Invalid API key" };
      } else if (error.status === 429) {
        return { success: false, error: "Rate limit exceeded" };
      } else if (error.status === 413) {
        return { success: false, error: "Audio file too large" };
      }

      return {
        success: false,
        error: error.message || "Transcription failed",
      };
    }
  }

  // Transcribe from file upload
  async transcribeFile(file) {
    try {
      console.log("Transcribing uploaded file:", file.name);

      // Validate file type
      const validTypes = [
        "audio/wav",
        "audio/mp3",
        "audio/m4a",
        "audio/webm",
        "audio/ogg",
      ];
      if (!validTypes.includes(file.type)) {
        throw new Error(
          "Unsupported audio format. Please use WAV, MP3, M4A, WebM, or OGG."
        );
      }

      // Validate file size (25MB limit for Groq)
      const maxSize = 25 * 1024 * 1024; // 25MB
      if (file.size > maxSize) {
        throw new Error("File too large. Maximum size is 25MB.");
      }

      const transcription = await this.groq.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3",
        language: "en",
        response_format: "json",
        temperature: 0.0,
      });

      return {
        success: true,
        text: transcription.text,
        confidence: 1.0,
      };
    } catch (error) {
      console.error("File transcription error:", error);
      return {
        success: false,
        error: error.message || "File transcription failed",
      };
    }
  }

  // Get recording status
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      isSupported: this.isSupported(),
    };
  }

  // Cancel current recording
  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      const tracks = this.mediaRecorder.stream.getTracks();
      tracks.forEach((track) => track.stop());
      this.isRecording = false;
      this.audioChunks = [];
      console.log("Recording cancelled");
    }
  }
}

export default new SpeechService();
