import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Patients from "@/pages/patients";
import Consultation from "@/pages/consultation";
import Prescriptions from "@/pages/prescriptions";
import Profile from "@/pages/profile";
import Sidebar from "@/components/Sidebar";

function Router() {
  const [location] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/onboarding" component={() => <Onboarding onAuth={checkAuth} />} />
        <Route component={() => <Onboarding onAuth={checkAuth} />} />
      </Switch>
    );
  }

  const hideNavigation = location === "/onboarding";

  return (
    <div className="min-h-screen bg-neutral-50">
      {!hideNavigation && <Sidebar user={user} />}
      <main className={hideNavigation ? "" : "lg:ml-64"}>
        <Switch>
          <Route path="/" component={() => <Dashboard user={user} />} />
          <Route path="/dashboard" component={() => <Dashboard user={user} />} />
          <Route path="/patients" component={() => <Patients user={user} />} />
          <Route path="/consultation" component={() => <Consultation user={user} />} />
          <Route path="/prescriptions" component={() => <Prescriptions user={user} />} />
          <Route path="/profile" component={() => <Profile user={user} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
