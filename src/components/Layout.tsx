
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Clock from './Clock';

interface LayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, sidebar, title }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <Clock />
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
