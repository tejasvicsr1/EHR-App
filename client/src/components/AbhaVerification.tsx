import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface AbhaVerificationProps {
  patientId: number;
  currentAbhaId?: string;
  isVerified?: boolean;
  onVerificationComplete?: (abhaId: string, verified: boolean) => void;
}

export default function AbhaVerification({
  patientId,
  currentAbhaId,
  isVerified = false,
  onVerificationComplete,
}: AbhaVerificationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [abhaId, setAbhaId] = useState(currentAbhaId || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "verified">(
    isVerified ? "verified" : "input"
  );

  const initiateVerification = useMutation({
    mutationFn: async (abhaId: string) => {
      const response = await fetch(`/api/patients/${patientId}/abha/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ abhaId }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      setStep("otp");
      toast({
        title: "OTP Sent",
        description: "Verification OTP has been sent to registered mobile number.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to initiate ABHA verification",
        variant: "destructive",
      });
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (otpCode: string) => {
      const response = await fetch(`/api/patients/${patientId}/abha/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ abhaId, otp: otpCode }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: (data) => {
      setStep("verified");
      onVerificationComplete?.(abhaId, true);
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "ABHA ID Verified",
        description: "Patient's ABHA ID has been successfully verified.",
      });
    },
    onError: (error) => {
      toast({
        title: "OTP Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleInitiateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (abhaId.length !== 14) {
      toast({
        title: "Invalid ABHA ID",
        description: "ABHA ID must be 14 digits long.",
        variant: "destructive",
      });
      return;
    }
    initiateVerification.mutate(abhaId);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "OTP must be 6 digits long.",
        variant: "destructive",
      });
      return;
    }
    verifyOtp.mutate(otp);
  };

  if (step === "verified") {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            ABHA ID Verified
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{abhaId}</p>
              <p className="text-sm text-muted-foreground">
                Linked to National Digital Health Mission
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="h-3 w-3 mr-1" />
              NDHM Verified
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          ABHA ID Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "input" && (
          <form onSubmit={handleInitiateVerification} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="abha-id">ABHA ID (14 digits)</Label>
              <Input
                id="abha-id"
                type="text"
                placeholder="12345678901234"
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value.replace(/\D/g, "").slice(0, 14))}
                maxLength={14}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the 14-digit ABHA ID to link with NDHM
              </p>
            </div>
            <Button
              type="submit"
              disabled={abhaId.length !== 14 || initiateVerification.isPending}
              className="w-full"
            >
              {initiateVerification.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Initiating Verification...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Verification OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit OTP sent to the registered mobile number
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("input")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={otp.length !== 6 || verifyOtp.isPending}
                className="flex-1"
              >
                {verifyOtp.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">About ABHA ID</p>
              <p>
                ABHA ID is a unique health identifier that enables secure access to
                digital health records across India's National Digital Health Mission (NDHM) ecosystem.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}