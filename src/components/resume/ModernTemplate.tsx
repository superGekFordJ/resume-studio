"use client";

import type { ResumeData, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry, SectionType } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";

interface ModernTemplateProps {
  resumeData: ResumeData;
}

// You would implement the specific layout and styling for your modern template here
const ModernTemplate = ({ resumeData }: ModernTemplateProps) => {
  const { personalDetails, sections } = resumeData;

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
          </div>
        </div>
      </div>

      {sections.map((section) => (
        section.visible && (
          <div key={section.id} className="mb-5">
            <h2 className="font-semibold text-base border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">{section.title}</h2>
            {/* Render section items with optimized styling */}
            {section.items.map(item => (
              <div key={item.id} className="mb-2">
                {/* Render content based on item type */}
                {section.type === 'experience' && (
                  <div className="mb-3">
                    <h3 className="font-medium text-[12px] text-gray-800">{(item as ExperienceEntry).jobTitle} at {(item as ExperienceEntry).company}</h3>
                    <p className="text-[10px] text-gray-500 mb-1">{(item as ExperienceEntry).startDate} - {(item as ExperienceEntry).endDate}</p>
                    <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">{(item as ExperienceEntry).description}</p>
                  </div>
                )}
                {section.type === 'education' && (
                  <div className="mb-3">
                    <h3 className="font-medium text-[12px] text-gray-800">{(item as EducationEntry).degree} from {(item as EducationEntry).institution}</h3>
                    <p className="text-[10px] text-gray-500 mb-1">{(item as EducationEntry).graduationYear}</p>
                    {(item as EducationEntry).details && <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">{(item as EducationEntry).details}</p>}
                  </div>
                )}
                {section.type === 'skills' && (
                  <span className="inline-block bg-gray-200 rounded-full px-2 py-1 text-[10px] font-medium text-gray-700 mr-1 mb-1">{(item as SkillEntry).name}</span>
                )}
                {(section.type === 'summary' || section.type === 'customText') && (
                  <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">{(item as CustomTextEntry).content}</p>
                )}
              </div>
            ))}
          </div>
        )
      ))}
    </div>
  );
};

export default ModernTemplate; 