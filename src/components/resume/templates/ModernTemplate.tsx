"use client";

import type { RenderableResume, RenderableSection, RenderableItem } from "@/types/schema";
import { cn } from "@/lib/utils";
import { Mail, Phone, Linkedin, Github, Globe, MapPin } from "lucide-react";

interface ModernTemplateProps {
  resume: RenderableResume;
}

// Helper function to render section items based on schemaId
const renderSectionItems = (section: RenderableSection) => {
  // Handle skills sections differently
  if (section.schemaId === 'skills') {
    return (
      <div className="flex flex-wrap gap-1">
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
  }

  // Handle advanced skills sections
  if (section.schemaId === 'advanced-skills') {
    return (
      <div className="space-y-2">
        {section.items.map(item => {
          const categoryField = item.fields.find(f => f.key === 'category');
          const skillsField = item.fields.find(f => f.key === 'skills');
          const proficiencyField = item.fields.find(f => f.key === 'proficiency');
          const experienceField = item.fields.find(f => f.key === 'yearsOfExperience');
          
          return (
            <div key={item.id} className="mb-3">
              {categoryField && <h4 className="font-semibold text-sm">{categoryField.value}</h4>}
              {skillsField && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(skillsField.value) ? 
                    skillsField.value.map((skill, idx) => (
                      <span key={idx} className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {skill}
                      </span>
                    )) : 
                    <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {skillsField.value}
                    </span>
                  }
                </div>
              )}
              {proficiencyField && proficiencyField.value && (
                <p className="text-xs text-muted-foreground mt-1">Level: {proficiencyField.value}</p>
              )}
              {experienceField && experienceField.value && (
                <p className="text-xs text-muted-foreground">Experience: {experienceField.value} years</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Generic rendering for all other section types
  return section.items.map(item => {
    // Special handling for experience sections
    if (section.schemaId === 'experience') {
      const jobTitleField = item.fields.find(f => f.key === 'jobTitle');
      const companyField = item.fields.find(f => f.key === 'company');
      const dateRangeField = item.fields.find(f => f.key === 'dateRange');
      const descriptionField = item.fields.find(f => f.key === 'description');
      
      return (
        <div key={item.id} className="mb-3">
          {jobTitleField && companyField && (
            <h3 className="font-medium text-[12px] text-gray-800">
              {jobTitleField.value} at {companyField.value}
            </h3>
          )}
          {dateRangeField && (
            <p className="text-[10px] text-gray-500 mb-1">{dateRangeField.value}</p>
          )}
          {descriptionField && (
            <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">{descriptionField.value}</p>
          )}
        </div>
      );
    }

    // Special handling for education sections
    if (section.schemaId === 'education') {
      const degreeField = item.fields.find(f => f.key === 'degree');
      const institutionField = item.fields.find(f => f.key === 'institution');
      const graduationYearField = item.fields.find(f => f.key === 'graduationYear');
      const detailsField = item.fields.find(f => f.key === 'details');
      
      return (
        <div key={item.id} className="mb-3">
          {degreeField && institutionField && (
            <h3 className="font-medium text-[12px] text-gray-800">
              {degreeField.value} from {institutionField.value}
            </h3>
          )}
          {graduationYearField && (
            <p className="text-[10px] text-gray-500 mb-1">{graduationYearField.value}</p>
          )}
          {detailsField && detailsField.value && (
            <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">{detailsField.value}</p>
          )}
        </div>
      );
    }

    // Special handling for summary/customText sections
    if (section.schemaId === 'summary' || section.schemaId === 'customText') {
      const contentField = item.fields.find(f => f.key === 'content');
      return contentField ? (
        <p key={item.id} className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line mb-2">
          {contentField.value}
        </p>
      ) : null;
    }

    // Generic fallback rendering
    return (
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
    );
  });
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
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="mb-5">
          <h2 className="font-semibold text-base border-b-2 border-gray-300 pb-1 mb-3 text-gray-800">{section.title}</h2>
          {renderSectionItems(section)}
        </div>
      ))}
    </div>
  );
};

export default ModernTemplate; 