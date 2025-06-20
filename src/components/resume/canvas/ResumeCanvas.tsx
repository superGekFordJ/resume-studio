"use client";

import React, { useMemo, forwardRef } from 'react';
import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";
import { SchemaRegistry } from "@/lib/schemaRegistry";
import { transformToRenderableView } from "@/lib/dataTransformer";
import PrintableResume from "./PrintableResume";
import { templates } from '@/types/resume';

interface ResumeCanvasProps {
  resumeData: ResumeData;
  className?: string;
}

const ResumeCanvas = forwardRef<HTMLDivElement, ResumeCanvasProps>(
  ({ resumeData, className }, ref) => {
    const schemaRegistry = SchemaRegistry.getInstance();
    const renderableResume = useMemo(() => 
      transformToRenderableView(resumeData, schemaRegistry), 
      [resumeData, schemaRegistry]
    );

    const isFullBleed = templates.find(t => t.id === resumeData.templateId)?.fullBleed;

    return (
      <div 
        ref={ref}
        id="resume-canvas-printable-area" 
        className={cn(
          "a4-canvas printable-area",
          { "full-bleed": isFullBleed },
          className
        )}
      >
        <PrintableResume resume={renderableResume} templateId={resumeData.templateId} />
      </div>
    );
  }
);

ResumeCanvas.displayName = 'ResumeCanvas';

export default ResumeCanvas;

    