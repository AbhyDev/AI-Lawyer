import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Scale, 
  Calendar,
  MapPin,
  FileText,
  MessageCircle,
  Globe,
  Clock,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const CitizenPortal = () => {
  const caseProgress = 60;
  const caseDetails = {
    id: "452/2024",
    title: "Your Case Against XYZ Corp",
    court: "District Court, Delhi",
    nextHearing: "January 25, 2024 at 10:30 AM",
    status: "Active - Under Review",
    filedOn: "November 15, 2023",
  };

  const timeline = [
    { date: "Nov 15, 2023", event: "Case Filed", completed: true },
    { date: "Nov 20, 2023", event: "First Hearing Scheduled", completed: true },
    { date: "Dec 5, 2023", event: "Documents Submitted", completed: true },
    { date: "Jan 25, 2024", event: "Next Hearing", completed: false },
    { date: "Pending", event: "Final Judgment", completed: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">UDAAN</h1>
              <p className="text-xs text-muted-foreground">Citizen Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="gap-2">
              <Globe className="h-4 w-4" />
              <select className="bg-transparent border-none outline-none text-sm">
                <option>English</option>
                <option>हिंदी</option>
                <option>ಕನ್ನಡ</option>
              </select>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Exit Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Welcome, Rajesh Kumar</h2>
          <p className="text-muted-foreground">
            Here's an easy-to-understand update on your case
          </p>
        </div>

        {/* Case Status Card */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-hero text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Case #{caseDetails.id}</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  {caseDetails.title}
                </CardDescription>
              </div>
              <Badge className="bg-secondary text-secondary-foreground">
                {caseDetails.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span className="text-foreground">{caseDetails.court}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-foreground font-medium">Next Hearing</div>
                  <div className="text-accent">{caseDetails.nextHearing}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Filed on {caseDetails.filedOn}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Progress */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Case Progress
            </CardTitle>
            <CardDescription>Current status of your case proceedings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{caseProgress}%</span>
                </div>
                <Progress value={caseProgress} className="h-2" />
              </div>

              {/* Timeline */}
              <div className="mt-6 space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        item.completed 
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {item.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`w-0.5 h-12 ${
                          item.completed ? 'bg-accent' : 'bg-border'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className={`font-medium ${
                        item.completed ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {item.event}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What This Means */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What This Means (In Simple Terms)</CardTitle>
            <CardDescription>Easy explanation of your case status</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="text-foreground">
              Your case is currently being reviewed by the court. The judge has received all the documents 
              you submitted and is examining them carefully.
            </p>
            <p className="text-foreground">
              Your next hearing is scheduled for <strong>January 25, 2024 at 10:30 AM</strong>. On this day, 
              both you and the other party will present your arguments to the judge.
            </p>
            <p className="text-foreground">
              Make sure to arrive at the court at least 30 minutes early. You may want to discuss the 
              strategy with your lawyer before the hearing begins.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Ask About My Case</CardTitle>
                  <CardDescription>Get answers in simple language</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">View Documents</CardTitle>
                  <CardDescription>See all case-related files</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Help Section */}
        <Card className="mt-6 border-secondary/50 bg-secondary/5">
          <CardHeader>
            <CardTitle className="text-secondary">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              If you have questions or need assistance understanding your case, we're here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary">Contact Support</Button>
              <Button variant="outline">View FAQs</Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>UDAAN Citizen Portal - Making justice accessible to all</p>
          <p className="mt-2">For technical support, call: 1800-XXX-XXXX</p>
        </div>
      </footer>
    </div>
  );
};

export default CitizenPortal;
