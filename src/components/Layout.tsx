
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string; // Added title prop
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, title }) => {
  // Title is now available as a prop but we're not using it in the rendering yet
  // This is just to make TypeScript happy with the prop being passed
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      {/* Main content with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {sidebar}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      
      <Toaster />
      <Sonner />
    </div>
  );
};

export default Layout;
