import { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  FolderOpen,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";

interface Category {
  name: string;
  count: number;
  status: "complete" | "analyzing" | "waiting";
  description: string;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  category?: string;
  confidence?: number;
}

interface DocumentUploadCenterProps {
  onUpload: (files: FileList) => void;
  categories: Category[];
}

export function DocumentUploadCenter({
  onUpload,
  categories,
}: DocumentUploadCenterProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "complete"
  >("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileUpload(files);
      }
    },
    []
  );

  const handleFileUpload = (files: FileList) => {
    const newFiles: UploadFile[] = Array.from(files).map((file, index) => ({
      id: Date.now().toString() + index,
      file,
      progress: 0,
      status: "uploading",
    }));

    setUploadFiles((prev) => [...prev, ...newFiles]);
    setCurrentStep("processing");
    onUpload(files);

    // Simulate upload and processing
    newFiles.forEach((uploadFile, index) => {
      // Upload phase
      const uploadInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) => {
            if (f.id === uploadFile.id && f.status === "uploading") {
              const newProgress = Math.min(f.progress + 15, 100);
              if (newProgress === 100) {
                clearInterval(uploadInterval);
                // Start processing phase
                setTimeout(() => {
                  setUploadFiles((prev) =>
                    prev.map((file) =>
                      file.id === uploadFile.id
                        ? {
                            ...file,
                            status: "processing",
                            category: getRandomCategory(),
                          }
                        : file
                    )
                  );

                  // Complete processing
                  setTimeout(() => {
                    setUploadFiles((prev) =>
                      prev.map((file) =>
                        file.id === uploadFile.id
                          ? {
                              ...file,
                              status: "complete",
                              confidence: Math.floor(Math.random() * 10) + 90,
                            }
                          : file
                      )
                    );
                  }, 2000 + index * 500);
                }, 500);
              }
              return { ...f, progress: newProgress };
            }
            return f;
          })
        );
      }, 150 + index * 50);
    });
  };

  const getRandomCategory = () => {
    const availableCategories = [
      "Formation",
      "Governance",
      "Cap Table",
      "Intellectual Property",
    ];
    return availableCategories[
      Math.floor(Math.random() * availableCategories.length)
    ];
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
    if (uploadFiles.length === 1) {
      setCurrentStep("upload");
    }
  };

  const resetUpload = () => {
    setUploadFiles([]);
    setCurrentStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "uploading":
        return <Upload className="h-5 w-5 text-blue-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusMessage = (file: UploadFile) => {
    switch (file.status) {
      case "uploading":
        return `Uploading... ${file.progress}%`;
      case "processing":
        return "Jessica is analyzing and categorizing...";
      case "complete":
        return `Organized with ${file.confidence}% confidence`;
      case "error":
        return "Upload failed - please try again";
      default:
        return "";
    }
  };

  const completedFiles = uploadFiles.filter((f) => f.status === "complete");
  const processingFiles = uploadFiles.filter(
    (f) => f.status === "processing" || f.status === "uploading"
  );
  const totalFiles = uploadFiles.length;
  const overallProgress =
    totalFiles > 0 ? (completedFiles.length / totalFiles) * 100 : 0;

  // Check if all files are complete
  const allComplete = totalFiles > 0 && completedFiles.length === totalFiles;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Legal Document Intelligence Center
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Upload your legal documents and watch Jessica AI automatically
          organize, categorize, and prepare them for intelligent analysis.
        </p>
      </div>

      {/* Progress Overview */}
      {totalFiles > 0 && (
        <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Processing {totalFiles} document{totalFiles !== 1 ? "s" : ""}
                </h3>
                <p className="text-gray-600">
                  {completedFiles.length} completed • {processingFiles.length}{" "}
                  in progress
                </p>
              </div>
              {allComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">All Complete!</span>
                </div>
              )}
            </div>
            <Progress value={overallProgress} className="h-3 mb-2" />
            <div className="text-sm text-gray-500">
              {Math.round(overallProgress)}% complete
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {currentStep === "upload" && (
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
              <CardContent className="p-0">
                <div
                  className={`p-12 text-center transition-all duration-300 ${
                    isDragOver
                      ? "bg-blue-50 border-blue-400 scale-105"
                      : "hover:bg-gray-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    Drop your legal documents here
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Drag and drop files or click to browse. Jessica supports
                    PDFs, Word documents, and more.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button size="lg" className="cursor-pointer">
                      <FolderOpen className="w-5 h-5 mr-2" />
                      Choose Files
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Processing List */}
          {uploadFiles.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Document Processing
                </CardTitle>
                {allComplete && (
                  <Button variant="outline" size="sm" onClick={resetUpload}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Upload More
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      uploadFile.status === "complete"
                        ? "border-green-200 bg-green-50"
                        : uploadFile.status === "processing"
                        ? "border-blue-200 bg-blue-50"
                        : uploadFile.status === "uploading"
                        ? "border-blue-200 bg-blue-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(uploadFile.status)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {uploadFile.file.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                          {uploadFile.category && (
                            <Badge variant="secondary" className="mt-2">
                              {uploadFile.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(uploadFile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {uploadFile.status === "uploading" && (
                      <div className="mt-3">
                        <Progress value={uploadFile.progress} className="h-2" />
                      </div>
                    )}

                    <div className="mt-2 text-sm text-gray-600">
                      {getStatusMessage(uploadFile)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Success Actions */}
          {allComplete && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Documents Successfully Organized!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Jessica has analyzed and categorized all your documents. You
                    can now query them or upload additional files.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Querying
                    </Button>
                    <Button variant="outline" onClick={resetUpload}>
                      Upload More Documents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Categories Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Document Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((category) => {
                const hasDocuments = uploadFiles.some(
                  (f) => f.category === category.name && f.status === "complete"
                );
                const isAnalyzing = uploadFiles.some(
                  (f) =>
                    f.category === category.name && f.status === "processing"
                );

                return (
                  <div
                    key={category.name}
                    className={`p-4 rounded-lg border transition-all duration-300 ${
                      hasDocuments
                        ? "border-green-200 bg-green-50"
                        : isAnalyzing
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {category.name}
                      </h4>
                      {hasDocuments && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {
                            uploadFiles.filter(
                              (f) =>
                                f.category === category.name &&
                                f.status === "complete"
                            ).length
                          }
                        </Badge>
                      )}
                      {isAnalyzing && (
                        <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro tip:</strong> Upload documents in batches by category
              for better organization. Jessica learns from your document
              patterns and improves over time.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
