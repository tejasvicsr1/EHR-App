import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope, User, Users, Building2, Eye, EyeOff, ArrowRight, ArrowLeft, Info } from "lucide-react";

interface OnboardingProps {
  onAuth: () => void;
}

export default function Onboarding({ onAuth }: OnboardingProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const [formData, setFormData] = useState({
    practiceType: "",
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    hprId: "",
    needsHprRegistration: false,
    agreeToTerms: false,
  });

  const practiceOptions = [
    {
      value: "solo",
      title: "Solo/Small Clinic (1-3 doctors)",
      description: "Ideal for individual practitioners or small teams. Each doctor manages their own schedule, records, and settings directly.",
      icon: User,
    },
    {
      value: "group",
      title: "Group Practice/Clinic (4+ doctors)",
      description: "For mid-sized clinics. A designated admin manages overall doctor profiles, facility-wide appointment slots, and system integrations.",
      icon: Users,
    },
    {
      value: "hospital",
      title: "Large Hospital/Tertiary Center",
      description: "Comprehensive setup for hospitals with multiple departments and staff roles. Features full role-based access control.",
      icon: Building2,
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.practiceType) {
      toast({
        title: "Selection Required",
        description: "Please select your practice type to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(2);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          toast({
            title: "Login Successful",
            description: "Welcome back to LAYRD!",
          });
          onAuth();
          setLocation("/dashboard");
        } else {
          throw new Error(data.message);
        }
      } else {
        // Validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Passwords do not match");
        }

        if (!formData.agreeToTerms) {
          throw new Error("Please agree to the Terms & Conditions");
        }

        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.email,
            mobile: formData.mobile,
            password: formData.password,
            practiceType: formData.practiceType,
            specialization: "General Medicine", // Default
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          
          // If HPR ID provided, verify it
          if (formData.hprId && !formData.needsHprRegistration) {
            await fetch("/api/auth/verify-hpr", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
              },
              body: JSON.stringify({ hprId: formData.hprId }),
            });
          }

          toast({
            title: "Account Created Successfully",
            description: "Welcome to LAYRD Healthcare Platform!",
          });
          onAuth();
          setLocation("/dashboard");
        } else {
          throw new Error(data.message);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900">LAYRD</h1>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">
            {isLogin ? "Welcome Back!" : "Welcome to LAYRD!"}
          </h2>
          <p className="text-lg text-neutral-600">
            {isLogin 
              ? "Sign in to your healthcare platform" 
              : "Let's set up your practice to get started"
            }
          </p>
        </div>

        {isLogin ? (
          /* Login Form */
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(false)}
                  className="text-primary-500"
                >
                  Don't have an account? Create one
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Registration Flow */
          <>
            {currentStep === 1 && (
              /* Practice Setup Selection */
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Practice Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.practiceType}
                    onValueChange={(value) => handleInputChange("practiceType", value)}
                    className="space-y-4"
                  >
                    {practiceOptions.map((option) => (
                      <div key={option.value} className="flex items-start space-x-4 p-4 border-2 border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="text-lg font-medium text-neutral-900 mb-2 block cursor-pointer">
                            {option.title}
                          </Label>
                          <p className="text-neutral-600 text-sm">
                            {option.description}
                          </p>
                        </div>
                        <option.icon className="h-6 w-6 text-primary-500 mt-1" />
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex items-center justify-between mt-8">
                    <Button variant="outline" className="flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Learn more about these options
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.practiceType}
                      className="flex items-center"
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              /* Doctor Information Form */
              <Card>
                <CardHeader>
                  <CardTitle>Set up your Doctor Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          placeholder="As per HPR registration"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number *</Label>
                        <Input
                          id="mobile"
                          type="tel"
                          value={formData.mobile}
                          onChange={(e) => handleInputChange("mobile", e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="doctor@example.com"
                        required
                      />
                    </div>

                    {/* HPR ID Section */}
                    <div>
                      <Label htmlFor="hprId">
                        HPR ID (Healthcare Professional Registry)
                        <Button type="button" variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                          <Info className="h-4 w-4 text-primary-500" />
                        </Button>
                      </Label>
                      <Input
                        id="hprId"
                        value={formData.hprId}
                        onChange={(e) => handleInputChange("hprId", e.target.value)}
                        placeholder="Enter your 14-digit HPR ID"
                        disabled={formData.needsHprRegistration}
                      />
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="needsHpr"
                            checked={formData.needsHprRegistration}
                            onCheckedChange={(checked) => handleInputChange("needsHprRegistration", checked)}
                          />
                          <Label htmlFor="needsHpr" className="text-sm text-neutral-600">
                            I don't have an HPR ID / Need to register
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="password">Create Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeToTerms}
                        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                        required
                      />
                      <Label htmlFor="terms" className="text-sm text-neutral-600">
                        I agree to the{" "}
                        <Button variant="link" className="p-0 h-auto text-primary-500">
                          Terms & Conditions
                        </Button>{" "}
                        and{" "}
                        <Button variant="link" className="p-0 h-auto text-primary-500">
                          Privacy Policy
                        </Button>
                      </Label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4">
                      <Button type="button" variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Already have account link */}
            <div className="text-center mt-6">
              <Button
                variant="link"
                onClick={() => setIsLogin(true)}
                className="text-primary-500"
              >
                Already have an account? Login
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
