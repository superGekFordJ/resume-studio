"use client";

import { RenderableResume, RenderableSection } from "@/types/schema";
import { ExperienceItemComponent } from "../rendering/pro-classic/ExperienceItemComponent";
import { EducationItemComponent } from "../rendering/pro-classic/EducationItemComponent";
import { CategorizedSkillsComponent } from "../rendering/pro-classic/CategorizedSkillsComponent";
import { SimpleSkillsComponent } from "../rendering/pro-classic/SimpleSkillsComponent";
import { OpenSourceItemComponent } from "../rendering/pro-classic/OpenSourceItemComponent";
import { GenericSectionComponent } from "../rendering/pro-classic/GenericSectionComponent";
import { CoverLetterComponent } from "../rendering/CoverLetterComponent";
import { Github, Linkedin, Mail, MapPin, Phone, Link as LinkIcon } from "lucide-react";
import { SchemaRegistry } from "@/lib/schemaRegistry";
import { pickFieldByRole } from "@/lib/roleMapUtils";

interface ProClassicTemplateProps {
  resume: RenderableResume;
}

const SectionTitle = ({ title }: { title: string }) => (
  <h2 className="font-raleway text-[14px] leading-[16px] font-medium text-[#888888] uppercase tracking-wider py-1.5 px-3 border-b border-[#e0e0e0]">
    {title}
  </h2>
);

export const ProClassicTemplate = ({ resume }: ProClassicTemplateProps) => {
  const { personalDetails, sections } = resume;
  const schemaRegistry = SchemaRegistry.getInstance();

  // Define renderSection function first
  const renderSection = (section: RenderableSection) => {
    // Get the role map for this specific section
    const roleMap = schemaRegistry.getRoleMap(section.schemaId);

    switch(section.schemaId) {
      case 'summary':
      case 'customText':
        const summaryItem = section.items[0];
        const summaryField = pickFieldByRole(summaryItem, 'description', roleMap);
        const summaryContent = summaryField?.value ? 
          (Array.isArray(summaryField.value) ? summaryField.value.join('\n') : summaryField.value) : '';
        return <p className="text-[13px] leading-[18px] m-0 py-1.5 px-3">{summaryContent}</p>;
      case 'skills':
        return <SimpleSkillsComponent items={section.items} roleMap={roleMap} />;
      case 'advanced-skills':
        return <CategorizedSkillsComponent items={section.items} roleMap={roleMap} />;
      case 'experience':
        return section.items.map(item => <ExperienceItemComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'education':
        return section.items.map(item => <EducationItemComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'projects':
        return section.items.map(item => <OpenSourceItemComponent key={item.id} item={item} roleMap={roleMap} />);
      case 'cover-letter':
        return <CoverLetterComponent section={section} roleMap={roleMap} />;
      default:
        // Fallback for certifications and any other section
        return <GenericSectionComponent section={section} />;
    }
  }

  // Single-column fallback logic for cover letters
  const hasCoverLetter = sections.some(s => s.schemaId === 'cover-letter');
  if (hasCoverLetter) {
    const coverLetterSection = sections.find(s => s.schemaId === 'cover-letter');
    return (
      <div className="font-open-sans text-[#333333] text-[13px]">
      {/* --- Header --- */}
      <header className="flex justify-between items-start mb-1 pb-1">
        <div className="flex-grow">
            <h1 className="font-raleway text-4xl leading-[43px] font-bold text-[#124f44] uppercase tracking-wider m-0 mb-1">
                {personalDetails.fullName}
            </h1>
            <p className="font-raleway text-lg leading-[22px] text-[#3cb371] m-0 mb-4">
                {personalDetails.jobTitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#888888]">
                {personalDetails.phone && <div className="flex items-center"><Phone size={12} className="mr-1.5" /><span >{personalDetails.phone}</span></div>}
                {personalDetails.email && <div className="flex items-center"><Mail size={12} className="mr-1.5" /><span>{personalDetails.email}</span></div>}
                {personalDetails.portfolio && <div className="flex items-center"><LinkIcon size={12} className="mr-1.5" /><span>{personalDetails.portfolio}</span></div>}
                {personalDetails.address && <div className="flex items-center"><MapPin size={12} className="mr-1.5" /><span>{personalDetails.address}</span></div>}
                {personalDetails.linkedin && <div className="flex items-center"><Linkedin size={12} className="mr-1.5" /><span>{personalDetails.linkedin}</span></div>}
                {personalDetails.github && <div className="flex items-center"><Github size={12} className="mr-1.5" /><span>{personalDetails.github}</span></div>}
            </div>
        </div>
        {personalDetails.avatar && (
            <div 
                className="w-[108px] h-[108px] rounded-full bg-cover bg-center flex-shrink-0 ml-5"
                style={{ backgroundImage: `url(${personalDetails.avatar})` }}
            />
        )}
      </header>

        {/* Cover letter content */}
        {coverLetterSection && (
          <div className="mb-6 p-6">
            <SectionTitle title={coverLetterSection.title || 'Cover Letter'} />
            {renderSection(coverLetterSection)}
          </div>
        )}
      </div>
    );
  }

  // --- Section Dispatching Logic ---
  // Left sidebar: Skills, certifications, and other supplementary info
  const sidebarSchemaIds = ['skills', 'advanced-skills', 'certifications'];
  
  // Main content: Core professional information
  const mainSchemaIds = ['summary', 'experience', 'education', 'projects'];

  const sidebarSections = sections.filter(s => sidebarSchemaIds.includes(s.schemaId));
  const mainSections = sections.filter(s => mainSchemaIds.includes(s.schemaId));
  
  // Handle sections that don't fit in either category
  const otherSections = sections.filter(s => 
    !sidebarSchemaIds.includes(s.schemaId) && !mainSchemaIds.includes(s.schemaId)
  );

  return (
    <div className="font-open-sans text-[#333333] text-[13px]">
      {/* --- Header --- */}
      <header className="flex justify-between items-start mb-8 pb-5">
        <div className="flex-grow">
            <h1 className="font-raleway text-4xl leading-[43px] font-bold text-[#124f44] uppercase tracking-wider m-0 mb-1">
                {personalDetails.fullName}
            </h1>
            <p className="font-raleway text-lg leading-[22px] text-[#3cb371] m-0 mb-4">
                {personalDetails.jobTitle}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#888888]">
                {personalDetails.phone && <div className="flex items-center"><Phone size={12} className="mr-1.5" /><span >{personalDetails.phone}</span></div>}
                {personalDetails.email && <div className="flex items-center"><Mail size={12} className="mr-1.5" /><span>{personalDetails.email}</span></div>}
                {personalDetails.portfolio && <div className="flex items-center"><LinkIcon size={12} className="mr-1.5" /><span>{personalDetails.portfolio}</span></div>}
                {personalDetails.address && <div className="flex items-center"><MapPin size={12} className="mr-1.5" /><span>{personalDetails.address}</span></div>}
                {personalDetails.linkedin && <div className="flex items-center"><Linkedin size={12} className="mr-1.5" /><span>{personalDetails.linkedin}</span></div>}
                {personalDetails.github && <div className="flex items-center"><Github size={12} className="mr-1.5" /><span>{personalDetails.github}</span></div>}
            </div>
        </div>
        {personalDetails.avatar && (
            <div 
                className="w-[108px] h-[108px] rounded-full bg-cover bg-center flex-shrink-0 ml-5"
                style={{ backgroundImage: `url(${personalDetails.avatar})` }}
            />
        )}
      </header>

      {/* --- Body --- */}
      <div className="grid grid-cols-[221px_1fr] gap-[12px]">
        {/* Sidebar */}
        <aside>
          {sidebarSections.map(section => (
            <section key={section.id} className="mb-3">
              <SectionTitle title={section.title} />
              {renderSection(section)}
            </section>
          ))}
          {/* Add unhandled sections to sidebar if they're short */}
          {otherSections.map(section => (
            <section key={section.id} className="mb-3">
              <SectionTitle title={section.title} />
              {renderSection(section)}
            </section>
          ))}
        </aside>

        {/* Main Content */}
        <main>
          {mainSections.map(section => (
            <section key={section.id} className="mb-3">
              <SectionTitle title={section.title} />
              {renderSection(section)}
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}; 