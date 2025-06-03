import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Mic, 
  MicOff, 
  Brain, 
  FileText, 
  Save, 
  Loader2, 
  Languages,
  Clock,
  User,
  Stethoscope
} from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import { SUPPORTED_LANGUAGES } from "@/lib/constants";

interface AiMedicalScribeProps {
  consultationId?: number;
  patientId: number;
  onTranscriptionUpdate?: (transcription: string) => void;
  onNotesGenerated?: (notes: any) => void;
}

interface TranscriptionEntry {
  id: string;
  timestamp: Date;
  speaker: "doctor" | "patient";
  text: string;
  confidence: number;
}

interface GeneratedNotes {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  clinicalFindings: string;
  assessment: string;
  plan: string;
  medications: string[];
  followUp: string;
}

export default function AiMedicalScribe({
  consultationId,
  patientId,
  onTranscriptionUpdate,
  onNotesGenerated,
}: AiMedicalScribeProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [transcriptionEntries, setTranscriptionEntries] = useState<TranscriptionEntry[]>([]);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNotes | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<"doctor" | "patient">("doctor");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const transcriptionRef = useRef<HTMLDivElement>(null);

  const saveTranscription = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/consultations/${consultationId}/transcription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to save transcription");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Transcription Saved",
        description: "Voice transcription has been saved to patient record.",
      });
    },
  });

  const generateClinicalNotes = useMutation({
    mutationFn: async (transcriptionText: string) => {
      const response = await fetch(`/api/consultations/${consultationId}/generate-notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ 
          transcription: transcriptionText,
          patientId,
          language: selectedLanguage 
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate clinical notes");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedNotes(data.notes);
      onNotesGenerated?.(data.notes);
      toast({
        title: "Clinical Notes Generated",
        description: "AI has generated structured clinical notes from the consultation.",
      });
    },
  });

  const handleTranscription = (text: string, speaker: "doctor" | "patient" = currentSpeaker) => {
    const newEntry: TranscriptionEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      speaker,
      text: text.trim(),
      confidence: 0.8, // Mock confidence score
    };

    setTranscriptionEntries(prev => [...prev, newEntry]);
    
    // Auto-save transcription entries
    if (consultationId) {
      saveTranscription.mutate({
        consultationId,
        entries: [...transcriptionEntries, newEntry],
      });
    }

    // Update parent component
    const fullTranscription = [...transcriptionEntries, newEntry]
      .map(entry => `[${entry.speaker.toUpperCase()}]: ${entry.text}`)
      .join('\n');
    onTranscriptionUpdate?.(fullTranscription);
  };

  const handleGenerateNotes = async () => {
    if (transcriptionEntries.length === 0) {
      toast({
        title: "No Transcription Available",
        description: "Please record some conversation before generating notes.",
        variant: "destructive",
      });
      return;
    }

    const fullTranscription = transcriptionEntries
      .map(entry => `[${entry.speaker.toUpperCase()}]: ${entry.text}`)
      .join('\n');
    
    setIsProcessing(true);
    try {
      await generateClinicalNotes.mutateAsync(fullTranscription);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: `Recording in ${SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}`,
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast({
      title: "Recording Stopped",
      description: "Voice recording has been stopped.",
    });
  };

  const handleClearTranscription = () => {
    setTranscriptionEntries([]);
    setGeneratedNotes(null);
    toast({
      title: "Transcription Cleared",
      description: "All transcription data has been cleared.",
    });
  };

  useEffect(() => {
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight;
    }
  }, [transcriptionEntries]);

  return (
    <div className="space-y-6">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Medical Scribe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {lang.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Current Speaker</label>
              <Select value={currentSpeaker} onValueChange={(value: "doctor" | "patient") => setCurrentSpeaker(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doctor">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Doctor
                    </div>
                  </SelectItem>
                  <SelectItem value="patient">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Patient
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              variant={isRecording ? "destructive" : "default"}
              className="flex-1"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </>
              )}
            </Button>
            <Button
              onClick={handleGenerateNotes}
              disabled={transcriptionEntries.length === 0 || isProcessing}
              variant="outline"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Notes
                </>
              )}
            </Button>
            <Button
              onClick={handleClearTranscription}
              variant="outline"
              disabled={transcriptionEntries.length === 0}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Recorder Component */}
      {isRecording && (
        <VoiceRecorder
          isRecording={isRecording}
          language={selectedLanguage}
          onTranscription={handleTranscription}
          onError={(error) => {
            toast({
              title: "Recording Error",
              description: error,
              variant: "destructive",
            });
          }}
        />
      )}

      {/* Live Transcription */}
      {transcriptionEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Live Transcription
              <Badge variant="secondary" className="ml-auto">
                {transcriptionEntries.length} entries
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={transcriptionRef}
              className="max-h-64 overflow-y-auto space-y-2 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg"
            >
              {transcriptionEntries.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={entry.speaker === "doctor" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {entry.speaker === "doctor" ? (
                        <Stethoscope className="h-3 w-3 mr-1" />
                      ) : (
                        <User className="h-3 w-3 mr-1" />
                      )}
                      {entry.speaker}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{entry.text}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {entry.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Clinical Notes */}
      {generatedNotes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Clinical Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Chief Complaint</label>
                <Textarea 
                  value={generatedNotes.chiefComplaint} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">History of Present Illness</label>
                <Textarea 
                  value={generatedNotes.historyOfPresentIllness} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Clinical Findings</label>
                <Textarea 
                  value={generatedNotes.clinicalFindings} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Assessment</label>
                <Textarea 
                  value={generatedNotes.assessment} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Plan</label>
                <Textarea 
                  value={generatedNotes.plan} 
                  readOnly 
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Follow-up</label>
                <Textarea 
                  value={generatedNotes.followUp} 
                  readOnly 
                  className="mt-1"
                />
              </div>
            </div>
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save to Patient Record
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}