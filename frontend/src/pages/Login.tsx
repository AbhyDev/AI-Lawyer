import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { Scale, ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Login state
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerUserId, setRegisterUserId] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerRole, setRegisterRole] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginUserId || !loginPassword) {
      toast({
        title: "Login Failed",
        description: "Please enter both User ID and Password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          username: loginUserId,
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Login Successful!",
          description: `Welcome back, ${data.user.username}!`,
        });

        // Store user info and token in localStorage
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("accessToken", data.accessToken);

        // Navigate based on role
        switch (data.user.role) {
          case "judge":
            navigate("/dashboard/judge");
            break;
          case "lawyer":
            navigate("/dashboard/lawyer");
            break;
          case "user":
            navigate("/dashboard/citizen");
            break;
          default:
            navigate("/dashboard/lawyer");
        }
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid user ID or password.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !registerUserId ||
      !registerPassword ||
      !registerConfirmPassword ||
      !registerRole
    ) {
      toast({
        title: "Registration Failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (registerPassword.length < 6) {
      toast({
        title: "Registration Failed",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          username: registerUserId,
          password: registerPassword,
          role: registerRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. Please login.",
        });

        // Clear form
        setRegisterUserId("");
        setRegisterPassword("");
        setRegisterConfirmPassword("");
        setRegisterRole("");

        // Switch to login tab
        const loginTab = document.querySelector(
          '[value="login"]'
        ) as HTMLElement;
        loginTab?.click();
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "An error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5" />

      {/* Back to Home and Theme Toggle */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button asChild variant="ghost" size="sm">
          <Link to="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-2xl">
              <Scale className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">UDAAN</h1>
              <p className="text-muted-foreground">
                Unified Digital Justice Assistant
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Access justice with
              <br />
              AI-powered legal assistance
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Secure & Confidential
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Bank-grade encryption protects all your legal documents
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    AI-Powered Insights
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get instant case analysis and legal recommendations
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Scale className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    For Everyone
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Built for lawyers, judges, and citizens alike
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login/Register */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-lg">
                <Scale className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">UDAAN</h1>
            <p className="text-muted-foreground">Access justice with AI</p>
          </div>

          {/* Login/Register Card */}
          <Card className="shadow-2xl border-border bg-card/95 backdrop-blur-sm">
            <Tabs defaultValue="login" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
              </CardHeader>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="login-userId">User ID</Label>
                      <Input
                        id="login-userId"
                        type="text"
                        placeholder="Enter your user ID"
                        value={loginUserId}
                        onChange={(e) => setLoginUserId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    {/* Demo Credentials */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Demo Credentials:
                      </p>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex justify-between">
                          <strong>Judge:</strong>{" "}
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            judgeUser / UDAAN3
                          </code>
                        </p>
                        <p className="flex justify-between">
                          <strong>Lawyer:</strong>{" "}
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            lawyerUser / UDAAN1
                          </code>
                        </p>
                        <p className="flex justify-between">
                          <strong>User:</strong>{" "}
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            userUser / UDAAN2
                          </code>
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button type="submit" className="w-full shadow-md">
                      Sign In
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Register for a new account to get started
                    </CardDescription>

                    <div className="space-y-2">
                      <Label htmlFor="register-userId">User ID</Label>
                      <Input
                        id="register-userId"
                        type="text"
                        placeholder="Choose a unique user ID"
                        value={registerUserId}
                        onChange={(e) => setRegisterUserId(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">
                        Confirm Password
                      </Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        value={registerConfirmPassword}
                        onChange={(e) =>
                          setRegisterConfirmPassword(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-role">Role</Label>
                      <Select
                        value={registerRole}
                        onValueChange={setRegisterRole}
                        required
                      >
                        <SelectTrigger id="register-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User (Citizen)</SelectItem>
                          <SelectItem value="lawyer">Lawyer</SelectItem>
                          <SelectItem value="judge">Judge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button type="submit" className="w-full shadow-md">
                      Create Account
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
