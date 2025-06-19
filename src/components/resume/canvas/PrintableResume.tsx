"use client";

import { RenderableResume } from "@/types/schema";
import ModernTemplate from "../templates/ModernTemplate";
import DefaultTemplate from "../templates/DefaultTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";

interface PrintableResumeProps {
  resume: RenderableResume;
  templateId: string;
}

export default function PrintableResume({ resume, templateId }: PrintableResumeProps) {
  switch (templateId) {
    case 'modern-minimalist':
      return <ModernTemplate resume={resume} />;
    case 'creative':
      return <CreativeTemplate resume={resume} />;
    case 'default':
    default:
      return <DefaultTemplate resume={resume} />;
  }
} 