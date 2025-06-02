import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceRecordingOptions {
  onTranscription: (text: string, confidence?: number) => void;
  onError?: (error: string) => void;
  language?: string;
  continuous?: boolean;
}

export function useVoiceRecording({
  onTranscription,
  onError,
  language = "en",
  continuous = true,
}: UseVoiceRecordingOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isMediaRecorderSupported = typeof MediaRecorder !== "undefined";
    
    setIsSupported(!!SpeechRecognition && isMediaRecorderSupported);
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser");
      onError?.("Speech recognition not supported in this browser");
    }
  }, [onError]);

  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return null;
    }

    const recognition = new SpeechRecognition();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = getLanguageCode(language);
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          onTranscription(finalTranscript, confidence);
        } else {
          interimTranscript += transcript;
          onTranscription(interimTranscript, 0); // Low confidence for interim results
        }
      }
    };

    recognition.onerror = (event) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      
      // Restart recognition if it was stopped unexpectedly and we want continuous recording
      if (continuous && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch (error) {
          console.warn("Failed to restart speech recognition:", error);
        }
      }
    };

    return recognition;
  }, [language, continuous, onTranscription, onError]);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      const errorMsg = "Voice recording not supported in this browser";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      // Initialize speech recognition
      const recognition = initializeSpeechRecognition();
      if (!recognition) return;

      recognitionRef.current = recognition;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      streamRef.current = stream;

      // Initialize MediaRecorder for audio data (optional, for future audio processing)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: getMediaRecorderMimeType(),
      });
      
      mediaRecorderRef.current = mediaRecorder;

      // Start speech recognition
      recognition.start();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start recording";
      setError(errorMessage);
      onError?.(errorMessage);
      setIsRecording(false);
    }
  }, [isSupported, initializeSpeechRecognition, onError]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, [stopRecording]);

  return {
    isRecording,
    isSupported,
    error,
    startRecording,
    stopRecording,
  };
}

// Helper functions
function getLanguageCode(language: string): string {
  const languageMap: Record<string, string> = {
    en: "en-US",
    hi: "hi-IN",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    pa: "pa-IN",
    or: "or-IN",
    as: "as-IN",
  };

  return languageMap[language] || "en-US";
}

function getMediaRecorderMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return ""; // Browser will choose default
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
