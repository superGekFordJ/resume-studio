"use client";

import { RenderableResume } from "@/types/schema";
import ModernTemplate from "../templates/ModernTemplate";
import DefaultTemplate from "../templates/DefaultTemplate";
import CreativeTemplate from "../templates/CreativeTemplate";
import ContinuousNarrativeTemplate from "../templates/ContinuousNarrativeTemplate";
import ParallelModularTemplate from "../templates/ParallelModularTemplate";
import { ProClassicTemplate } from "../templates/ProClassicTemplate";
import { SapphireSidebarTemplate } from "../templates/SapphireSidebarTemplate";
import { VeridianSidebarTemplate } from "../templates/VeridianSidebarTemplate";

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
    case 'pro-classic':
      return <ProClassicTemplate resume={resume} />;
    case 'sapphire-sidebar':
      return <SapphireSidebarTemplate resume={resume} />;
    case 'veridian-sidebar':
      return <VeridianSidebarTemplate resume={resume} />;
    case 'continuous-narrative':
      return <ContinuousNarrativeTemplate resume={resume} />;
    case 'parallel-modular':
      return <ParallelModularTemplate resume={resume} />;
    case 'default-with-cover':
      // Render cover letter first, then regular resume with page break
      const hasCoverLetter = resume.sections.some(s => s.schemaId === 'cover-letter');
      if (hasCoverLetter) {
        const coverLetterSection = resume.sections.find(s => s.schemaId === 'cover-letter');
        const resumeWithoutCoverLetter = {
          ...resume,
          sections: resume.sections.filter(s => s.schemaId !== 'cover-letter')
        };
        return (
          <>
            {/* Cover Letter Page */}
            <DefaultTemplate resume={{ ...resume, sections: coverLetterSection ? [coverLetterSection] : [] }} />
            {/* Page Break for PDF */}
            <div className="page-break-before" />
            {/* Resume Page */}
            <DefaultTemplate resume={resumeWithoutCoverLetter} />
          </>
        );
      }
      return <DefaultTemplate resume={resume} />;
    case 'default':
    default:
      return <DefaultTemplate resume={resume} />;
  }
} 