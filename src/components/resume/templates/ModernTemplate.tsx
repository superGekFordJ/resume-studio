'use client';

import type { RenderableResume, RenderableSection } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from 'lucide-react';
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { SimpleListComponent } from '../rendering/SimpleListComponent';
import { SingleTextComponent } from '../rendering/SingleTextComponent';
import { AdvancedSkillsComponent } from '../rendering/AdvancedSkillsComponent';
import { CoverLetterComponent } from '../rendering/CoverLetterComponent';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import Image from 'next/image';

interface ModernTemplateProps {
  resume: RenderableResume;
}

// Modern template specific rendering dispatcher
const renderSectionByRenderType = (section: RenderableSection) => {
  // Modern template's layout preferences - override specific sections
  const templateLayoutMap: Record<string, string> = {
    // Modern template prefers timeline for projects and certifications
    projects: 'timeline',
    certifications: 'timeline',
    'advanced-skills': 'advanced-skills-list', // Use specialized advanced skills rendering
  };

  // Get role map for this section synchronously
  const schemaRegistry = SchemaRegistry.getInstance();
  const roleMap = schemaRegistry.getRoleMap(section.schemaId);

  // Use template override if exists, otherwise use schema default
  const finalRenderType =
    templateLayoutMap[section.schemaId] ||
    section.defaultRenderType ||
    'default';

  switch (finalRenderType) {
    case 'simple-list':
      return <SimpleListComponent section={section} roleMap={roleMap} />;
    case 'badge-list':
      return <BadgeListComponent section={section} roleMap={roleMap} />;
    case 'timeline':
      return section.items.map((item) => (
        <TitledBlockComponent key={item.id} item={item} roleMap={roleMap} />
      ));
    case 'single-text':
      return <SingleTextComponent items={section.items} roleMap={roleMap} />;
    case 'advanced-skills-list':
      return section.items.map((item) => (
        <AdvancedSkillsComponent key={item.id} item={item} roleMap={roleMap} />
      ));
    case 'cover-letter':
      return <CoverLetterComponent section={section} roleMap={roleMap} />;
    default:
      // Improved generic fallback rendering for unknown sections
      return (
        <div className="space-y-3">
          {section.items.map((item) => (
            <div key={item.id} className="border-l-2 border-gray-200 pl-3">
              {item.fields.map((field, index) => {
                // Skip empty fields
                if (
                  !field.value ||
                  (Array.isArray(field.value) && field.value.length === 0)
                ) {
                  return null;
                }

                // Determine field importance based on position
                const isFirstField = index === 0;

                return (
                  <div
                    key={field.key}
                    className={cn('text-[11px]', index > 0 && 'mt-1')}
                  >
                    {Array.isArray(field.value) ? (
                      <div>
                        <span className="font-medium text-gray-600 text-[10px]">
                          {field.label}:
                        </span>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {field.value.map((val, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-gray-100 rounded px-1.5 py-0.5 text-[10px]"
                            >
                              {val}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          isFirstField && 'font-medium text-gray-800'
                        )}
                      >
                        {isFirstField ? (
                          // First field is likely the title/name, display it prominently
                          <span>{field.value}</span>
                        ) : (
                          // Other fields show with label
                          <>
                            <span className="text-gray-600">
                              {field.label}:
                            </span>
                            <span className="text-gray-700 ml-1">
                              {field.value}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
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
            <Image
              src={personalDetails.avatar}
              alt={personalDetails.fullName}
              className="w-full h-full object-cover"
              width={80}
              height={80}
            />
          </div>
        )}

        {/* Personal Info */}
        <div className="flex-grow">
          <h1 className="font-bold text-2xl mb-1 text-gray-800">
            {personalDetails.fullName}
          </h1>
          <p className="text-base text-gray-600 mb-3">
            {personalDetails.jobTitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[9px] text-gray-700">
            {personalDetails.email && (
              <div className="flex items-center">
                <Mail size={12} className="mr-1" /> {personalDetails.email}
              </div>
            )}
            {personalDetails.phone && (
              <div className="flex items-center">
                <Phone size={12} className="mr-1" /> {personalDetails.phone}
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center">
                <Linkedin size={12} className="mr-1" />{' '}
                {personalDetails.linkedin}
              </div>
            )}
            {personalDetails.github && (
              <div className="flex items-center">
                <Github size={12} className="mr-1" /> {personalDetails.github}
              </div>
            )}
            {personalDetails.portfolio && (
              <div className="flex items-center">
                <Globe size={12} className="mr-1" /> {personalDetails.portfolio}
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-center">
                <MapPin size={12} className="mr-1" /> {personalDetails.address}
              </div>
            )}
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="mb-5">
          <h2 className="font-semibold text-base border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">
            {section.title}
          </h2>
          {renderSectionByRenderType(section)}
        </div>
      ))}
    </div>
  );
};

export default ModernTemplate;
