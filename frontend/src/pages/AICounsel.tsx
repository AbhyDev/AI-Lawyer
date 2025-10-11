import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  Send,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  FileText,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

function AICounsel() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm UDAAN AI Counsel. I can help you with case summaries, legal research, precedent analysis, and more. How can I assist you today?",
      timestamp: new Date(Date.now() - 3600000),
    },
  ]);

  const examplePrompts = [
    "Summarize recent orders in Case #452/2024",
    "Find similar cases on contract disputes",
    "What are the key arguments in Case #453/2024?",
    "Explain Section 17 of Contract Act",
  ];

  const caseContext = [
    { id: "452/2024", title: "Contract Dispute - ABC Corp", status: "Active" },
    {
      id: "453/2024",
      title: "Property Rights - Sharma vs Kumar",
      status: "Pending",
    },
    {
      id: "454/2024",
      title: "Employment Law - Tech Solutions",
      status: "Active",
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL ||
          "https://unannotated-overthickly-ceola.ngrok-free.dev"
        }/api/rag`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ query: message }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const aiMessage = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Add error message to the chat
      const errorMessage = {
        role: "assistant",
        content:
          "I apologize, but I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Error:", error);
    }
  };

  return (
    <AppLayout pageTitle="AI Counsel">
      {/* Main Content */}
      <main>
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-15rem)]">
          {/* Case Context Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Case Context
                </CardTitle>
                <CardDescription className="text-xs">
                  Active cases in memory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {caseContext.map((case_) => (
                    <div
                      key={case_.id}
                      className="p-2 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="font-medium text-xs mb-1">{case_.id}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {case_.title}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-2">
                        {case_.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  Generate Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  Find Precedents
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  Research Citations
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-2"
                >
                  Draft Arguments
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Bot className="h-6 w-6 text-primary" />
                      AI Legal Counsel
                    </CardTitle>
                    <CardDescription>
                      Powered by advanced AI models for legal research and
                      analysis
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    Online
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full p-6">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === "user"
                              ? "bg-gradient-accent"
                              : "bg-primary"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <User className="h-4 w-4 text-accent-foreground" />
                          ) : (
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        <div
                          className={`flex-1 max-w-[80%] ${
                            msg.role === "user" ? "items-end" : "items-start"
                          } flex flex-col`}
                        >
                          <div
                            className={`rounded-lg p-4 ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4">
                {/* Example Prompts */}
                {messages.length === 1 && (
                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      Try asking:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {examplePrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2"
                          onClick={() => setMessage(prompt)}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about cases, laws, precedents..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="gap-2">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  AI responses are for reference only. Always verify with legal
                  experts.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

export default AICounsel;
