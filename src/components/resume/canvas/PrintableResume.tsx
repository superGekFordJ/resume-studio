"use client";

import { RenderableResume } from "@/types/schema";
import ModernTemplate from "../templates/ModernTemplate";

interface PrintableResumeProps {
  resume: RenderableResume;
  templateId: string;
}

// Default template for fallback
const DefaultTemplate = ({ resume }: { resume: RenderableResume }) => {
  return (
    <div className="text-[11px] leading-[1.4] h-full">
      {/* Header */}
      <div className="text-center mb-4 border-b pb-3">
        <h1 className="font-headline text-2xl font-bold text-primary mb-1">{resume.personalDetails.fullName}</h1>
        <p className="font-headline text-sm text-foreground">{resume.personalDetails.jobTitle}</p>
      </div>

      {/* Contact Info */}
      <div className="mb-4 text-center text-[9px]">
        {resume.personalDetails.email} | {resume.personalDetails.phone}
        {resume.personalDetails.address && ` | ${resume.personalDetails.address}`}
      </div>
      
      {/* Sections */}
      {resume.sections.map((section) => (
        <div key={section.id} className="mb-3">
          <h3 className="font-headline text-[13px] font-semibold text-primary border-b border-primary/50 mb-2 pb-0.5">
            {section.title}
          </h3>
          {section.items.map(item => (
            <div key={item.id} className="mb-2">
              {item.fields.map(field => (
                <div key={field.key}>
                  {Array.isArray(field.value) ? (
                    <span>{field.value.join(', ')}</span>
                  ) : (
                    <span>{field.value}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default function PrintableResume({ resume, templateId }: PrintableResumeProps) {
  switch (templateId) {
    case 'modern-minimalist':
      return <ModernTemplate resume={resume} />;
    case 'default':
    default:
      return <DefaultTemplate resume={resume} />;
  }
} 