"use client";

import React, { useMemo } from 'react';
import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";
import { SchemaRegistry } from "@/lib/schemaRegistry";
import { transformToRenderableView } from "@/lib/dataTransformer";
import PrintableResume from "./PrintableResume";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  className?: string;
}

export default function ResumeCanvas({ resumeData, className }: ResumeCanvasProps) {
  const schemaRegistry = SchemaRegistry.getInstance();
  const renderableResume = useMemo(() => 
    transformToRenderableView(resumeData, schemaRegistry), 
    [resumeData, schemaRegistry]
  );

  return (
    <div id="resume-canvas-printable-area" className={cn("a4-canvas printable-area", className)}>
      <PrintableResume resume={renderableResume} templateId={resumeData.templateId} />
    </div>
  );
}

    