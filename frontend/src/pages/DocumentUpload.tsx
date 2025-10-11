import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Scale, 
  Upload, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";

function DocumentUpload() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userRole = currentUser.role || "lawyer";
  const navigate = useNavigate();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState("");
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const documentTypes = [
    { value: "petition", label: "Petition" },
    { value: "affidavit", label: "Affidavit" },
    { value: "evidence", label: "Evidence" },
    { value: "order", label: "Court Order" },
    { value: "notice", label: "Notice" },
    { value: "reply", label: "Reply/Response" },
  ];

  const mockUploadedFiles = [
    {
      name: "Petition_452_2024.pdf",
      type: "Petition",
      confidence: 96,
      status: "processed",
      extractedText: "This is a petition filed by ABC Corporation against...",
    },
    {
      name: "Evidence_Contracts.pdf",
      type: "Evidence",
      confidence: 88,
      status: "processed",
      extractedText: "Contract agreement between parties dated...",
    },
    {
      name: "Affidavit_Witness.pdf",
      type: "Affidavit",
      confidence: 72,
      status: "review",
      extractedText: "I, the undersigned witness, hereby declare...",
    },
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Mock file upload
    simulateUpload();
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Add mock file to uploaded list
          setUploadedFiles([...mockUploadedFiles]);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors">
              <Scale className="h-6 w-6" />
              <span className="font-bold">UDAAN</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-semibold">Document Upload</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Upload Legal Documents</CardTitle>
                <CardDescription>
                  AI will automatically classify and extract text from your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Type Selection */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">
                    Drag and drop your files here
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse from your computer
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    multiple
                    onChange={simulateUpload}
                  />
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Uploading...</span>
                      <span className="font-medium">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Processed Documents</CardTitle>
                  <CardDescription>AI analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm mb-1">{file.name}</div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {file.type}
                                </Badge>
                                {file.status === "processed" ? (
                                  <div className="flex items-center gap-1 text-xs text-accent">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Processed</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-xs text-secondary">
                                    <AlertCircle className="h-3 w-3" />
                                    <span>Needs Review</span>
                                  </div>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  Confidence: {file.confidence}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3 text-sm text-muted-foreground">
                          <div className="font-medium text-xs text-foreground mb-1">Extracted Text Preview:</div>
                          {file.extractedText}
                        </div>
                        {file.status === "review" && (
                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline">
                              Flag for Human Review
                            </Button>
                            <Button size="sm" variant="default">
                              Approve Classification
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    1
                  </div>
                  <div>
                    <div className="font-medium mb-1">Upload Documents</div>
                    <div className="text-muted-foreground text-xs">
                      Drag and drop or select files from your device
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    2
                  </div>
                  <div>
                    <div className="font-medium mb-1">AI Classification</div>
                    <div className="text-muted-foreground text-xs">
                      Documents are automatically classified by type
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    3
                  </div>
                  <div>
                    <div className="font-medium mb-1">OCR Processing</div>
                    <div className="text-muted-foreground text-xs">
                      Text is extracted for search and analysis
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    4
                  </div>
                  <div>
                    <div className="font-medium mb-1">Review & Approve</div>
                    <div className="text-muted-foreground text-xs">
                      Verify AI results before final submission
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Ensure documents are clear and legible</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>PDF format provides best OCR results</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Review AI confidence scores before approving</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>Flag low-confidence results for manual review</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DocumentUpload;
