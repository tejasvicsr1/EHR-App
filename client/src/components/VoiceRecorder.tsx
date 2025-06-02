import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface VoiceRecorderProps {
  isRecording: boolean;
  language: string;
  onTranscription: (text: string, speaker?: "doctor" | "patient") => void;
  onError?: (error: string) => void;
}

export default function VoiceRecorder({
  isRecording,
  language,
  onTranscription,
  onError,
}: VoiceRecorderProps) {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcriptionBuffer, setTranscriptionBuffer] = useState("");
  const [speakerDetection, setSpeakerDetection] = useState<"doctor" | "patient" | null>(null);
  
  const {
    startRecording,
    stopRecording,
    isSupported,
    error: recordingError
  } = useVoiceRecording({
    onTranscription: (text, confidence) => {
      setTranscriptionBuffer(text);
      if (confidence && confidence > 0.7) {
        onTranscription(text, speakerDetection || "doctor");
        setTranscriptionBuffer("");
      }
    },
    onError: (error) => {
      onError?.(error);
    },
    language,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording && isSupported) {
      startRecording();
      setIsListening(true);
      initializeAudioVisualization();
    } else {
      stopRecording();
      setIsListening(false);
      stopAudioVisualization();
    }

    return () => {
      stopAudioVisualization();
    };
  }, [isRecording, isSupported, startRecording, stopRecording]);

  const initializeAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      source.connect(analyserRef.current);
      updateAudioLevel();
    } catch (error) {
      console.error("Error initializing audio visualization:", error);
      onError?.("Failed to access microphone");
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteFrequencyData(dataArrayRef.current);
    const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
    setAudioLevel(average / 255);

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const getLanguageDisplay = (langCode: string) => {
    const languages: Record<string, string> = {
      en: "English",
      hi: "हिंदी",
      bn: "বাংলা",
      ta: "தமிழ்",
      te: "తెలుగు",
      mr: "मराठी",
      gu: "ગુજરાતી",
    };
    return languages[langCode] || langCode;
  };

  if (!isSupported) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <MicOff className="h-6 w-6 text-red-500" />
            <div>
              <p className="font-medium text-red-900">Voice recording not supported</p>
              <p className="text-sm text-red-700">
                Your browser doesn't support voice recording. Please use a modern browser like Chrome or Firefox.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recording Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge variant={isListening ? "destructive" : "secondary"}>
            {isListening ? (
              <>
                <Mic className="h-3 w-3 mr-1" />
                Recording
              </>
            ) : (
              <>
                <MicOff className="h-3 w-3 mr-1" />
                Stopped
              </>
            )}
          </Badge>
          <Badge variant="outline">
            <Volume2 className="h-3 w-3 mr-1" />
            {getLanguageDisplay(language)}
          </Badge>
        </div>
        {recordingError && (
          <Badge variant="destructive">
            Error: {recordingError}
          </Badge>
        )}
      </div>

      {/* Voice Visualization */}
      <Card className={isListening ? "bg-red-50 border-red-200" : "bg-neutral-50"}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            {isListening ? (
              <div className="flex items-center space-x-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-red-500 rounded-full voice-wave ${
                      audioLevel > 0.1 ? "animate-pulse" : ""
                    }`}
                    style={{
                      height: `${Math.max(8, audioLevel * 60 + Math.random() * 20)}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                {Array.from({ length: 7 }, (_, i) => (
                  <div
                    key={i}
                    className="w-1 h-2 bg-neutral-300 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
          
          <p className="text-center text-sm text-neutral-600 mt-4">
            {isListening 
              ? "Listening... Speak clearly in your preferred language"
              : "Voice recording is stopped"
            }
          </p>

          {/* Audio Level Indicator */}
          {isListening && (
            <div className="mt-4">
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 mt-1 text-center">
                Audio level: {Math.round(audioLevel * 100)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Transcription */}
      {transcriptionBuffer && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900">
                    {speakerDetection === "patient" ? "Patient" : "Doctor"} (Live transcription)
                  </span>
                  <span className="text-xs text-blue-600">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-blue-900">{transcriptionBuffer}...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speaker Detection */}
      {isListening && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant={speakerDetection === "doctor" ? "default" : "outline"}
            size="sm"
            onClick={() => setSpeakerDetection("doctor")}
          >
            Doctor Speaking
          </Button>
          <Button
            variant={speakerDetection === "patient" ? "default" : "outline"}
            size="sm"
            onClick={() => setSpeakerDetection("patient")}
          >
            Patient Speaking
          </Button>
        </div>
      )}
    </div>
  );
}
