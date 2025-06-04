import { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigation } from "./components/Navigation";
import { DocumentUploadCenter } from "./components/DocumentUploadCenter";
import { QueryInterface } from "./components/QueryInterface";
import { Card, CardContent } from "./components/ui/card";
import { FileText, Shield, Sparkles } from "lucide-react";
import "./App.css";

interface Category {
  name: string;
  count: number;
  status: "complete" | "analyzing" | "waiting";
  description: string;
}

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

function App() {
  const [currentView, setCurrentView] = useState<"upload" | "query">("upload");
  const [documents, setDocuments] = useState<Document[]>([]);

  const [categories, setCategories] = useState<Category[]>([
    {
      name: "Formation",
      count: 0,
      status: "waiting",
      description: "Articles of incorporation, bylaws, and founding documents",
    },
    {
      name: "Governance",
      count: 0,
      status: "waiting",
      description:
        "Board resolutions, meeting minutes, and governance policies",
    },
    {
      name: "Directors & Officers",
      count: 0,
      status: "waiting",
      description:
        "D&O insurance, indemnification agreements, and officer appointments",
    },
    {
      name: "Cap Table",
      count: 0,
      status: "waiting",
      description:
        "Stock certificates, option grants, and equity documentation",
    },
    {
      name: "Employees",
      count: 0,
      status: "waiting",
      description: "Employment agreements, offer letters, and HR policies",
    },
    {
      name: "Intellectual Property",
      count: 0,
      status: "waiting",
      description: "Patents, trademarks, copyrights, and IP assignments",
    },
    {
      name: "Compliance",
      count: 0,
      status: "waiting",
      description: "Regulatory filings, licenses, and compliance documentation",
    },
  ]);

  const handleDocumentUpload = (files: FileList) => {
    // Simulate document processing
    Array.from(files).forEach((file, index) => {
      const newDoc = {
        id: Date.now().toString() + index,
        name: file.name,
        category: "Processing...",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        type: file.type.includes("pdf") ? "PDF" : "DOC",
        uploadDate: "Just now",
        confidence: 0,
        status: "processing" as const,
      };

      setDocuments((prev) => [newDoc, ...prev]);

      // Simulate AI processing
      setTimeout(() => {
        const availableCategories = [
          "Formation",
          "Governance",
          "Cap Table",
          "Intellectual Property",
        ];
        const finalCategory =
          availableCategories[
            Math.floor(Math.random() * availableCategories.length)
          ];

        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id
              ? {
                  ...doc,
                  category: finalCategory,
                  confidence: Math.floor(Math.random() * 10) + 90,
                  status: "organized" as const,
                }
              : doc
          )
        );

        // Update category count
        setCategories((prev) =>
          prev.map((cat) =>
            cat.name === finalCategory
              ? { ...cat, count: cat.count + 1, status: "complete" }
              : cat
          )
        );
      }, 2000 + index * 1000);
    });
  };

  const totalDocuments = documents.filter(
    (doc) => doc.status === "organized"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                LegalDocs AI
              </h1>
              <p className="text-gray-600 mb-8">
                Intelligent legal document management for startups
              </p>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Welcome to LegalDocs AI
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Sign in to start organizing your legal documents with
                        AI-powered analysis and intelligent categorization.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-green-500" />
                        <span>Enterprise-grade security</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>AI-powered categorization</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Sparkles className="h-4 w-4 text-purple-500" />
                        <span>Intelligent document queries</span>
                      </div>
                    </div>

                    <SignInButton mode="modal">
                      <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                        Sign In to Continue
                      </button>
                    </SignInButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
          documentCount={totalDocuments}
        />

        {/* Main Content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">
          {currentView === "upload" && (
            <DocumentUploadCenter
              onUpload={handleDocumentUpload}
              categories={categories}
            />
          )}
          {currentView === "query" && <QueryInterface documents={documents} />}
        </main>
      </SignedIn>
    </div>
  );
}

export default App;
