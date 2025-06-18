"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarNavigatorProps {
  childrenStructure: React.ReactNode;
  childrenContent: React.ReactNode;
  isEditing: boolean;
  onBack: () => void;
}

export default function SidebarNavigator({
  childrenStructure,
  childrenContent,
  isEditing,
  onBack,
}: SidebarNavigatorProps) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Structure View */}
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-200 ease-in-out",
          isEditing ? "-translate-x-full" : "translate-x-0"
        )}
      >
        {childrenStructure}
      </div>
      
      {/* Content View */}
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-200 ease-in-out",
          isEditing ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Back button header */}
        {isEditing && (
          <div className="flex items-center gap-2 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className={cn("h-full", isEditing ? "pt-0" : "")}>
          {childrenContent}
        </div>
      </div>
    </div>
  );
} 