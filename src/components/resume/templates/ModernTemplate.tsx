"use client";

import type { RenderableResume, RenderableSection } from "@/types/schema";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { SimpleListComponent } from '../rendering/SimpleListComponent';
import { SingleTextComponent } from '../rendering/SingleTextComponent';

interface ModernTemplateProps {
  resume: RenderableResume;
}

// Modern template specific rendering dispatcher
const renderSectionByRenderType = (section: RenderableSection) => {
  // Modern template's layout preferences (can be empty to use all defaults)
  const templateLayoutMap: Record<string, string> = {
    // Modern template likes to show skills as badges (same as default)
    // So no override needed
  };

  // Use template override if exists, otherwise use schema default
  const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType || 'default';

  switch (finalRenderType) {
    case 'simple-list':
      return <SimpleListComponent items={section.items} />;
    case 'badge-list':
      return (
        <div className="modern-badge-list">
          {section.items.map(item => {
            const nameField = item.fields.find(f => f.key === 'name');
            return nameField ? (
              <span key={item.id} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-[10px] font-medium text-gray-700 mr-1 mb-1">
                {nameField.value}
              </span>
            ) : null;
          })}
        </div>
      );
    case 'timeline':
      return section.items.map(item => <TitledBlockComponent key={item.id} item={item} />);
    case 'single-text':
      return <SingleTextComponent items={section.items} />;
    default:
      // Generic fallback rendering
      return section.items.map(item => (
        <div key={item.id} className="mb-2">
          {item.fields.map(field => (
            <div key={field.key}>
              {Array.isArray(field.value) ? (
                <div>
                  <span className="font-medium text-xs">{field.label}: </span>
                  {field.value.join(', ')}
                </div>
              ) : (
                field.value && (
                  <div>
                    <span className="font-medium text-xs">{field.label}: </span>
                    <span className="text-xs">{field.value}</span>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      ));
  }
};

// Modern template with clean layout and styling
const ModernTemplate = ({ resume }: ModernTemplateProps) => {
  const { personalDetails, sections } = resume;

  return (
    <div className="text-[11px] leading-[1.4] h-full p-6">
      {/* Header with Avatar */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        {personalDetails.avatar && (
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-primary/20 flex-shrink-0">
            <img 
              src={personalDetails.avatar} 
              alt={personalDetails.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Personal Info */}
        <div className="flex-grow">
          <h1 className="font-bold text-2xl mb-1 text-gray-800">{personalDetails.fullName}</h1>
          <p className="text-base text-gray-600 mb-3">{personalDetails.jobTitle}</p>

          <div className="flex flex-wrap items-center gap-3 text-[9px] text-gray-700">
            {personalDetails.email && <div className="flex items-center"><Mail size={12} className="mr-1" /> {personalDetails.email}</div>}
            {personalDetails.phone && <div className="flex items-center"><Phone size={12} className="mr-1" /> {personalDetails.phone}</div>}
            {personalDetails.linkedin && <div className="flex items-center"><Linkedin size={12} className="mr-1" /> {personalDetails.linkedin}</div>}
            {personalDetails.github && <div className="flex items-center"><Github size={12} className="mr-1" /> {personalDetails.github}</div>}
            {personalDetails.portfolio && <div className="flex items-center"><Globe size={12} className="mr-1" /> {personalDetails.portfolio}</div>}
            {personalDetails.address && <div className="flex items-center"><MapPin size={12} className="mr-1" /> {personalDetails.address}</div>}
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="mb-5">
          <h2 className="font-semibold text-base border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">{section.title}</h2>
          {renderSectionByRenderType(section)}
        </div>
      ))}
    </div>
  );
};

export default ModernTemplate; 