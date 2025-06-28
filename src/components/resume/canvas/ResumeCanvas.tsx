"use client";

import React, { useMemo, forwardRef } from 'react';
import { cn } from "@/lib/utils";
import { SchemaRegistry } from "@/lib/schemaRegistry";
import { transformToRenderableView } from "@/lib/dataTransformer";
import PrintableResume from "./PrintableResume";
import { useResumeStore } from '@/stores/resumeStore';

interface ResumeCanvasProps {
  className?: string;
}

const ResumeCanvas = forwardRef<HTMLDivElement, ResumeCanvasProps>(
  ({ className }, ref) => {
    const resumeData = useResumeStore(state => state.resumeData);
    const schemaRegistry = SchemaRegistry.getInstance();
    const renderableResume = useMemo(() => 
      transformToRenderableView(resumeData, schemaRegistry), 
      [resumeData, schemaRegistry]
    );

    return (
      <div 
        ref={ref}
        id="resume-canvas-printable-area"
        data-template-id={resumeData.templateId}
        className={cn("a4-canvas printable-area", className)}
      >
        <PrintableResume resume={renderableResume} templateId={resumeData.templateId} />
      </div>
    );
  }
);

ResumeCanvas.displayName = 'ResumeCanvas';

export default ResumeCanvas;

    