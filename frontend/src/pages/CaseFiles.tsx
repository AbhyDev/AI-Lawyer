import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Scale, 
  Search,
  Filter,
  Eye,
  Download,
  FileText,
  FolderOpen,
  Calendar,
  Upload
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCases, fetchCaseDocuments, type Case, type Document } from "@/lib/api";

const CaseFiles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [documentsMap, setDocumentsMap] = useState<Record<string, Document[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCase, setExpandedCase] = useState<string | null>(null);

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  const userId = currentUser.userId || "lawyerUser";
  const userRole = currentUser.role || "lawyer";

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call to /api/cases
      const casesData = await fetchCases(userId, userRole);
      setCases(casesData);
    } catch (error) {
      console.error("Failed to load cases:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (caseId: string) => {
    if (documentsMap[caseId]) return; // Already loaded

    try {
      // TODO: Replace with actual API call to /api/cases/{case_id}/documents
      const docs = await fetchCaseDocuments(caseId);
      setDocumentsMap(prev => ({ ...prev, [caseId]: docs }));
    } catch (error) {
      console.error(`Failed to load documents for case ${caseId}:`, error);
    }
  };

  const handleAccordionChange = (caseId: string) => {
    setExpandedCase(expandedCase === caseId ? null : caseId);
    if (expandedCase !== caseId) {
      loadDocuments(caseId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-accent text-accent-foreground";
      case "Pending Review": return "bg-secondary/20 text-secondary-foreground";
      case "Closed": return "bg-muted text-muted-foreground";
      default: return "bg-primary/20 text-primary";
    }
  };

  const filteredCases = cases.filter(c =>
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to={`/dashboard/${userRole}`} 
                className="flex items-center gap-2 text-primary hover:text-primary-hover transition-colors"
              >
                <Scale className="h-6 w-6" />
                <span className="font-bold">UDAAN</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <h1 className="text-xl font-semibold">Case Files</h1>
            </div>
            {userRole === "lawyer" && (
              <Button className="gap-2" onClick={() => navigate("/upload")}>
                <Upload className="h-4 w-4" />
                Upload Documents
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Cases with Documents</CardTitle>
                <CardDescription>
                  Documents organized by Case ID
                  {/* TODO: Document Classifier integration will auto-categorize uploads */}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by case ID or title..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Cases with Documents - Accordion View */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading cases...</div>
            ) : filteredCases.length > 0 ? (
              <Accordion 
                type="single" 
                collapsible 
                value={expandedCase || undefined}
                onValueChange={handleAccordionChange}
              >
                {filteredCases.map((case_) => (
                  <AccordionItem key={case_.id} value={case_.id} className="border rounded-lg mb-3 px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          <FolderOpen className="h-5 w-5 text-primary" />
                          <div className="text-left">
                            <div className="font-semibold text-base">Case #{case_.id}</div>
                            <div className="text-sm text-muted-foreground">{case_.title}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(case_.status)}>
                            {case_.status}
                          </Badge>
                          <Badge variant="outline">
                            {documentsMap[case_.id]?.length || 0} documents
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pt-4 space-y-4">
                        {/* Case Details */}
                        <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <div className="text-sm text-muted-foreground">Court</div>
                            <div className="font-medium">{case_.court}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Category</div>
                            <div className="font-medium">{case_.category}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Filed Date</div>
                            <div className="font-medium">
                              {new Date(case_.filingDate).toLocaleDateString()}
                            </div>
                          </div>
                          {case_.nextHearing && (
                            <div>
                              <div className="text-sm text-muted-foreground">Next Hearing</div>
                              <div className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(case_.nextHearing).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Documents List */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold">Documents</h4>
                            {userRole === "lawyer" && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2"
                                onClick={() => navigate(`/upload?caseId=${case_.id}`)}
                              >
                                <Upload className="h-4 w-4" />
                                Upload
                              </Button>
                            )}
                          </div>
                          
                          {documentsMap[case_.id] ? (
                            documentsMap[case_.id].length > 0 ? (
                              <div className="space-y-2">
                                {documentsMap[case_.id].map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:border-primary/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <FileText className="h-5 w-5 text-primary" />
                                      <div className="flex-1">
                                        <div className="font-medium text-sm">{doc.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          Uploaded by {doc.uploadedBy} • {new Date(doc.uploadedAt).toLocaleDateString()} • {doc.size}
                                          {/* TODO: Document Classifier will auto-populate category */}
                                          {doc.category && ` • ${doc.category}`}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" className="gap-1">
                                        <Eye className="h-4 w-4" />
                                        View
                                      </Button>
                                      <Button size="sm" variant="ghost" className="gap-1">
                                        <Download className="h-4 w-4" />
                                        Download
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No documents uploaded yet</p>
                                {userRole === "lawyer" && (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="mt-3"
                                    onClick={() => navigate(`/upload?caseId=${case_.id}`)}
                                  >
                                    Upload First Document
                                  </Button>
                                )}
                              </div>
                            )
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              Loading documents...
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No cases found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.filter(c => c.status === "Active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.filter(c => c.status === "Pending Review").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.values(documentsMap).reduce((sum, docs) => sum + docs.length, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CaseFiles;
