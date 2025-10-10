import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Alerts() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Mock hearing data
  const hearings = [
    {
      id: "1",
      caseNumber: "CIV/2024/001",
      caseTitle: "Property Dispute - Sharma vs Kumar",
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      time: "10:30 AM",
      court: "District Court, Delhi",
      courtroom: "Court Room 3",
      judge: "Hon'ble Justice Meera Sharma",
      type: "Hearing",
      priority: "high"
    },
    {
      id: "2",
      caseNumber: "CIV/2024/087",
      caseTitle: "Contract Dispute - ABC Corp vs XYZ Ltd",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: "2:00 PM",
      court: "High Court, Delhi",
      courtroom: "Court Room 12",
      judge: "Hon'ble Justice R.K. Agarwal",
      type: "Arguments",
      priority: "medium"
    },
    {
      id: "3",
      caseNumber: "CIV/2024/103",
      caseTitle: "Consumer Complaint - Singh vs Tech Mart",
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      time: "11:00 AM",
      court: "Consumer Court, Delhi",
      courtroom: "Court Room 1",
      judge: "Hon'ble Justice Priya Reddy",
      type: "Hearing",
      priority: "medium"
    },
    {
      id: "4",
      caseNumber: "FAM/2024/015",
      caseTitle: "Divorce Petition - Gupta vs Gupta",
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      time: "9:30 AM",
      court: "Family Court, Bangalore",
      courtroom: "Court Room 5",
      judge: "Hon'ble Justice Anjali Nair",
      type: "Mediation",
      priority: "low"
    },
    {
      id: "5",
      caseNumber: "CRIM/2024/042",
      caseTitle: "Fraud Case - State vs Patel",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      time: "3:30 PM",
      court: "Sessions Court, Mumbai",
      courtroom: "Court Room 8",
      judge: "Hon'ble Justice S.K. Mehta",
      type: "Evidence Presentation",
      priority: "high"
    },
    {
      id: "6",
      caseNumber: "CIV/2024/120",
      caseTitle: "Employment Dispute - Kumar vs MNC Corp",
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      time: "1:00 PM",
      court: "Labour Court, Bangalore",
      courtroom: "Court Room 2",
      judge: "Hon'ble Justice M. Iyer",
      type: "Hearing",
      priority: "medium"
    },
    {
      id: "7",
      caseNumber: "CIV/2024/098",
      caseTitle: "Tenant Dispute - Landlord vs Tenant",
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      time: "10:00 AM",
      court: "Civil Court, Delhi",
      courtroom: "Court Room 7",
      judge: "Hon'ble Justice Rahul Sharma",
      type: "Final Arguments",
      priority: "high"
    },
    {
      id: "8",
      caseNumber: "FAM/2024/056",
      caseTitle: "Maintenance Petition - Wife vs Husband",
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      time: "11:30 AM",
      court: "Family Court, Mumbai",
      courtroom: "Court Room 3",
      judge: "Hon'ble Justice Kavita Singh",
      type: "Hearing",
      priority: "medium"
    }
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getHearingsForDate = (date: Date) => {
    return hearings.filter(h => 
      h.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-32 p-2 border border-border bg-muted/20" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayHearings = getHearingsForDate(date);
      const isCurrentDay = isToday(date);

      days.push(
        <div
          key={day}
          className={`h-32 p-2 border border-border cursor-pointer hover:bg-accent/50 transition-colors ${
            isCurrentDay ? "bg-primary/10 border-primary" : "bg-card"
          }`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-primary" : ""}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayHearings.slice(0, 2).map(hearing => (
              <div
                key={hearing.id}
                className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
              >
                {hearing.time} - {hearing.type}
              </div>
            ))}
            {dayHearings.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{dayHearings.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const upcomingHearings = hearings
    .filter(h => h.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard/lawyer">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold">Court Calendar & Alerts</h1>
                  <p className="text-sm text-muted-foreground">
                    Manage your hearing schedule and reminders
                  </p>
                </div>
              </div>
            </div>
            <Button className="gap-2">
              <Bell className="h-4 w-4" />
              Set Reminder
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-0">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2 border-b border-border">
                      {day}
                    </div>
                  ))}
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Upcoming Hearings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Hearings</CardTitle>
                <CardDescription>Next 5 court dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingHearings.map(hearing => (
                    <div key={hearing.id} className="p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge className={getPriorityColor(hearing.priority)}>
                          {hearing.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {hearing.date.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-medium text-sm mb-1">{hearing.caseNumber}</div>
                      <div className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {hearing.caseTitle}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {hearing.time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {hearing.courtroom}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Active Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Hearing Tomorrow</div>
                        <div className="text-xs text-muted-foreground">
                          CIV/2024/001 at 10:30 AM
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Bell className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Document Submission Due</div>
                        <div className="text-xs text-muted-foreground">
                          Submit evidence by 5:00 PM today
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CalendarIcon className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium">Mediation Scheduled</div>
                        <div className="text-xs text-muted-foreground">
                          FAM/2024/015 in 2 weeks
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>
                Hearings on {selectedDate.toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getHearingsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getHearingsForDate(selectedDate).map(hearing => (
                    <Card key={hearing.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-semibold text-lg">{hearing.caseNumber}</div>
                            <div className="text-sm text-muted-foreground">{hearing.caseTitle}</div>
                          </div>
                          <Badge className={getPriorityColor(hearing.priority)}>
                            {hearing.priority} priority
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Time</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {hearing.time}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Location</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {hearing.courtroom}, {hearing.court}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Type</div>
                            <div className="text-sm text-muted-foreground">{hearing.type}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Judge</div>
                            <div className="text-sm text-muted-foreground">{hearing.judge}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button size="sm">View Case Details</Button>
                          <Button size="sm" variant="outline">Set Reminder</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hearings scheduled for this date
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
