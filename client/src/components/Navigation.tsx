import { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { FileText, Search, Menu, X, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Badge } from "./ui/badge";

interface NavigationProps {
  currentView: "upload" | "query";
  onViewChange: (view: "upload" | "query") => void;
  documentCount: number;
}

export function Navigation({
  currentView,
  onViewChange,
  documentCount,
}: NavigationProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      id: "upload" as const,
      label: "Upload & Organize",
      icon: Upload,
      description: "Upload and organize documents with AI",
    },
    {
      id: "query" as const,
      label: "Query Documents",
      icon: Search,
      description: "AI-powered document analysis and search",
      badge: documentCount > 0 ? documentCount : undefined,
    },
  ];

  const NavItems = () => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;

        return (
          <Button
            key={item.id}
            variant={isActive ? "default" : "ghost"}
            className={`justify-start gap-3 ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => {
              onViewChange(item.id);
              setIsOpen(false);
            }}
          >
            <Icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
            {item.badge && (
              <Badge
                variant="secondary"
                className="ml-auto bg-blue-100 text-blue-800"
              >
                {item.badge}
              </Badge>
            )}
          </Button>
        );
      })}
    </>
  );

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">LegalDocs AI</h1>
            </div>
            {user && (
              <div className="hidden sm:block">
                <span className="text-sm text-gray-500">
                  Welcome back,{" "}
                  {user.firstName ||
                    user.emailAddresses[0].emailAddress.split("@")[0]}
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItems />
            <div className="ml-4 pl-4 border-l border-gray-200">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <NavItems />
                </div>
                {user && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      Signed in as {user.emailAddresses[0].emailAddress}
                    </div>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
