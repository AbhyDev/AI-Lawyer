import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, Maximize2, Minimize2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendAICounselMessage } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FloatingChatbotProps {
  userId: string;
  userRole: "judge" | "lawyer" | "user";
  activeCaseIds?: string[];
  initialOpen?: boolean;
}

export function FloatingChatbot({ userId, userRole, activeCaseIds = [], initialOpen = false }: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: getWelcomeMessage(userRole),
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Open chatbot when initialOpen changes
  useEffect(() => {
    if (initialOpen) {
      setIsOpen(true);
    }
  }, [initialOpen]);

  function getWelcomeMessage(role: string): string {
    switch (role) {
      case "judge":
        return "Hello, Your Honor. I'm your AI Legal Assistant. I can help you with case summaries, legal precedents, and analytical insights. How may I assist you today?";
      case "lawyer":
        return "Hello, Counselor. I'm your AI Legal Assistant. I can help with case research, document analysis, precedent discovery, and legal strategy. What would you like to know?";
      case "user":
        return "नमस्ते! Hello! I'm your AI Legal Assistant. मैं आपकी कानूनी सहायता कर सकता हूँ। I can help you understand your case status and legal processes in simple terms. How can I help you?";
      default:
        return "Hello! I'm your AI Legal Assistant. How can I help you today?";
    }
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // TODO: Connect LangGraph endpoint + RAG + Gemini Flash + BART integration here
      const response = await sendAICounselMessage(message, {
        userId,
        userRole,
        caseIds: activeCaseIds
      });

      const aiMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Counsel error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => setIsOpen(true)}
              aria-label="Open AI Counsel Chat"
            >
              <MessageSquare className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 ${
              isExpanded ? "w-[600px] h-[700px]" : "w-[400px] h-[500px]"
            } transition-all duration-300`}
          >
            <Card className="h-full flex flex-col shadow-2xl">
              {/* Header */}
              <CardHeader className="border-b p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-semibold">AI Legal Assistant</div>
                      <div className="text-xs text-muted-foreground font-normal">
                        Always online • {userRole === "user" ? "Multilingual" : "Legal Expert"}
                      </div>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsExpanded(!isExpanded)}
                      aria-label={isExpanded ? "Minimize" : "Maximize"}
                    >
                      {isExpanded ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close chat"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === "user"
                              ? "bg-accent"
                              : "bg-primary"
                          }`}
                        >
                          {msg.role === "user" ? (
                            <span className="text-xs font-semibold text-accent-foreground">
                              {userId.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <Bot className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                        <div
                          className={`flex-1 ${
                            msg.role === "user" ? "items-end" : "items-start"
                          } flex flex-col`}
                        >
                          <div
                            className={`rounded-lg p-3 max-w-[85%] ${
                              msg.role === "user"
                                ? "bg-accent text-accent-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="border-t p-4 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      userRole === "user"
                        ? "अपना सवाल पूछें / Ask your question..."
                        : "Ask about cases, laws, precedents..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isLoading}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {userRole === "user"
                    ? "AI responses are for guidance only"
                    : "AI for reference only • Verify with legal experts"}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
