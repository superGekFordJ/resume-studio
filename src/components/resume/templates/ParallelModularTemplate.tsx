"use client";

import { RenderableResume, RenderableSection } from "@/types/schema";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { SimpleListComponent } from '../rendering/SimpleListComponent';
import { SingleTextComponent } from '../rendering/SingleTextComponent';
import { ProjectItemComponent } from '../rendering/ProjectItemComponent';
import { CertificationItemComponent } from '../rendering/CertificationItemComponent';
import { AdvancedSkillsComponent } from '../rendering/AdvancedSkillsComponent';

interface ParallelModularTemplateProps {
  resume: RenderableResume;
}

// Reusable rendering dispatcher following the hybrid pattern
const renderSectionByRenderType = (section: RenderableSection) => {
  // Template-specific overrides for the "Capability Hub" feel
  const templateLayoutMap: Record<string, string> = {
    'skills': 'badge-list', // Override to badge-list for capability hub feel
    'advanced-skills': 'advanced-skills-list', // Use specialized advanced skills rendering
    'languages': 'badge-list', // Languages as badges too
    'projects': 'project-list',
    'certifications': 'certification-list'
  };

  // Use template override if exists, otherwise use schema default
  const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType || 'default';

  switch (finalRenderType) {
    case 'simple-list':
      return <SimpleListComponent items={section.items} />;
    case 'badge-list':
      return <BadgeListComponent items={section.items} />;
    case 'timeline':
      return section.items.map(item => <TitledBlockComponent key={item.id} item={item} />);
    case 'single-text':
    case 'customText':
      return <SingleTextComponent items={section.items} />;
    case 'project-list':
      return section.items.map(item => <ProjectItemComponent key={item.id} item={item} />);
    case 'certification-list':
      return section.items.map(item => <CertificationItemComponent key={item.id} item={item} />);
    case 'advanced-skills-list':
      return section.items.map(item => <AdvancedSkillsComponent key={item.id} item={item} />);
    default:
      // Generic fallback rendering
      return section.items.map(item => (
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
      ));
  }
};

const ParallelModularTemplate = ({ resume }: ParallelModularTemplateProps) => {
  const { personalDetails, sections } = resume;

  // Define which sections go into which column based on their function
  const timelineSections = ['work-experience', 'education', 'projects']; // The narrative
  const capabilitySections = ['summary', 'customText', 'skills', 'languages', 'awards', 'certifications', 'advanced-skills']; // The inventory
  
  const mainColumnSections = sections.filter(s => timelineSections.includes(s.schemaId));
  const sideColumnSections = sections.filter(s => capabilitySections.includes(s.schemaId));

  return (
    <div className="text-[11px] leading-[1.4] h-full flex flex-col">
      {/* High-Impact Header */}
      <div className="bg-gray-900 text-white px-[25mm] py-6 mb-0">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          {personalDetails.avatar && (
            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white/30 flex-shrink-0">
              <img 
                src={personalDetails.avatar} 
                alt={personalDetails.fullName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Name and Title */}
          <div className="flex-grow">
            <h1 className="font-bold text-2xl mb-1">{personalDetails.fullName}</h1>
            <p className="text-lg text-gray-300">{personalDetails.jobTitle}</p>
          </div>
        </div>

        {/* Contact Info Bar */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-[10px] text-gray-300">
          {personalDetails.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} />
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} />
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={12} />
              <span>{personalDetails.linkedin}</span>
            </div>
          )}
          {personalDetails.github && (
            <div className="flex items-center gap-1">
              <Github size={12} />
              <span>{personalDetails.github}</span>
            </div>
          )}
          {personalDetails.portfolio && (
            <div className="flex items-center gap-1">
              <Globe size={12} />
              <span>{personalDetails.portfolio}</span>
            </div>
          )}
          {personalDetails.address && (
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{personalDetails.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Body */}
      <div className="flex-1 flex gap-0">
        {/* Main Column - Timeline/Narrative (2/3 width) */}
        <div className="w-2/3 pl-[25mm] pr-3 py-6">
          {mainColumnSections.map((section) => (
            <div key={section.id} className="mb-6">
              <h2 className="font-bold text-sm uppercase tracking-wider text-gray-700 border-b-2 border-gray-300 pb-1 mb-3">
                {section.title}
              </h2>
              {renderSectionByRenderType(section)}
            </div>
          ))}
        </div>

        {/* Side Column - Capability Hub (1/3 width) */}
        <div className="w-1/3 bg-gray-50 pr-[13mm] pl-3 py-6 border-l border-gray-200">
          {sideColumnSections.map((section) => (
            <div key={section.id} className="mb-6">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-600 mb-3">
                {section.title}
              </h3>
              <div className="text-[10px]">
                {renderSectionByRenderType(section)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParallelModularTemplate; 