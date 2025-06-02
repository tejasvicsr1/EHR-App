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
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Stethoscope,
  FileText,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

interface PatientsProps {
  user: any;
}

export default function Patients({ user }: PatientsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    fullName: "",
    abhaId: "",
    dateOfBirth: "",
    gender: "",
    mobile: "",
    email: "",
    address: "",
    bloodGroup: "",
    allergies: "",
    chronicConditions: "",
  });

  const { data: patientsData, isLoading } = useQuery({
    queryKey: ["/api/patients", searchTerm],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const url = searchTerm 
        ? `/api/patients?search=${encodeURIComponent(searchTerm)}`
        : "/api/patients";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch patients");
      return response.json();
    },
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });
      if (!response.ok) throw new Error("Failed to create patient");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsAddPatientOpen(false);
      setNewPatient({
        fullName: "",
        abhaId: "",
        dateOfBirth: "",
        gender: "",
        mobile: "",
        email: "",
        address: "",
        bloodGroup: "",
        allergies: "",
        chronicConditions: "",
      });
      toast({
        title: "Success",
        description: "Patient added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add patient",
        variant: "destructive",
      });
    },
  });

  const handleAddPatient = (e: React.FormEvent) => {
    e.preventDefault();
    createPatientMutation.mutate(newPatient);
  };

  const patients = patientsData?.patients || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-32 bg-neutral-200 rounded"></div>
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
              Patient Management
            </h1>
            <p className="text-neutral-600">
              Manage your patient records and ABHA integration
            </p>
          </div>
          <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={newPatient.fullName}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="abhaId">ABHA ID</Label>
                    <Input
                      id="abhaId"
                      value={newPatient.abhaId}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, abhaId: e.target.value }))}
                      placeholder="****-****-****"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newPatient.dateOfBirth}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => setNewPatient(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={newPatient.mobile}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, mobile: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={newPatient.address}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select onValueChange={(value) => setNewPatient(prev => ({ ...prev, bloodGroup: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      value={newPatient.allergies}
                      onChange={(e) => setNewPatient(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="e.g., Penicillin, Peanuts"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                  <Textarea
                    id="chronicConditions"
                    value={newPatient.chronicConditions}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, chronicConditions: e.target.value }))}
                    placeholder="e.g., Hypertension, Diabetes"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddPatientOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPatientMutation.isPending}>
                    {createPatientMutation.isPending ? "Adding..." : "Add Patient"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    placeholder="Search patients by name, ABHA ID, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Select defaultValue="all">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Patients</SelectItem>
                    <SelectItem value="recent">Recent Visits</SelectItem>
                    <SelectItem value="upcoming">Upcoming Appointments</SelectItem>
                    <SelectItem value="chronic">Chronic Conditions</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardContent className="p-0">
            {patients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        Patient
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        ABHA ID
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        Age/Gender
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        Condition
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-neutral-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {patients.map((patient: any) => (
                      <tr key={patient.id} className="hover:bg-neutral-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {patient.fullName?.split(" ").map((n: string) => n[0]).join("") || "P"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-neutral-900">
                                {patient.fullName}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {patient.mobile && (
                                  <span className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {patient.mobile}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {patient.abhaId ? (
                            <div>
                              <div className="font-mono text-sm text-neutral-700">
                                {patient.abhaId}
                              </div>
                              <div className="text-xs text-secondary-600 flex items-center">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {patient.isAbhaVerified ? "Verified" : "Pending"}
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-neutral-900">
                            {patient.dateOfBirth && (
                              <>
                                {Math.floor((new Date().getTime() - new Date(patient.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                                {patient.gender && ` / ${patient.gender}`}
                              </>
                            )}
                            {!patient.dateOfBirth && patient.gender && patient.gender}
                            {!patient.dateOfBirth && !patient.gender && "N/A"}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            {patient.mobile && (
                              <div className="text-sm text-neutral-900 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {patient.mobile}
                              </div>
                            )}
                            {patient.email && (
                              <div className="text-sm text-neutral-600 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {patient.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {patient.chronicConditions ? (
                            <Badge variant="outline">
                              {patient.chronicConditions.split(",")[0]}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              No conditions
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View Records"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="New Consultation"
                            >
                              <Stethoscope className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Prescriptions"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  No patients found
                </h3>
                <p className="text-neutral-500 mb-4">
                  {searchTerm 
                    ? "No patients match your search criteria."
                    : "Start by adding your first patient."
                  }
                </p>
                <Button onClick={() => setIsAddPatientOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patient
                </Button>
              </div>
            )}

            {/* Pagination */}
            {patients.length > 0 && (
              <div className="border-t border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutral-500">
                    Showing <span className="font-medium">1</span> to{" "}
                    <span className="font-medium">{patients.length}</span> of{" "}
                    <span className="font-medium">{patients.length}</span> patients
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
