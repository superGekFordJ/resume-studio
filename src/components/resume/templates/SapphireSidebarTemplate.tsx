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

// Import rendering components
import { BadgeListComponent } from '../rendering/BadgeListComponent';
import { SapphireCategorizedSkillsComponent } from '../rendering/sapphire/SapphireCategorizedSkillsComponent';
import { CoverLetterComponent } from '../rendering/CoverLetterComponent';
import { AchievementItemComponent } from '../rendering/AchievementItemComponent';
import { TitledBlockComponent } from '../rendering/TitledBlockComponent';
import Image from 'next/image';

interface SapphireSidebarTemplateProps {
  resume: RenderableResume;
}

const SidebarSectionTitle = ({ title }: { title: string }) => (
  <h2 className="font-rubik text-[20px] leading-6 font-medium text-white mb-4 pb-1 border-b border-white/50">
    {title}
  </h2>
);

const MainSectionTitle = ({ title }: { title: string }) => (
  <h2 className="font-rubik text-[20px] leading-6 uppercase font-medium text-[#3E3E3E] mb-4 pb-2 border-b border-gray-200">
    {title}
  </h2>
);

export const SapphireSidebarTemplate = ({
  resume,
}: SapphireSidebarTemplateProps) => {
  const { personalDetails, sections } = resume;
  const schemaRegistry = SchemaRegistry.getInstance();
  const hasCoverLetter = sections.some((s) => s.schemaId === 'cover-letter');

  const renderSection = (
    section: RenderableSection,
    isInSidebar: boolean = false
  ) => {
    const roleMap = schemaRegistry.getRoleMap(section.schemaId);

    switch (section.schemaId) {
      case 'summary':
      case 'customText':
        const item = section.items[0];
        const field = pickFieldByRole(item, 'description', roleMap);
        const content = field?.value
          ? Array.isArray(field.value)
            ? field.value.join('\n')
            : field.value
          : '';

        const textColor = isInSidebar ? 'text-white/90' : 'text-gray-800';

        return (
          <MarkdownRenderer
            className={`text-[15px] leading-[1.4] m-0 ${textColor}`}
          >
            {content}
          </MarkdownRenderer>
        );

      case 'skills':
        if (isInSidebar) {
          const skillsText = section.items
            .map((item) => {
              const skillsField = pickFieldByRole(item, 'skills', roleMap);
              return Array.isArray(skillsField?.value)
                ? skillsField.value.join(', ')
                : skillsField?.value || '';
            })
            .filter(Boolean)
            .join(', ');
          return (
            <p className="font-inter text-[14px] leading-[1.5] m-0 text-white">
              {skillsText}
            </p>
          );
        }
        return <BadgeListComponent section={section} roleMap={roleMap} />;

      case 'advanced-skills':
        return (
          <SapphireCategorizedSkillsComponent
            items={section.items}
            roleMap={roleMap}
          />
        );

      case 'experience':
      case 'education':
      case 'projects':
        return section.items.map((item) => (
          <div key={item.id} className="mb-5">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-rubik text-[20px] leading-6 font-medium text-gray-800 flex-grow">
                {pickFieldByRole(item, 'title', roleMap)?.value}
              </h3>
              <span className="font-inter text-[14px] text-gray-800 ml-4">
                {getItemDateRange(item, roleMap)}
              </span>
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <h4 className="font-rubik text-[18px] leading-[21px] text-[#008CFF] font-normal">
                {pickFieldByRole(item, 'organization', roleMap)?.value}
              </h4>
              <span className="font-inter text-[14px] text-gray-800">
                {pickFieldByRole(item, 'location', roleMap)?.value}
              </span>
            </div>
            {(() => {
              const descField = pickFieldByRole(item, 'description', roleMap);
              if (!descField?.value) return null;

              const descriptionContent = Array.isArray(descField.value)
                ? descField.value.join('\n')
                : String(descField.value);

              return (
                <>
                  {descField.markdownEnabled ? (
                    <MarkdownRenderer className="text-[14px] leading-[1.4] text-gray-800">
                      {descriptionContent}
                    </MarkdownRenderer>
                  ) : (
                    <p className="text-[14px] leading-[1.4] text-gray-800 whitespace-pre-line">
                      {descriptionContent}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        ));

      case 'certifications':
        return section.items.map((item) => (
          <AchievementItemComponent
            key={item.id}
            item={item}
            roleMap={roleMap}
          />
        ));

      case 'cover-letter':
        return <CoverLetterComponent section={section} roleMap={roleMap} />;

      default:
        return (
          <TitledBlockComponent item={section.items[0]} roleMap={roleMap} />
        );
    }
  };

  const coverLetterSection = hasCoverLetter
    ? sections.find((s) => s.schemaId === 'cover-letter')
    : null;

  const sidebarSchemaIds = [
    'skills',
    'advanced-skills',
    'certifications',
    'languages',
    'customText',
  ];
  const mainSchemaIds = ['summary', 'experience', 'education', 'projects'];

  const sidebarSections = sections.filter((s) =>
    sidebarSchemaIds.includes(s.schemaId)
  );
  const mainSections = sections.filter((s) =>
    mainSchemaIds.includes(s.schemaId)
  );

  let resumeContent;
  resumeContent = (
    <div className="grid grid-cols-[326px_614px] w-[940px] h-[352mm] bg-white shadow-lg">
      <aside className="bg-[#22405C] text-white px-[30px] py-[40px]">
        <div className="flex justify-center mb-10">
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
          <div className="flex flex-col gap-2 text-[14px] text-white/90 mt-6 font-inter">
            {personalDetails.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4" />
                <span>{personalDetails.phone}</span>
              </div>
            )}
            {personalDetails.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4" />
                <span>{personalDetails.email}</span>
              </div>
            )}
            {personalDetails.portfolio && (
              <div className="flex items-center gap-3">
                <LinkIcon className="w-4 h-4" />
                <span>{personalDetails.portfolio}</span>
              </div>
            )}
            {personalDetails.linkedin && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4" />
                <span>{personalDetails.linkedin}</span>
              </div>
            )}
            {personalDetails.address && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>{personalDetails.address}</span>
              </div>
            )}
            {personalDetails.github && (
              <div className="flex items-center gap-3">
                <Github className="w-4 h-4" />
                <span>{personalDetails.github}</span>
              </div>
            )}
          </div>
        )}

        {!hasCoverLetter && (
          <div className="mt-8">
            {sidebarSections.map((section) => (
              <section key={section.id} className="mb-8">
                <SidebarSectionTitle title={section.title} />
                {renderSection(section, true)}
              </section>
            ))}
          </div>
        )}
      </aside>
      <main className="px-[30px] py-[40px] text-gray-800">
        <header className="mb-8">
          <h1 className="font-rubik text-[36px] leading-[1.1] uppercase font-bold text-[#3E3E3E] mb-3">
            {personalDetails.fullName}
          </h1>
          <p className="font-inter text-[20px] leading-6 text-[#008CFF] mb-4">
            {personalDetails.jobTitle}
          </p>
          {/* Conditionally render contact info in header */}
          {!hasCoverLetter && (
            <div className="flex flex-wrap gap-4 text-[13px] text-gray-500">
              {personalDetails.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{personalDetails.email}</span>
                </div>
              )}
              {personalDetails.portfolio && (
                <div className="flex items-center">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  <span>{personalDetails.portfolio}</span>
                </div>
              )}
              {personalDetails.address && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{personalDetails.address}</span>
                </div>
              )}
              {personalDetails.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-2" />
                  <span>{personalDetails.linkedin}</span>
                </div>
              )}
              {personalDetails.github && (
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-2" />
                  <span>{personalDetails.github}</span>
                </div>
              )}
            </div>
          )}
        </header>
        {hasCoverLetter && coverLetterSection ? (
          <section key={coverLetterSection.id} className="mb-6">
            <MainSectionTitle title={coverLetterSection.title} />
            {renderSection(coverLetterSection, false)}
          </section>
        ) : (
          mainSections.map((section) => (
            <section key={section.id} className="mb-6">
              <MainSectionTitle title={section.title} />
              {renderSection(section, false)}
            </section>
          ))
        )}
      </main>
    </div>
  );

  // A4 paper width is 210mm, which is approx 794px.
  // The template has a fixed width of 940px.
  // We need to scale it down to fit. 794 / 940 = 0.8446
  const scale = 0.845;
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
