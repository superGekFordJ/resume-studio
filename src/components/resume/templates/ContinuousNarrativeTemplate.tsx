"use client";

import { RenderableResume, RenderableSection } from "@/types/schema";
import { Mail, Phone, Linkedin, Github, Globe, MapPin, Briefcase } from "lucide-react";
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { SimpleListComponent } from '../rendering/SimpleListComponent';
import { SingleTextComponent } from '../rendering/SingleTextComponent';
import { ProjectItemComponent } from '../rendering/ProjectItemComponent';
import { CertificationItemComponent } from '../rendering/CertificationItemComponent';
import { AdvancedSkillsComponent } from '../rendering/AdvancedSkillsComponent';

interface ContinuousNarrativeTemplateProps {
  resume: RenderableResume;
}

// Custom component to render summary without title
const SummaryWithoutTitle = ({ items }: { items: any[] }) => {
  return (
    <div className="text-gray-700 leading-relaxed">
      {items.map(item => (
        <div key={item.id}>
          {item.fields.map((field: any) => (
            <p key={field.key} className="text-justify whitespace-pre-wrap">
              {field.value}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

// Reusable rendering dispatcher following the hybrid pattern
const renderSectionByRenderType = (section: RenderableSection, isHeader: boolean = false) => {
  // Special handling for summary in header - no title
  if (isHeader && section.schemaId === 'summary') {
    return <SummaryWithoutTitle items={section.items} />;
  }

  // This template uses mostly defaults for a clean, continuous narrative
  const templateLayoutMap: Record<string, string> = {
    'projects': 'project-list',
    'certifications': 'certification-list',
    'advanced-skills': 'advanced-skills-list'
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

const ContinuousNarrativeTemplate = ({ resume }: ContinuousNarrativeTemplateProps) => {
  const { personalDetails, sections } = resume;

  // Use summary as the prologue
  const prologueSectionId = 'summary';
  
  const prologueSection = sections.find(s => s.schemaId === prologueSectionId);
  const bodySections = sections.filter(s => s.schemaId !== prologueSectionId);

  return (
    <div className="h-full relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header - Floating on gradient background */}
      <div className="pt-8 pb-4 px-[25mm]">
        <div className="text-center">
          <h1 className="font-bold text-3xl mb-3 text-gray-800">{personalDetails.fullName}</h1>
          {/* Summary without title */}
          {prologueSection && (
            <div className="max-w-3xl mx-auto text-sm">
              {renderSectionByRenderType(prologueSection, true)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - White container full width */}
      <div className="bg-white shadow-lg px-[25mm] py-8 mx-0">
        {/* Continuous Flow Dual Columns */}
        <div className="columns-2 gap-8 text-[11px] leading-[1.4]">
          {bodySections.map((section) => (
            <div key={section.id} className="break-inside-avoid mb-6">
              <h2 className="font-bold text-[13px] text-gray-800 border-b-2 border-gray-200 pb-1 mb-3 flex items-center gap-2">
                {section.schemaId === 'work-experience' && <Briefcase size={14} />}
                {section.title}
              </h2>
              <div className="text-gray-600">
                {renderSectionByRenderType(section)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer - Personal Details floating on gradient */}
      <div className="absolute bottom-0 left-0 right-0 px-[25mm] pb-6">
        <div className="flex flex-wrap justify-center items-center gap-4 text-[10px] text-gray-700">
          {personalDetails.email && (
            <div className="flex items-center gap-1">
              <Mail size={12} className="text-gray-500" />
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-1">
              <Phone size={12} className="text-gray-500" />
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.linkedin && (
            <div className="flex items-center gap-1">
              <Linkedin size={12} className="text-gray-500" />
              <span>{personalDetails.linkedin}</span>
            </div>
          )}
          {personalDetails.github && (
            <div className="flex items-center gap-1">
              <Github size={12} className="text-gray-500" />
              <span>{personalDetails.github}</span>
            </div>
          )}
          {personalDetails.portfolio && (
            <div className="flex items-center gap-1">
              <Globe size={12} className="text-gray-500" />
              <span>{personalDetails.portfolio}</span>
            </div>
          )}
          {personalDetails.address && (
            <div className="flex items-center gap-1">
              <MapPin size={12} className="text-gray-500" />
              <span>{personalDetails.address}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContinuousNarrativeTemplate; 