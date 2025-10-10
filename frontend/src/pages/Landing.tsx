import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Scale, FileText, Shield, Users, Brain, Search, Clock, Globe, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-justice.jpg";

const Landing = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Case Summarizer",
      description: "Intelligent analysis of complex legal documents with instant summaries and key insights"
    },
    {
      icon: Shield,
      title: "Secure Case Vault",
      description: "Bank-grade encryption for all your legal documents with role-based access control"
    },
    {
      icon: Clock,
      title: "Real-time Tracking",
      description: "Never miss a deadline with automated alerts for hearings and filing dates"
    },
    {
      icon: Globe,
      title: "Citizen-Friendly Access",
      description: "Simplified interface with multi-language support for easy case tracking"
    },
    {
      icon: Search,
      title: "Semantic Search",
      description: "Find relevant case laws and precedents using natural language queries"
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Organize, classify, and retrieve legal documents with AI-powered categorization"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">UDAAN</h1>
              <p className="text-xs text-muted-foreground">Unified Digital Justice Assistant</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">About</a>
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">How It Works</a>
            <a href="#contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Contact</a>
            <ThemeToggle />
            <Button asChild variant="default" size="default" className="shadow-md">
              <Link to="/login">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Justice and Technology" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <CheckCircle className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Trusted by Legal Professionals</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Empowering Justice<br />Through AI Technology
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-2xl">
              UDAAN revolutionizes case management for lawyers, judges, and citizens with AI-powered 
              document analysis, real-time tracking, and intelligent legal assistance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary" className="text-lg shadow-xl hover:shadow-2xl transition-shadow">
                <Link to="/login">Get Started Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                <a href="#features">Explore Features</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-8 max-w-lg">
              <div>
                <div className="text-3xl font-bold text-white mb-1">4.5Cr+</div>
                <div className="text-sm text-white/70">Cases Pending</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">24/7</div>
                <div className="text-sm text-white/70">AI Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">3+</div>
                <div className="text-sm text-white/70">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Powerful Features
            </div>
            <h3 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Modern Tools for Digital Justice
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Advanced AI capabilities combined with secure infrastructure to transform legal workflows
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border card-hover bg-gradient-card">
                <CardHeader>
                  <div className="h-14 w-14 rounded-xl bg-gradient-accent flex items-center justify-center mb-4 shadow-lg">
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Making Justice Accessible to All
            </h3>
            <p className="text-muted-foreground">Real impact through technology</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-card border border-border card-hover">
              <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">4.5Cr+</div>
              <div className="text-muted-foreground font-medium">Cases Awaiting Resolution</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Help us reduce the backlog</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card border border-border card-hover">
              <div className="text-5xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-muted-foreground font-medium">AI Legal Assistance</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Always available to help</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-card border border-border card-hover">
              <div className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">3+</div>
              <div className="text-muted-foreground font-medium">Languages Supported</div>
              <p className="text-sm text-muted-foreground/70 mt-2">Breaking language barriers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
              Simple Process
            </div>
            <h3 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              How UDAAN Works
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with UDAAN in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Sign Up & Choose Role</h4>
              <p className="text-muted-foreground">Register as a Lawyer, Judge, or Citizen and set up your profile</p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">Upload Documents</h4>
              <p className="text-muted-foreground">Upload case files and let our AI analyze and categorize them</p>
            </div>
            <div className="text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-accent flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-lg">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Track & Manage</h4>
              <p className="text-muted-foreground">Monitor progress, get alerts, and access AI-powered insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Scale className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl">UDAAN</span>
              </div>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Unified Digital Justice Assistant empowering legal professionals and citizens with AI-powered tools.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#about" className="text-primary-foreground/80 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#features" className="text-primary-foreground/80 hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-primary-foreground/80 hover:text-white transition-colors">How It Works</a></li>
                <li><Link to="/login" className="text-primary-foreground/80 hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#privacy" className="text-primary-foreground/80 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="text-primary-foreground/80 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#security" className="text-primary-foreground/80 hover:text-white transition-colors">Data Security</a></li>
                <li><a href="#compliance" className="text-primary-foreground/80 hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#help" className="text-primary-foreground/80 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#faq" className="text-primary-foreground/80 hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#contact" className="text-primary-foreground/80 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#accessibility" className="text-primary-foreground/80 hover:text-white transition-colors">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-primary-foreground/70">
                &copy; {new Date().getFullYear()} UDAAN Legal Tech. All rights reserved.
              </p>
              <p className="text-sm text-primary-foreground/70">
                Empowering justice through technology 🇮🇳
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
