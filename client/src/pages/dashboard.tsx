import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Users,
  FileText,
  Brain,
  Plus,
  Video,
  Play,
  Clock,
  UserPlus,
  Stethoscope,
  Pill,
} from "lucide-react";
import { Link } from "wouter";

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const { data: consultationsData, isLoading: consultationsLoading } = useQuery({
    queryKey: ["/api/consultations"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/consultations?status=scheduled", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch consultations");
      return response.json();
    },
  });

  if (statsLoading || consultationsLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = stats?.stats || {};
  const todayConsultations = consultationsData?.consultations?.slice(0, 3) || [];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">
            Welcome back, {user?.fullName || "Doctor"}
          </h1>
          <p className="text-neutral-600">
            Here's what's happening with your practice today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Today's Appointments
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {dashboardStats.todayAppointments || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary-500 font-medium">+2</span>
                <span className="text-neutral-500 ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {dashboardStats.totalPatients || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-secondary-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary-500 font-medium">+18</span>
                <span className="text-neutral-500 ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    Prescriptions
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {dashboardStats.totalPrescriptions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary-500 font-medium">+7</span>
                <span className="text-neutral-500 ml-1">this week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    AI Sessions
                  </p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {dashboardStats.aiSessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-secondary-500 font-medium">+23</span>
                <span className="text-neutral-500 ml-1">this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Schedule</CardTitle>
                  <Link href="/consultation">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {todayConsultations.length > 0 ? (
                  <div className="space-y-4">
                    {todayConsultations.map((consultation: any) => (
                      <div
                        key={consultation.id}
                        className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg"
                      >
                        <div className="w-2 h-12 bg-primary-500 rounded-full"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-neutral-900">
                              Patient Consultation
                            </h3>
                            <span className="text-sm text-neutral-500">
                              {consultation.scheduledAt
                                ? new Date(consultation.scheduledAt).toLocaleTimeString()
                                : "Not scheduled"}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-600">
                            {consultation.type} • {consultation.chiefComplaint || "General consultation"}
                          </p>
                          <div className="flex items-center mt-2">
                            <Badge
                              variant={
                                consultation.status === "in_progress"
                                  ? "default"
                                  : consultation.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {consultation.status}
                            </Badge>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost">
                          {consultation.status === "in_progress" ? (
                            <Play className="h-4 w-4" />
                          ) : consultation.status === "scheduled" ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-500">No appointments scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/consultation">
                  <Button className="w-full justify-start" variant="ghost">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">New Consultation</p>
                      <p className="text-sm text-neutral-600">Start AI-powered session</p>
                    </div>
                  </Button>
                </Link>

                <Link href="/patients">
                  <Button className="w-full justify-start" variant="ghost">
                    <div className="w-10 h-10 bg-secondary-500 rounded-lg flex items-center justify-center mr-3">
                      <UserPlus className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Add Patient</p>
                      <p className="text-sm text-neutral-600">Register new patient</p>
                    </div>
                  </Button>
                </Link>

                <Link href="/prescriptions">
                  <Button className="w-full justify-start" variant="ghost">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                      <Pill className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Quick Pill</p>
                      <p className="text-sm text-neutral-600">Generate prescription</p>
                    </div>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">
                        Pill sent to patient
                      </p>
                      <p className="text-xs text-neutral-500">2 minutes ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-secondary-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">
                        New patient registered
                      </p>
                      <p className="text-xs text-neutral-500">1 hour ago</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">
                        AI scribe session completed
                      </p>
                      <p className="text-xs text-neutral-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
