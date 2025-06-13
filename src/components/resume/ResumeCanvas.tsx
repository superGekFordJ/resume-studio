"use client";

import type { ResumeData, PersonalDetails, Section, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  className?: string;
}

// Helper to render different section item types
const renderSectionItem = (item: SectionItem, type: SectionType, templateId: string) => {
  switch (type) {
    case 'experience':
      const exp = item as ExperienceEntry;
      return (
        <div key={exp.id} className="mb-3">
          <h4 className="font-semibold text-sm">{exp.jobTitle}</h4>
          <p className="text-xs text-muted-foreground">{exp.company} | {exp.startDate} - {exp.endDate}</p>
          <p className="mt-1 text-xs whitespace-pre-line">{exp.description}</p>
        </div>
      );
    case 'education':
      const edu = item as EducationEntry;
      return (
        <div key={edu.id} className="mb-3">
          <h4 className="font-semibold text-sm">{edu.degree}</h4>
          <p className="text-xs text-muted-foreground">{edu.institution} | {edu.graduationYear}</p>
          {edu.details && <p className="mt-1 text-xs whitespace-pre-line">{edu.details}</p>}
        </div>
      );
    case 'skills':
      const skill = item as SkillEntry;
      return (
        <span key={skill.id} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">{skill.name}</span>
      );
    case 'summary':
    case 'customText':
      const custom = item as CustomTextEntry;
      return <p key={custom.id} className="text-xs mb-2 whitespace-pre-line">{custom.content}</p>;
    default:
      return null;
  }
};


// Basic template structure - this would be more complex and template-specific in a real app
const DefaultTemplate = ({ resumeData }: { resumeData: ResumeData }) => {
  const { personalDetails, sections } = resumeData;

  return (
    <div className="text-xs leading-relaxed">
      {/* Header */}
      <div className="text-center mb-4 border-b pb-2">
        <h1 className="font-headline text-2xl font-bold text-primary">{personalDetails.fullName}</h1>
        <p className="font-headline text-sm text-foreground">{personalDetails.jobTitle}</p>
      </div>

      {/* Contact Info */}
      <div className="mb-4 text-center text-[10px] flex flex-wrap justify-center gap-x-3 gap-y-1">
        {personalDetails.email && <div className="flex items-center"><Mail size={10} className="mr-1 text-muted-foreground" /> {personalDetails.email}</div>}
        {personalDetails.phone && <div className="flex items-center"><Phone size={10} className="mr-1 text-muted-foreground" /> {personalDetails.phone}</div>}
        {personalDetails.address && <div className="flex items-center"><MapPin size={10} className="mr-1 text-muted-foreground" /> {personalDetails.address}</div>}
        {personalDetails.linkedin && <div className="flex items-center"><Linkedin size={10} className="mr-1 text-muted-foreground" /> {personalDetails.linkedin}</div>}
        {personalDetails.github && <div className="flex items-center"><Github size={10} className="mr-1 text-muted-foreground" /> {personalDetails.github}</div>}
        {personalDetails.portfolio && <div className="flex items-center"><Globe size={10} className="mr-1 text-muted-foreground" /> {personalDetails.portfolio}</div>}
      </div>
      
      {/* Sections */}
      {sections.map((section) => (
        section.visible && (
          <div key={section.id} className="mb-3">
            <h3 className="font-headline text-base font-semibold text-primary border-b border-primary/50 mb-1 pb-0.5">{section.title}</h3>
            {section.type === 'skills' ? (
              <div>
                {section.items.map(item => renderSectionItem(item, section.type, resumeData.templateId))}
              </div>
            ) : (
              section.items.map(item => renderSectionItem(item, section.type, resumeData.templateId))
            )}
          </div>
        )
      ))}
    </div>
  );
};


export default function ResumeCanvas({ resumeData, className }: ResumeCanvasProps) {
  const CurrentTemplate = DefaultTemplate; // Later, this could be dynamic based on resumeData.templateId

  return (
    <div id="resume-canvas-printable-area" className={cn("a4-canvas printable-area", className)}>
      <CurrentTemplate resumeData={resumeData} />
    </div>
  );
}

    