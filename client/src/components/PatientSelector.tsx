import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, User, CheckCircle, Clock } from "lucide-react";

interface Patient {
  id: number;
  fullName: string;
  abhaId?: string;
  mobile?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  chronicConditions?: string;
  isAbhaVerified?: boolean;
}

interface PatientSelectorProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient | null) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export default function PatientSelector({
  patients,
  selectedPatient,
  onSelectPatient,
  placeholder = "Search and select a patient...",
  allowCreate = false,
}: PatientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.fullName.toLowerCase().includes(searchLower) ||
      patient.abhaId?.toLowerCase().includes(searchLower) ||
      patient.mobile?.includes(searchTerm) ||
      patient.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    setIsOpen(false);
    setSearchTerm("");
  };

  const getPatientAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <div className="space-y-2">
      {/* Selected Patient Display */}
      {selectedPatient ? (
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {selectedPatient.fullName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium text-neutral-900">
                    {selectedPatient.fullName}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-neutral-600">
                    {selectedPatient.dateOfBirth && selectedPatient.gender && (
                      <span>
                        {getPatientAge(selectedPatient.dateOfBirth)} years, {selectedPatient.gender}
                      </span>
                    )}
                    {selectedPatient.abhaId && (
                      <span className="flex items-center">
                        • ABHA: ****{selectedPatient.abhaId.slice(-4)}
                        {selectedPatient.isAbhaVerified && (
                          <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                        )}
                      </span>
                    )}
                  </div>
                  {selectedPatient.chronicConditions && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {selectedPatient.chronicConditions.split(",")[0]}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectPatient(null)}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Patient Search Input */
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="relative">
              <Input
                placeholder={placeholder}
                className="pl-10 cursor-pointer"
                readOnly
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Select Patient</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Input
                  placeholder="Search by name, ABHA ID, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>

              {/* Add New Patient Option */}
              {allowCreate && (
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Patient
                </Button>
              )}

              {/* Patient List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <Card
                      key={patient.id}
                      className="cursor-pointer hover:bg-neutral-50 transition-colors"
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {patient.fullName.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-900 truncate">
                              {patient.fullName}
                            </h4>
                            <div className="flex items-center space-x-2 text-sm text-neutral-600">
                              {patient.dateOfBirth && patient.gender && (
                                <span>
                                  {getPatientAge(patient.dateOfBirth)} years, {patient.gender}
                                </span>
                              )}
                              {patient.mobile && (
                                <span>• {patient.mobile}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              {patient.abhaId && (
                                <Badge
                                  variant={patient.isAbhaVerified ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {patient.isAbhaVerified ? (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  ABHA: ****{patient.abhaId.slice(-4)}
                                </Badge>
                              )}
                              {patient.chronicConditions && (
                                <Badge variant="outline" className="text-xs">
                                  {patient.chronicConditions.split(",")[0]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-neutral-500">
                      {searchTerm 
                        ? "No patients found matching your search."
                        : "No patients available."
                      }
                    </p>
                    {allowCreate && (
                      <Button variant="outline" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Patient
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
