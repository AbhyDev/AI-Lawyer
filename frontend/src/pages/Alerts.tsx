import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

function Alerts() {
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
    <AppLayout pageTitle="Court Calendar & Alerts">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Court Calendar</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                  </div>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Hearings */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Upcoming Hearings
              </CardTitle>
              <CardDescription>
                Your next 5 scheduled hearings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingHearings.map((hearing) => (
                <div
                  key={hearing.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{hearing.caseTitle}</h4>
                    <p className="text-xs text-muted-foreground">{hearing.caseNumber}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {hearing.date.toLocaleDateString()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {hearing.time}
                      </Badge>
                      <Badge className={`text-xs ${getPriorityColor(hearing.priority)}`}>
                        {hearing.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Selected Day Hearings */}
        {selectedDate && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Hearings on {selectedDate.toLocaleDateString()}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {getHearingsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getHearingsForDate(selectedDate).map((hearing) => (
                    <Card key={hearing.id}>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{hearing.caseTitle}</h3>
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant="outline">
                            {hearing.caseNumber}
                          </Badge>
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
      </div>
    </AppLayout>
  );
}

export default Alerts;