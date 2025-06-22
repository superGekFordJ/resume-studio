"use client";

import { RenderableItem } from "@/types/schema";
import { ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface ProjectItemComponentProps {
  item: RenderableItem;
}

export const ProjectItemComponent = ({ item }: ProjectItemComponentProps) => {
  // Extract project-specific fields
  const nameField = item.fields.find(f => f.key === 'name');
  const descriptionField = item.fields.find(f => f.key === 'description');
  const technologiesField = item.fields.find(f => f.key === 'technologies');
  const urlField = item.fields.find(f => f.key === 'url');
  const startDateField = item.fields.find(f => f.key === 'startDate');
  const endDateField = item.fields.find(f => f.key === 'endDate');

  // Format date range - only if we have dates
  const dateRange = (startDateField?.value || endDateField?.value)
    ? `${startDateField?.value || ''} - ${endDateField?.value || 'Present'}`
    : null;

  const descriptionContent = descriptionField?.value ? 
    (Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value) : '';

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          {nameField?.value && (
            <h4 className="font-semibold text-[12px] text-gray-800 mb-1">
              {nameField.value}
              {urlField?.value && (
                <a 
                  href={urlField.value as string} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-2 text-primary hover:text-primary/80"
                >
                  <ExternalLink size={12} />
                </a>
              )}
            </h4>
          )}
          {dateRange && (
            <p className="text-[10px] text-gray-500 mb-1">{dateRange}</p>
          )}
        </div>
      </div>
      
      {descriptionField?.value && (
        <>
          {descriptionField.markdownEnabled ? (
            <MarkdownRenderer className="text-[11px] text-gray-700 mb-2">
              {descriptionContent}
            </MarkdownRenderer>
          ) : (
            <p className="text-[11px] leading-[1.4] text-gray-700 mb-2 whitespace-pre-line">
              {descriptionContent}
            </p>
          )}
        </>
      )}
      
      {technologiesField?.value && (
        <div className="flex flex-wrap gap-1">
          {(Array.isArray(technologiesField.value) ? technologiesField.value : [technologiesField.value]).map((tech, idx) => (
            <span 
              key={idx}
              className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 text-[9px] rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}; 