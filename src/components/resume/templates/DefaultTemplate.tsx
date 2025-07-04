"use client";

import { RenderableResume, RenderableSection, RenderableItem, RoleMap } from "@/types/schema";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { SimpleListComponent } from '../rendering/SimpleListComponent';
import { SingleTextComponent } from '../rendering/SingleTextComponent';
import { ProjectItemComponent } from '../rendering/ProjectItemComponent';
import { CertificationItemComponent } from '../rendering/CertificationItemComponent';
import { AdvancedSkillsComponent } from '../rendering/AdvancedSkillsComponent';
import { CoverLetterComponent } from '../rendering/CoverLetterComponent';
import { SchemaRegistry } from '@/lib/schemaRegistry';

interface DefaultTemplateProps {
  resume: RenderableResume;
}

const DefaultTemplate = ({ resume }: DefaultTemplateProps) => {
  const { personalDetails, sections } = resume;
  const schemaRegistry = SchemaRegistry.getInstance();

  // Hybrid rendering dispatcher - uses default or template override
  const renderSectionByRenderType = (section: RenderableSection) => {
    // Template-specific overrides (demonstration)
    const templateLayoutMap: Record<string, string> = {
      'skills': 'simple-list', // Override skills to be a simple list instead of badge-list
      'projects': 'project-list',
      'certifications': 'certification-list',
      'advanced-skills': 'advanced-skills-list'
    };

    // Get role map for this section synchronously
    const roleMap = schemaRegistry.getRoleMap(section.schemaId);

    // Use template override if exists, otherwise use schema default
    const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType || 'default';

    switch (finalRenderType) {
      case 'simple-list':
        return <SimpleListComponent section={section} roleMap={roleMap} />;
      case 'badge-list':
        return <BadgeListComponent section={section} roleMap={roleMap} />;
      case 'timeline':
        return section.items.map(item => <TitledBlockComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'single-text':
        return <SingleTextComponent items={section.items} roleMap={roleMap} />;
      case 'project-list':
        return section.items.map(item => <ProjectItemComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'certification-list':
        return section.items.map(item => <CertificationItemComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'advanced-skills-list':
        return section.items.map(item => <AdvancedSkillsComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'cover-letter':
        return <CoverLetterComponent section={section} roleMap={roleMap} />;
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

  return (
    <div className="text-[11px] leading-[1.4] h-full">
      {/* Header with Avatar and Personal Details */}
      <div className="flex items-start gap-4 mb-6">
        {/* Avatar */}
        {personalDetails.avatar && (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
            <img 
              src={personalDetails.avatar} 
              alt={personalDetails.fullName}
              className="w-full h-full object-cover"
            />
      </div>
        )}
        
        {/* Personal Info */}
        <div className="flex-grow text-center">
          <h1 className="font-headline text-2xl font-bold text-primary mb-1">{personalDetails.fullName}</h1>
          <p className="font-headline text-sm text-foreground mb-3">{personalDetails.jobTitle}</p>

          {/* Contact Info with Icons */}
          <div className="flex flex-wrap justify-center items-center gap-3 text-[9px] text-gray-600">
            {personalDetails.email && (
              <div className="flex items-center">
                <Mail size={10} className="mr-1" />
                {personalDetails.email}
              </div>
            )}
            {personalDetails.phone && (
              <div className="flex items-center">
                <Phone size={10} className="mr-1" />
                {personalDetails.phone}
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center">
                <Linkedin size={10} className="mr-1" />
                {personalDetails.linkedin}
              </div>
            )}
            {personalDetails.github && (
              <div className="flex items-center">
                <Github size={10} className="mr-1" />
                {personalDetails.github}
              </div>
            )}
            {personalDetails.portfolio && (
              <div className="flex items-center">
                <Globe size={10} className="mr-1" />
                {personalDetails.portfolio}
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-center">
                <MapPin size={10} className="mr-1" />
                {personalDetails.address}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Sections */}
      {sections.map((section) => (
        <div key={section.id} className="mb-3">
          <h3 className="font-headline text-[13px] font-semibold text-primary border-b border-primary/50 mb-2 pb-0.5">
            {section.title}
          </h3>
          {renderSectionByRenderType(section)}
        </div>
      ))}
    </div>
  );
};

export default DefaultTemplate; 