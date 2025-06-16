"use client";

import type { ResumeData, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry, SectionType, ResumeSection, isExtendedResumeData, isLegacyResumeData } from "@/types/resume";
import type { DynamicResumeSection, DynamicSectionItem } from "@/types/schema";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";
import ModernTemplate from "./ModernTemplate"; // Import the new template
import { SchemaRegistry } from "@/lib/schemaRegistry";

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

// Helper to render dynamic section items
const renderDynamicSectionItem = (item: DynamicSectionItem, schemaId: string, templateId: string) => {
  const schemaRegistry = SchemaRegistry.getInstance();
  const sectionSchema = schemaRegistry.getSectionSchema(schemaId);
  
  if (!sectionSchema) {
    return <div key={item.id} className="text-xs text-muted-foreground">Unknown schema: {schemaId}</div>;
  }

  // Handle different schema types
  switch (schemaId) {
    case 'advanced-skills':
      return (
        <div key={item.id} className="mb-3">
          <h4 className="font-semibold text-sm">{item.data.category}</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {Array.isArray(item.data.skills) ? item.data.skills.map((skill: string, index: number) => (
              <span key={index} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                {skill}
              </span>
            )) : (
              <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                {item.data.skills}
              </span>
            )}
          </div>
          {item.data.proficiency && (
            <p className="text-xs text-muted-foreground mt-1">Level: {item.data.proficiency}</p>
          )}
          {item.data.yearsOfExperience && (
            <p className="text-xs text-muted-foreground">Experience: {item.data.yearsOfExperience} years</p>
          )}
        </div>
      );
    
    case 'projects':
      return (
        <div key={item.id} className="mb-3">
          <h4 className="font-semibold text-sm">{item.data.name}</h4>
          {item.data.url && (
            <p className="text-xs text-muted-foreground">{item.data.url}</p>
          )}
          {item.data.description && (
            <p className="mt-1 text-xs whitespace-pre-line">{item.data.description}</p>
          )}
          {item.data.technologies && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.isArray(item.data.technologies) ? item.data.technologies.map((tech: string, index: number) => (
                <span key={index} className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-1 mb-1">
                  {tech}
                </span>
              )) : (
                <span className="inline-block bg-primary/10 text-primary text-xs px-2 py-1 rounded mr-1 mb-1">
                  {item.data.technologies}
                </span>
              )}
            </div>
          )}
        </div>
      );
    
    default:
      // Generic rendering for unknown dynamic sections
      return (
        <div key={item.id} className="mb-3">
          {sectionSchema.fields.map(field => {
            const value = item.data[field.id];
            if (!value) return null;
            
            return (
              <div key={field.id} className="mb-1">
                <span className="font-medium text-xs">{field.label}: </span>
                {Array.isArray(value) ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {value.map((v, index) => (
                      <span key={index} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded mr-1 mb-1">
                        {v}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs">{value}</span>
                )}
              </div>
            );
          })}
        </div>
      );
  }
};

// Helper to render any section (legacy or dynamic)
const renderSection = (section: ResumeSection | DynamicResumeSection, templateId: string) => {
  if ('type' in section) {
    // Legacy section
    const legacySection = section as ResumeSection;
    return (
      <div key={section.id} className="mb-3">
        <h3 className="font-headline text-[13px] font-semibold text-primary border-b border-primary/50 mb-2 pb-0.5">{section.title}</h3>
        {legacySection.type === 'skills' ? (
          <div className="flex flex-wrap gap-1">
            {legacySection.items.map(item => renderSectionItem(item, legacySection.type, templateId))}
          </div>
        ) : (
          legacySection.items.map(item => renderSectionItem(item, legacySection.type, templateId))
        )}
      </div>
    );
  } else {
    // Dynamic section
    const dynamicSection = section as DynamicResumeSection;
    const schemaRegistry = SchemaRegistry.getInstance();
    const sectionSchema = schemaRegistry.getSectionSchema(dynamicSection.schemaId);
    
    return (
      <div key={section.id} className="mb-3">
        <h3 className="font-headline text-[13px] font-semibold text-primary border-b border-primary/50 mb-2 pb-0.5">{section.title}</h3>
        {sectionSchema?.id === 'advanced-skills' ? (
          // Special handling for advanced skills to group them nicely
          <div className="space-y-2">
            {dynamicSection.items.map(item => renderDynamicSectionItem(item, dynamicSection.schemaId, templateId))}
          </div>
        ) : (
          dynamicSection.items.map(item => renderDynamicSectionItem(item, dynamicSection.schemaId, templateId))
        )}
      </div>
    );
  }
};

// Basic template structure - this would be more complex and template-specific in a real app
const DefaultTemplate = ({ resumeData }: { resumeData: ResumeData }) => {
  const { personalDetails, sections } = resumeData;

  return (
    <div className="text-[11px] leading-[1.4] h-full">
      {/* Header */}
      <div className="text-center mb-4 border-b pb-3">
        <div className="flex flex-col items-center gap-3">
          {/* Avatar */}
          {personalDetails.avatar && (
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              <img 
                src={personalDetails.avatar} 
                alt={personalDetails.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div>
            <h1 className="font-headline text-2xl font-bold text-primary mb-1">{personalDetails.fullName}</h1>
            <p className="font-headline text-sm text-foreground">{personalDetails.jobTitle}</p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="mb-4 text-center text-[9px] flex flex-wrap justify-center gap-x-3 gap-y-1">
        {personalDetails.email && <div className="flex items-center"><Mail size={9} className="mr-1 text-muted-foreground" /> {personalDetails.email}</div>}
        {personalDetails.phone && <div className="flex items-center"><Phone size={9} className="mr-1 text-muted-foreground" /> {personalDetails.phone}</div>}
        {personalDetails.address && <div className="flex items-center"><MapPin size={9} className="mr-1 text-muted-foreground" /> {personalDetails.address}</div>}
        {personalDetails.linkedin && <div className="flex items-center"><Linkedin size={9} className="mr-1 text-muted-foreground" /> {personalDetails.linkedin}</div>}
        {personalDetails.github && <div className="flex items-center"><Github size={9} className="mr-1 text-muted-foreground" /> {personalDetails.github}</div>}
        {personalDetails.portfolio && <div className="flex items-center"><Globe size={9} className="mr-1 text-muted-foreground" /> {personalDetails.portfolio}</div>}
      </div>
      
      {/* Sections */}
      {sections.map((section) => (
        section.visible && renderSection(section, resumeData.templateId)
      ))}
    </div>
  );
};

export default function ResumeCanvas({ resumeData, className }: ResumeCanvasProps) {
  let CurrentTemplate;
  switch (resumeData.templateId) {
    case 'modern-minimalist':
      CurrentTemplate = ModernTemplate;
      break;
    case 'default':
    default:
      CurrentTemplate = DefaultTemplate;
      break;
  }

  return (
    <div id="resume-canvas-printable-area" className={cn("a4-canvas printable-area", className)}>
      <CurrentTemplate resumeData={resumeData} />
    </div>
  );
}

    