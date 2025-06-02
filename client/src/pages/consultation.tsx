import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import VoiceRecorder from "@/components/VoiceRecorder";
import PatientSelector from "@/components/PatientSelector";
import {
  Plus,
  Mic,
  MicOff,
  Play,
  Pause,
  Calendar,
  History,
  Lightbulb,
  AlertTriangle,
  FileText,
  UserPlus,
  Clock,
} from "lucide-react";

interface ConsultationProps {
  user: any;
}

export default function Consultation({ user }: ConsultationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [currentConsultation, setCurrentConsultation] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState("en");
  const [consultationNotes, setConsultationNotes] = useState("");

  const { data: consultationsData, isLoading } = useQuery({
    queryKey: ["/api/consultations"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/consultations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch consultations");
      return response.json();
    },
  });

  const { data: patientsData } = useQuery({
    queryKey: ["/api/patients"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(consultationData),
      });
      if (!response.ok) throw new Error("Failed to create consultation");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      setCurrentConsultation(data.consultation);
      toast({
        title: "Success",
        description: "Consultation started successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start consultation",
        variant: "destructive",
      });
    },
  });

  const updateConsultationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/consultations/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update consultation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      toast({
        title: "Success",
        description: "Consultation updated successfully",
      });
    },
  });

  const handleStartConsultation = () => {
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient to start consultation",
        variant: "destructive",
      });
      return;
    }

    createConsultationMutation.mutate({
      patientId: selectedPatient.id,
      type: "regular",
      status: "in_progress",
      language,
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    });
  };

  const handleCompleteConsultation = () => {
    if (!currentConsultation) return;

    updateConsultationMutation.mutate({
      id: currentConsultation.id,
      updates: {
        status: "completed",
        completedAt: new Date().toISOString(),
        clinicalNotes: consultationNotes,
      },
    });

    setCurrentConsultation(null);
    setSelectedPatient(null);
    setConsultationNotes("");
  };

  const consultations = consultationsData?.consultations || [];
  const patients = patientsData?.patients || [];
  const todayConsultations = consultations.filter((c: any) => {
    const today = new Date().toDateString();
    const consultationDate = new Date(c.scheduledAt || c.createdAt).toDateString();
    return consultationDate === today;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 h-96 bg-neutral-200 rounded"></div>
              <div className="h-96 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              AI-Powered Consultation
            </h1>
            <p className="text-neutral-600">
              Conduct consultations with real-time AI assistance and multi-language support
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleStartConsultation} disabled={!selectedPatient}>
              <Plus className="h-4 w-4 mr-2" />
              New Consultation
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Consultation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            {!currentConsultation && (
              <Card>
                <CardHeader>
                  <CardTitle>Select Patient</CardTitle>
                </CardHeader>
                <CardContent>
                  <PatientSelector
                    patients={patients}
                    selectedPatient={selectedPatient}
                    onSelectPatient={setSelectedPatient}
                  />
                </CardContent>
              </Card>
            )}

            {/* Current Patient Info */}
            {(currentConsultation || selectedPatient) && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Patient</CardTitle>
                    {currentConsultation && (
                      <Badge variant="outline" className="border-amber-300 text-amber-700">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {(selectedPatient || currentConsultation) && (
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-15 w-15">
                        <AvatarFallback>
                          {(selectedPatient?.fullName || currentConsultation?.patient?.fullName || "P")
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-xl font-medium text-neutral-900">
                          {selectedPatient?.fullName || "Patient"}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {selectedPatient?.dateOfBirth && (
                            <span className="text-sm text-neutral-600">
                              {Math.floor((new Date().getTime() - new Date(selectedPatient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years, {selectedPatient.gender}
                            </span>
                          )}
                          {selectedPatient?.abhaId && (
                            <span className="text-sm text-neutral-600">
                              ABHA: ****{selectedPatient.abhaId.slice(-4)}
                            </span>
                          )}
                          {selectedPatient?.mobile && (
                            <span className="text-sm text-neutral-600">
                              {selectedPatient.mobile}
                            </span>
                          )}
                        </div>
                        {selectedPatient?.chronicConditions && (
                          <div className="flex items-center mt-2">
                            <Badge variant="outline">
                              {selectedPatient.chronicConditions.split(",")[0]}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" title="View Full History">
                        <History className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI Scribe Interface */}
            {currentConsultation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>AI Medical Scribe</CardTitle>
                    <div className="flex items-center space-x-3">
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी</SelectItem>
                          <SelectItem value="bn">বাংলা</SelectItem>
                          <SelectItem value="ta">தமிழ்</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant={isRecording ? "destructive" : "default"}
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        {isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 mr-2" />
                            Pause Recording
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Start Recording
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <VoiceRecorder
                    isRecording={isRecording}
                    language={language}
                    onTranscription={(text) => {
                      setConsultationNotes(prev => prev + "\n" + text);
                    }}
                  />

                  {/* Clinical Notes */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Clinical Notes
                    </label>
                    <Textarea
                      value={consultationNotes}
                      onChange={(e) => setConsultationNotes(e.target.value)}
                      placeholder="Document consultation findings, diagnosis, and treatment plan..."
                      rows={6}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <Button variant="outline">
                      Save Draft
                    </Button>
                    <Button onClick={handleCompleteConsultation}>
                      Complete Consultation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Insights */}
            {currentConsultation && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>AI Clinical Insights</CardTitle>
                    <Button variant="outline" size="sm">
                      View All Suggestions
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">
                            Consider Blood Pressure Check
                          </h4>
                          <p className="text-sm text-blue-800">
                            Based on symptoms and patient history, consider checking vital signs.
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-blue-600 font-medium">
                              Confidence: 85%
                            </span>
                            <Button variant="link" size="sm" className="text-blue-600 h-auto p-0">
                              Add to Notes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-amber-900 mb-1">
                            Medication Review Needed
                          </h4>
                          <p className="text-sm text-amber-800">
                            Last prescription was 30 days ago. Consider reviewing current medication effectiveness.
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-amber-600 font-medium">
                              Priority: Medium
                            </span>
                            <Button variant="link" size="sm" className="text-amber-600 h-auto p-0">
                              Review History
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="ghost">
                  <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Generate Prescription</p>
                  </div>
                </Button>

                <Button className="w-full justify-start" variant="ghost">
                  <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Schedule Follow-up</p>
                  </div>
                </Button>

                <Button className="w-full justify-start" variant="ghost">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Add Patient</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Today's Consultations */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                {todayConsultations.length > 0 ? (
                  <div className="space-y-3">
                    {todayConsultations.map((consultation: any) => (
                      <div key={consultation.id} className="border-l-4 border-neutral-300 pl-3 pb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-neutral-900">
                            {consultation.type || "Consultation"}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {consultation.scheduledAt 
                              ? new Date(consultation.scheduledAt).toLocaleTimeString()
                              : "No time"
                            }
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600">
                          {consultation.chiefComplaint || "General consultation"}
                        </p>
                        <Badge
                          variant={
                            consultation.status === "completed" ? "default" :
                            consultation.status === "in_progress" ? "destructive" : "secondary"
                          }
                          className="mt-1"
                        >
                          {consultation.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-500">No consultations today</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Patient History */}
            {selectedPatient && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-4 border-neutral-300 pl-3 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-neutral-900">
                          Regular Checkup
                        </span>
                        <span className="text-xs text-neutral-500">Dec 15, 2024</span>
                      </div>
                      <p className="text-sm text-neutral-600">
                        General health assessment
                      </p>
                      <Button variant="link" size="sm" className="text-primary-500 h-auto p-0 mt-1">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
