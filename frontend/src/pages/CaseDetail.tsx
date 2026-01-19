import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCaseById, type Case } from "@/lib/api";

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "summary" | "evidence" | "timeline"
  >("summary");

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!id) {
        throw new Error("No case ID provided in URL");
      }
      const data = await fetchCaseById(id);
      setCaseData(data);
      console.log("Case data loaded:", data);
    } catch (err) {
      console.error("Failed to load case data:", err);
      setError(err instanceof Error ? err.message : "Failed to load case data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-600 mb-4">
          Error Loading Case
        </div>
        <div className="text-gray-600">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-xl font-semibold mb-4">Case Not Found</div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Helper function to safely access nested properties with fallback values
  const getNestedValue = (obj: any, path: string, fallback: any = "N/A") => {
    const keys = path.split(".");
    return (
      keys.reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : null),
        obj,
      ) || fallback
    );
  };

  const getTimelineEvents = () => {
    return getNestedValue(caseData, "Public.timeline_of_proceedings", []).map(
      (item: any, idx: number) => ({
        date: item?.date || `Event ${idx + 1}`,
        event: item?.event || "No details available",
      }),
    );
  };

  const tabButtonClass = (tab: string) =>
    `px-4 py-2 font-medium ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-gray-600"}`;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 flex items-center gap-2 text-sm font-medium bg-accent/20 hover:bg-accent/30 rounded-md transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {caseData.CaseName ||
              caseData.Public?.case_summary?.substring(0, 50) ||
              `Case #${caseData.CaseID?.substring(0, 8) || caseData._id.substring(0, 8)}`}
          </h1>
          <p className="text-xs text-muted-foreground/70 mb-1">
            ID: {caseData.CaseID || caseData._id}
          </p>
          <p className="text-muted-foreground">
            {getNestedValue(caseData, "Public.case_type", "Case")} • Filed:{" "}
            {new Date(caseData.createdAt || new Date()).toLocaleDateString()}
          </p>
        </div>
        <Badge className="px-3 py-1 text-sm">
          {getNestedValue(caseData, "Public.case_status", "").split(".")[0] ||
            "Active"}
        </Badge>
      </div>

      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={tabButtonClass("summary")}
            onClick={() => setActiveTab("summary")}
          >
            Case Summary
          </button>
          <button
            className={tabButtonClass("evidence")}
            onClick={() => setActiveTab("evidence")}
          >
            Evidence
          </button>
          <button
            className={tabButtonClass("timeline")}
            onClick={() => setActiveTab("timeline")}
          >
            Timeline
          </button>
        </div>
      </div>

      {activeTab === "summary" && (
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                {getNestedValue(
                  caseData,
                  "Public.case_summary",
                  "No case summary available.",
                )}
              </p>

              <h3 className="font-semibold text-lg mt-4">Court Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-muted-foreground">Court</h4>
                  <p>
                    {getNestedValue(
                      caseData,
                      "Public.court_details.name",
                      "Not specified",
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">
                    Presiding Judge
                  </h4>
                  <p>
                    {getNestedValue(
                      caseData,
                      "Public.court_details.presiding_judge",
                      "Not assigned",
                    )}
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-lg mt-4">Parties Involved</h3>
              <div>
                <h4 className="font-medium text-muted-foreground">
                  Prosecution/Plaintiff
                </h4>
                <ul className="list-disc list-inside pl-2">
                  {getNestedValue(caseData, "Public.parties.prosecution", [])
                    .length > 0 ? (
                    getNestedValue(
                      caseData,
                      "Public.parties.prosecution",
                      [],
                    ).map((party: string, idx: number) => (
                      <li key={idx}>{party}</li>
                    ))
                  ) : (
                    <li>No prosecution/plaintiff information</li>
                  )}
                </ul>

                <h4 className="font-medium text-muted-foreground mt-2">
                  Defendant
                </h4>
                <ul className="list-disc list-inside pl-2">
                  {getNestedValue(caseData, "Public.parties.defendant", [])
                    .length > 0 ? (
                    getNestedValue(
                      caseData,
                      "Public.parties.defendant",
                      [],
                    ).map((party: string, idx: number) => (
                      <li key={idx}>{party}</li>
                    ))
                  ) : (
                    <li>No defendant information</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Case Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium text-muted-foreground">
                    Case Type
                  </h4>
                  <p>
                    {getNestedValue(
                      caseData,
                      "Public.case_type",
                      "Not specified",
                    )}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Lawyer</h4>
                  <p>{caseData.LawyerID || "Not assigned"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Judge</h4>
                  <p>{caseData.JudgeID || "Not assigned"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">Client</h4>
                  <p>{caseData.UserID || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground">
                    Created On
                  </h4>
                  <p>
                    {new Date(
                      caseData.createdAt || new Date(),
                    ).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                {getTimelineEvents().length > 0 ? (
                  <div>
                    <p className="font-medium">
                      {
                        getTimelineEvents()[getTimelineEvents().length - 1]
                          ?.event
                      }
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {
                        getTimelineEvents()[getTimelineEvents().length - 1]
                          ?.date
                      }
                    </p>
                  </div>
                ) : (
                  <p>No upcoming events scheduled</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                {getNestedValue(
                  caseData,
                  "Private.evidence_summary",
                  "No evidence summary available.",
                )}
              </p>
            </CardContent>
          </Card>

          {Object.entries(caseData.Evidence || {}).map(([category, items]) => {
            // Skip empty evidence categories
            if (!Array.isArray(items) || items.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>
                    {category
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {items.map((item: string, idx: number) => (
                      <li
                        key={idx}
                        className="p-3 border rounded-md bg-accent/5"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}

          {Object.values(caseData.Evidence || {}).flat().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No evidence items available
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === "timeline" && (
        <Card>
          <CardHeader>
            <CardTitle>Case Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {getTimelineEvents().length > 0 ? (
                getTimelineEvents().map((event: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="min-w-[120px] font-medium">
                      {event.date}
                    </div>
                    <div className="flex-1">
                      <div className="h-full border-l-2 border-border pl-4 pb-6 relative">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[6.5px] top-1"></div>
                        {event.event}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-muted-foreground">
                  No timeline events available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
