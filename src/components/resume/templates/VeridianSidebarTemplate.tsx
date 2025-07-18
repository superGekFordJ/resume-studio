'use client';

import { RenderableResume, RenderableSection } from '@/types/schema';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { getItemDateRange, pickFieldByRole } from '@/lib/roleMapUtils';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Link as LinkIcon,
  Linkedin,
  Github,
} from 'lucide-react';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';

// Import standard rendering components
import { SingleTextComponent } from '../rendering/SingleTextComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import { CoverLetterComponent } from '../rendering/CoverLetterComponent';

// Import Veridian-specific rendering components
import { VeridianBadgeListComponent } from '../rendering/veridian/VeridianBadgeListComponent';
import { VeridianCategorizedSkillsComponent } from '../rendering/veridian/VeridianCategorizedSkillsComponent';
import { VeridianTitledBlockComponent } from '../rendering/veridian/VeridianTitledBlockComponent';
import { VeridianSingleTextComponent } from '../rendering/veridian/VeridianSingleTextComponent';
import { AchievementItemComponent } from '../rendering/AchievementItemComponent';
import Image from 'next/image';

interface VeridianSidebarTemplateProps {
  resume: RenderableResume;
}

const SidebarSectionTitle = ({ title }: { title: string }) => (
  <h2 className="font-volkhov text-[16px] leading-6 font-normal text-white mb-4 pb-2 border-b border-white/30 uppercase">
    {title}
  </h2>
);

const MainSectionTitle = ({ title }: { title: string }) => (
  <h2 className="font-volkhov text-[16px] leading-6 uppercase font-normal text-[#333] mb-4 pb-2 border-b border-[#e0e0e0]">
    {title}
  </h2>
);

export const VeridianSidebarTemplate = ({
  resume,
}: VeridianSidebarTemplateProps) => {
  const { personalDetails, sections } = resume;
  const schemaRegistry = SchemaRegistry.getInstance();
  const hasCoverLetter = sections.some((s) => s.schemaId === 'cover-letter');
  const coverLetterSection = hasCoverLetter
    ? sections.find((s) => s.schemaId === 'cover-letter')
    : null;

  const renderSectionForMain = (section: RenderableSection) => {
    const roleMap = schemaRegistry.getRoleMap(section.schemaId);

    switch (section.schemaId) {
      case 'summary':
      case 'customText':
        return <SingleTextComponent items={section.items} roleMap={roleMap} />;

      case 'experience':
      case 'education':
      case 'projects':
        return section.items.map((item) => {
          const titleField = pickFieldByRole(item, 'title', roleMap);
          const organizationField = pickFieldByRole(
            item,
            'organization',
            roleMap
          );
          const descriptionField = pickFieldByRole(
            item,
            'description',
            roleMap
          );

          const dateDisplay = getItemDateRange(item, roleMap);

          return (
            <div key={item.id} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-volkhov text-[15px] leading-6 font-normal text-[#333] flex-grow">
                  {titleField?.value}
                </h3>
                <span className="font-sans text-[12px] text-[#555] ml-4 flex-shrink-0 pl-2">
                  {dateDisplay}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <h4 className="font-volkhov text-[14px] leading-[21px] text-[#1ab0b3] font-normal">
                  {organizationField?.value}
                </h4>
              </div>
              {descriptionField?.value && (
                <div className="text-[12px] leading-[1.5] text-[#333]">
                  {descriptionField.markdownEnabled ? (
                    <MarkdownRenderer className="font-sans">
                      {Array.isArray(descriptionField.value)
                        ? descriptionField.value.join('\n')
                        : String(descriptionField.value)}
                    </MarkdownRenderer>
                  ) : (
                    <div className="font-sans">
                      {Array.isArray(descriptionField.value) ? (
                        <ul className="list-none pl-4">
                          {descriptionField.value.map((item, idx) => (
                            <li key={idx} className="relative mb-1.5 pl-4">
                              <span className="absolute left-0 top-0 text-[#1ab0b3] text-[14px] leading-[1.2]">
                                •
                              </span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="whitespace-pre-line">
                          {String(descriptionField.value)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        });

      case 'cover-letter':
        return <CoverLetterComponent section={section} roleMap={roleMap} />;

      default:
        return (
          <TitledBlockComponent item={section.items[0]} roleMap={roleMap} />
        );
    }
  };

  const renderSectionForSidebar = (section: RenderableSection) => {
    const roleMap = schemaRegistry.getRoleMap(section.schemaId);

    switch (section.schemaId) {
      case 'skills':
        return (
          <VeridianBadgeListComponent section={section} roleMap={roleMap} />
        );

      case 'advanced-skills':
        return (
          <VeridianCategorizedSkillsComponent
            items={section.items}
            roleMap={roleMap}
          />
        );

      case 'certifications':
        return section.items.map((item) => (
          <AchievementItemComponent
            key={item.id}
            item={item}
            roleMap={roleMap}
          />
        ));

      case 'projects':
        return section.items.map((item) => (
          <VeridianTitledBlockComponent
            key={item.id}
            item={item}
            roleMap={roleMap}
          />
        ));

      case 'customText':
        return (
          <VeridianSingleTextComponent section={section} roleMap={roleMap} />
        );

      default:
        return (
          <VeridianSingleTextComponent section={section} roleMap={roleMap} />
        );
    }
  };

  const sidebarSchemaIds = [
    'skills',
    'advanced-skills',
    'certifications',
    'customText',
  ];
  const mainSchemaIds = ['summary', 'experience', 'education', 'projects'];

  const sidebarSections = sections.filter((s) =>
    sidebarSchemaIds.includes(s.schemaId)
  );
  const mainSections = sections.filter((s) =>
    mainSchemaIds.includes(s.schemaId)
  );

  const resumeContent = (
    <div className="grid grid-cols-[1fr_300px] w-[816px] h-[306mm] bg-white shadow-lg font-sans">
      <main className="px-9 py-9 text-[#333]">
        <header className="mb-7">
          <h1 className="font-volkhov text-[28px] leading-[1.3] uppercase tracking-wide text-[#333] mb-1">
            {personalDetails.fullName}
          </h1>
          <p className="font-sans text-[16px] leading-6 text-[#1ab0b3] font-bold mb-4">
            {personalDetails.jobTitle}
          </p>
          {/* Conditionally render contact info in header */}
          {!hasCoverLetter && (
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-[13px] text-[#b9b9b9]">
              {personalDetails.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4" />
                  <span>{personalDetails.email}</span>
                </div>
              )}
              {personalDetails.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4" />
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.portfolio && (
                <div className="flex items-center gap-2.5">
                  <LinkIcon className="w-4 h-4" />
                  <span>{personalDetails.portfolio}</span>
                </div>
              )}
              {personalDetails.linkedin && (
                <div className="flex items-center gap-2.5">
                  <Linkedin className="w-4 h-4" />
                  <span>{personalDetails.linkedin}</span>
                </div>
              )}
              {personalDetails.address && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4" />
                  <span>{personalDetails.address}</span>
                </div>
              )}
              {personalDetails.github && (
                <div className="flex items-center gap-2.5">
                  <Github className="w-4 h-4" />
                  <span>{personalDetails.github}</span>
                </div>
              )}
            </div>
          )}
        </header>
        {hasCoverLetter && coverLetterSection ? (
          <section key={coverLetterSection.id} className="mb-6">
            <MainSectionTitle title={coverLetterSection.title} />
            {renderSectionForMain(coverLetterSection)}
          </section>
        ) : (
          mainSections.map((section) => (
            <section key={section.id} className="mb-6">
              <MainSectionTitle title={section.title} />
              {renderSectionForMain(section)}
            </section>
          ))
        )}
      </main>
      <aside className="bg-[#006666] text-white px-6 py-9">
        <div className="flex justify-center mb-8">
          <div className="w-[130px] h-[130px] rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
            {personalDetails.avatar ? (
              <Image
                src={personalDetails.avatar}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                width={130}
                height={130}
              />
            ) : (
              <User className="w-16 h-16 text-white/40" />
            )}
          </div>
        </div>

        {/* Conditionally render contact info in sidebar */}
        {hasCoverLetter && (
          <div className="flex flex-col gap-2 text-[13px] text-white/90 mt-6 font-sans">
            {personalDetails.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4" />
                <span>{personalDetails.phone}</span>
              </div>
            )}
            {personalDetails.email && (
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>{personalDetails.email}</span>
              </div>
            )}
            {personalDetails.portfolio && (
              <div className="flex items-center gap-2.5">
                <LinkIcon className="w-4 h-4" />
                <span>{personalDetails.portfolio}</span>
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center gap-2.5">
                <Linkedin className="w-4 h-4" />
                <span>{personalDetails.linkedin}</span>
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4" />
                <span>{personalDetails.address}</span>
              </div>
            )}
            {personalDetails.github && (
              <div className="flex items-center gap-2.5">
                <Github className="w-4 h-4" />
                <span>{personalDetails.github}</span>
              </div>
            )}
          </div>
        )}

        {!hasCoverLetter && (
          <div className="mt-8">
            {sidebarSections.map((section) => (
              <section key={section.id} className="mb-6">
                <SidebarSectionTitle title={section.title} />
                {renderSectionForSidebar(section)}
              </section>
            ))}
          </div>
        )}
      </aside>
    </div>
  );

  // Apply scale(0.97) transform as specified in the requirements
  const scale = 0.973;
  const inverseScale = 100 / scale;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${inverseScale}%`,
          height: `${inverseScale}%`,
        }}
      >
        {resumeContent}
      </div>
    </div>
  );
};
