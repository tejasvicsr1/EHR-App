import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Camera,
  CheckCircle,
  AlertTriangle,
  Globe,
  Mic,
  Shield,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Stethoscope,
  FileSignature,
  Network,
  Settings,
  Save,
  Edit,
} from "lucide-react";

interface ProfileProps {
  user: any;
}

export default function Profile({ user }: ProfileProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    specialization: user?.specialization || "",
    experience: user?.experience || "",
    consultationFee: user?.consultationFee || "",
  });

  const { data: facilityData } = useQuery({
    queryKey: ["/api/facilities/my"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/facilities/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      return response.json();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/auth/update-profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancel = () => {
    setProfileData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      mobile: user?.mobile || "",
      specialization: user?.specialization || "",
      experience: user?.experience || "",
      consultationFee: user?.consultationFee || "",
    });
    setIsEditing(false);
  };

  const facility = facilityData?.facility;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Doctor Profile & Settings
          </h1>
          <p className="text-neutral-600">
            Manage your professional information and system preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="ndhm">NDHM Status</TabsTrigger>
            <TabsTrigger value="facility">Facility</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Professional Information</CardTitle>
                  <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="text-lg">
                      {user?.fullName?.split(" ").map((n: string) => n[0]).join("") || "D"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-neutral-900">
                      {user?.fullName || "Doctor"}
                    </h2>
                    <p className="text-neutral-600 mb-2">
                      {user?.specialization || "Physician"} • {user?.experience || "0"} years experience
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-neutral-500">
                      {user?.hprId && (
                        <span className="flex items-center">
                          <FileSignature className="h-4 w-4 mr-1" />
                          HPR ID: {user.hprId}
                        </span>
                      )}
                      {user?.isHprVerified && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          HPR Verified
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="mt-3" disabled={isEditing}>
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Select
                      value={profileData.specialization}
                      onValueChange={(value) => setProfileData(prev => ({ ...prev, specialization: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Medicine">General Medicine</SelectItem>
                        <SelectItem value="Cardiology">Cardiology</SelectItem>
                        <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="Dermatology">Dermatology</SelectItem>
                        <SelectItem value="Gynecology">Gynecology</SelectItem>
                        <SelectItem value="Neurology">Neurology</SelectItem>
                        <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="Ophthalmology">Ophthalmology</SelectItem>
                        <SelectItem value="ENT">ENT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      type="tel"
                      value={profileData.mobile}
                      onChange={(e) => setProfileData(prev => ({ ...prev, mobile: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profileData.experience}
                      onChange={(e) => setProfileData(prev => ({ ...prev, experience: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                    <Input
                      id="consultationFee"
                      type="number"
                      value={profileData.consultationFee}
                      onChange={(e) => setProfileData(prev => ({ ...prev, consultationFee: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Language Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Language & Regional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="interfaceLanguage">Interface Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                          <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                          <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                          <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="aiLanguage">AI Scribe Language</Label>
                      <Select defaultValue="auto">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto-detect</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                          <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                          <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mic className="h-5 w-5 mr-2" />
                    Voice & AI Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-start voice recording</h4>
                      <p className="text-sm text-neutral-600">
                        Automatically start recording when a consultation begins
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">AI suggestions</h4>
                      <p className="text-sm text-neutral-600">
                        Enable real-time AI clinical suggestions during consultations
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-factor authentication</h4>
                      <p className="text-sm text-neutral-600">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session timeout</h4>
                      <p className="text-sm text-neutral-600">
                        Automatically log out after 30 minutes of inactivity
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      30 min
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* NDHM Status Tab */}
          <TabsContent value="ndhm">
            <Card>
              <CardHeader>
                <CardTitle>NDHM Integration Status</CardTitle>
                <p className="text-neutral-600">
                  Monitor your compliance with National Digital Health Mission standards
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* HPR Registration */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">HPR Registration</p>
                        <p className="text-sm text-neutral-600">Healthcare Professional Registry</p>
                        {user?.hprId && (
                          <p className="text-xs text-neutral-500">ID: {user.hprId}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {user?.isHprVerified ? "Verified" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Digital Signature</p>
                        <p className="text-sm text-neutral-600">For prescription authentication</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Active</span>
                    </div>
                  </div>

                  {/* ONDC Integration */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Network className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">ONDC Integration</p>
                        <p className="text-sm text-neutral-600">Open Network for Digital Commerce</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">Connected</span>
                    </div>
                  </div>

                  {/* ABHA Integration */}
                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">ABHA Integration</p>
                        <p className="text-sm text-neutral-600">Ayushman Bharat Health Account support</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-600">Enabled</span>
                    </div>
                  </div>

                  {/* Compliance Summary */}
                  <div className="mt-6 p-4 bg-neutral-50 rounded-lg border">
                    <h4 className="font-medium text-neutral-900 mb-2">Compliance Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-green-600 font-semibold">100%</div>
                        <div className="text-neutral-600">NDHM Ready</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-600 font-semibold">Active</div>
                        <div className="text-neutral-600">Digital Signing</div>
                      </div>
                      <div className="text-center">
                        <div className="text-orange-600 font-semibold">Connected</div>
                        <div className="text-neutral-600">ONDC Network</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-600 font-semibold">Enabled</div>
                        <div className="text-neutral-600">ABHA Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Facility Tab */}
          <TabsContent value="facility">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facility ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <Label>Facility Name</Label>
                        <div className="text-lg font-medium text-neutral-900">{facility.name}</div>
                      </div>
                      <div>
                        <Label>Facility Type</Label>
                        <div className="text-lg text-neutral-900 capitalize">{facility.type}</div>
                      </div>
                    </div>

                    <div>
                      <Label>Address</Label>
                      <div className="flex items-start space-x-2 text-neutral-900">
                        <MapPin className="h-4 w-4 mt-1 text-neutral-500" />
                        <div>
                          <div>{facility.address}</div>
                          <div>{facility.city}, {facility.state} - {facility.pincode}</div>
                        </div>
                      </div>
                    </div>

                    {facility.hfrId && (
                      <div>
                        <Label>HFR ID (Health Facility Registry)</Label>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-neutral-900">{facility.hfrId}</span>
                          <Badge variant={facility.isHfrVerified ? "default" : "secondary"}>
                            {facility.isHfrVerified ? "Verified" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-neutral-500">
                        Facility registered on {new Date(facility.createdAt).toLocaleDateString()}
                      </div>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Facility
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                      No facility registered
                    </h3>
                    <p className="text-neutral-500 mb-4">
                      {user?.practiceType === "solo" 
                        ? "As a solo practitioner, you can optionally register your clinic details."
                        : "Register your facility to enable advanced features and compliance."
                      }
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Register Facility
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
