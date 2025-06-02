import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import PatientSelector from "@/components/PatientSelector";
import {
  Plus,
  Search,
  Eye,
  Download,
  Send,
  Trash2,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Signature,
  Save,
  Printer,
} from "lucide-react";

interface PrescriptionsProps {
  user: any;
}

interface Medication {
  id: string;
  drugName: string;
  strength: string;
  frequency: string;
  instructions: string;
  duration?: string;
}

export default function Prescriptions({ user }: PrescriptionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [medications, setMedications] = useState<Medication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: prescriptionsData, isLoading } = useQuery({
    queryKey: ["/api/prescriptions"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/prescriptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch prescriptions");
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

  const createPrescriptionMutation = useMutation({
    mutationFn: async (prescriptionData: any) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prescriptionData),
      });
      if (!response.ok) throw new Error("Failed to create prescription");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prescriptions"] });
      setIsCreateOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create prescription",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedPatient(null);
    setClinicalNotes("");
    setMedications([]);
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      drugName: "",
      strength: "",
      frequency: "once-daily",
      instructions: "",
      duration: "",
    };
    setMedications([...medications, newMedication]);
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const handleCreatePrescription = () => {
    if (!selectedPatient) {
      toast({
        title: "Patient Required",
        description: "Please select a patient for the prescription",
        variant: "destructive",
      });
      return;
    }

    if (medications.length === 0) {
      toast({
        title: "Medications Required",
        description: "Please add at least one medication",
        variant: "destructive",
      });
      return;
    }

    const prescriptionData = {
      patientId: selectedPatient.id,
      medications: medications.filter(med => med.drugName.trim() !== ""),
      clinicalNotes,
      status: "sent",
      isNdhmCompliant: true,
      digitalSignature: `${user.fullName} - HPR: ${user.hprId}`,
      sentAt: new Date().toISOString(),
    };

    createPrescriptionMutation.mutate(prescriptionData);
  };

  const prescriptions = prescriptionsData?.prescriptions || [];
  const patients = patientsData?.patients || [];

  const filteredPrescriptions = prescriptions.filter((prescription: any) => {
    if (!searchTerm) return true;
    const patient = patients.find((p: any) => p.id === prescription.patientId);
    return patient?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient?.abhaId?.includes(searchTerm);
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-96 bg-neutral-200 rounded"></div>
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
              Digital Prescriptions
            </h1>
            <p className="text-neutral-600">
              NDHM-compliant digital prescriptions with ABHA integration
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Prescription</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Patient Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label>Select Patient *</Label>
                    <PatientSelector
                      patients={patients}
                      selectedPatient={selectedPatient}
                      onSelectPatient={setSelectedPatient}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prescriptionDate">Prescription Date</Label>
                    <Input
                      id="prescriptionDate"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      readOnly
                    />
                  </div>
                </div>

                {/* Medications Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-neutral-900">Medications</h3>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMedication}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Medication
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {medications.map((medication) => (
                      <Card key={medication.id} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Drug Name *</Label>
                            <Input
                              value={medication.drugName}
                              onChange={(e) => updateMedication(medication.id, "drugName", e.target.value)}
                              placeholder="Enter drug name"
                            />
                          </div>
                          <div>
                            <Label>Strength</Label>
                            <Input
                              value={medication.strength}
                              onChange={(e) => updateMedication(medication.id, "strength", e.target.value)}
                              placeholder="e.g., 5mg, 500mg"
                            />
                          </div>
                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={medication.frequency}
                              onValueChange={(value) => updateMedication(medication.id, "frequency", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="once-daily">Once daily</SelectItem>
                                <SelectItem value="twice-daily">Twice daily</SelectItem>
                                <SelectItem value="thrice-daily">Three times daily</SelectItem>
                                <SelectItem value="four-times-daily">Four times daily</SelectItem>
                                <SelectItem value="as-needed">As needed</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMedication(medication.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Label>Instructions</Label>
                          <Input
                            value={medication.instructions}
                            onChange={(e) => updateMedication(medication.id, "instructions", e.target.value)}
                            placeholder="e.g., Take with food, continue for 30 days"
                          />
                        </div>
                      </Card>
                    ))}

                    {medications.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg">
                        <FileText className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-neutral-500">No medications added yet</p>
                        <Button variant="outline" onClick={addMedication} className="mt-2">
                          Add First Medication
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <Label htmlFor="clinicalNotes">Clinical Notes (Optional)</Label>
                  <Textarea
                    id="clinicalNotes"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    placeholder="Additional notes for the patient or pharmacy..."
                    rows={3}
                  />
                </div>

                {/* Digital Signature Section */}
                <div className="digital-signature">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                      <Signature className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900">Digital Signature</h4>
                      <p className="text-sm text-neutral-600">
                        HPR-verified digital signature will be applied automatically
                      </p>
                      {user.hprId && (
                        <p className="text-xs text-neutral-500">
                          Dr. {user.fullName} - HPR ID: {user.hprId}
                        </p>
                      )}
                    </div>
                    <div className="text-secondary-600">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button type="button" variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setIsCreateOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreatePrescription}
                      disabled={createPrescriptionMutation.isPending}
                    >
                      {createPrescriptionMutation.isPending ? "Creating..." : "Generate Prescription"}
                      <Send className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Input
                placeholder="Search prescriptions by patient name or ABHA ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Prescriptions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredPrescriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left py-3 px-6 font-medium text-neutral-700">
                        Patient
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-neutral-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-neutral-700">
                        Medications
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-neutral-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-6 font-medium text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredPrescriptions.map((prescription: any) => {
                      const patient = patients.find((p: any) => p.id === prescription.patientId);
                      const medicationCount = prescription.medications?.length || 0;
                      const firstMedications = prescription.medications?.slice(0, 2) || [];
                      
                      return (
                        <tr key={prescription.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {patient?.fullName?.split(" ").map((n: string) => n[0]).join("") || "P"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-neutral-900">
                                  {patient?.fullName || "Unknown Patient"}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  ABHA: {patient?.abhaId ? `****${patient.abhaId.slice(-4)}` : "N/A"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-neutral-900">
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(prescription.createdAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-neutral-900">
                              {firstMedications.map((med: any) => med.drugName).join(", ")}
                              {medicationCount > 2 && ` +${medicationCount - 2} more`}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {medicationCount} medication{medicationCount !== 1 ? "s" : ""}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge
                              variant={
                                prescription.status === "sent" ? "default" :
                                prescription.status === "draft" ? "secondary" : "outline"
                              }
                            >
                              {prescription.status === "sent" && <CheckCircle className="h-3 w-3 mr-1" />}
                              {prescription.status === "draft" && <Clock className="h-3 w-3 mr-1" />}
                              {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                            </Badge>
                            {prescription.isNdhmCompliant && (
                              <div className="text-xs text-green-600 mt-1">
                                NDHM Compliant
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="View Prescription"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Download PDF"
                                disabled={prescription.status === "draft"}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Print"
                                disabled={prescription.status === "draft"}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {prescription.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Send Prescription"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No prescriptions found
                </h3>
                <p className="text-neutral-500 mb-4">
                  {searchTerm 
                    ? "No prescriptions match your search criteria."
                    : "Start by creating your first prescription."
                  }
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prescription
                </Button>
              </div>
            )}

            {/* Pagination */}
            {filteredPrescriptions.length > 0 && (
              <div className="border-t border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{filteredPrescriptions.length}</span> of{" "}
                    <span className="font-medium">{filteredPrescriptions.length}</span> prescriptions
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary-500 text-white">
                      1
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
