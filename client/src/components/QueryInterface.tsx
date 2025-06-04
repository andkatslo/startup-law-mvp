import { useState } from "react";
import { Send, Brain, FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Document {
  id: string;
  name: string;
  category: string;
  size: string;
  type: string;
  uploadDate: string;
  confidence: number;
  status: "organized" | "processing";
}

interface QueryInterfaceProps {
  documents: Document[];
}

export function QueryInterface({ documents }: QueryInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const organizedDocuments = documents.filter(
    (doc) => doc.status === "organized"
  );
  const hasDocuments = organizedDocuments.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 3000);
  };

  const goToUpload = () => {
    // This would typically be handled by the parent component
    window.location.hash = "#upload";
  };

  const suggestedQueries = [
    "What are the voting requirements for board decisions?",
    "What is our intellectual property assignment policy?",
    "What are the vesting schedules for employees?",
    "What are the indemnification provisions for directors?",
    "What compliance requirements do we need to meet?",
    "What are the termination clauses in employment agreements?",
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI Legal Document Query
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Ask questions about your legal documents and get instant, accurate
          answers powered by Jessica AI's deep understanding of legal
          terminology and context.
        </p>
      </div>

      {!hasDocuments ? (
        /* Empty State */
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No documents available for querying
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Upload and organize your legal documents first to start asking
              questions and getting AI-powered analysis and insights.
            </p>
            <Button onClick={goToUpload} size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go to Upload Documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Document Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Query {organizedDocuments.length} Document
                    {organizedDocuments.length !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-gray-600">
                    Jessica has analyzed your documents and is ready to answer
                    questions
                  </p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="w-6 h-6" />
                  <span className="font-medium">AI Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Query Interface */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    Ask Jessica AI
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question about your legal documents..."
                        className="w-full px-4 py-4 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        disabled={isAnalyzing}
                      />
                      <button
                        type="submit"
                        disabled={!query.trim() || isAnalyzing}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAnalyzing ? (
                          <Sparkles className="w-5 h-5 animate-pulse" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {isAnalyzing && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center gap-2 text-blue-600">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span>Jessica is analyzing your documents...</span>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Suggested Queries */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suggestedQueries.map((suggestedQuery, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(suggestedQuery)}
                        className="p-3 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        disabled={isAnalyzing}
                      >
                        {suggestedQuery}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Query Results */}
              {showResults && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <Sparkles className="w-5 h-5" />
                      Analysis Complete
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-700">
                        <strong>Query:</strong> {query}
                      </p>
                      <div className="p-4 bg-white rounded-lg border">
                        <p className="text-gray-600 italic">
                          AI-powered analysis results will appear here. Jessica
                          will provide detailed answers based on your uploaded
                          legal documents, including relevant citations and
                          confidence scores.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Document Categories Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Available Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {organizedDocuments.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-gray-50 rounded-lg border"
                    >
                      <h4 className="font-medium text-gray-900 text-sm truncate">
                        {doc.name}
                      </h4>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {doc.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {doc.confidence}% confidence
                        </span>
                      </div>
                    </div>
                  ))}
                  {organizedDocuments.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{organizedDocuments.length - 5} more documents
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-purple-900 mb-1">
                        Pro Tips
                      </h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Be specific in your questions</li>
                        <li>• Ask about specific clauses or terms</li>
                        <li>• Reference document types or categories</li>
                        <li>• Ask for comparisons between documents</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
