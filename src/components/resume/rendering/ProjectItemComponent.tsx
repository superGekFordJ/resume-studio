"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { ExternalLink } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { pickFieldByRole, getItemDateRange } from "@/lib/roleMapUtils";

interface ProjectItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const ProjectItemComponent = ({ item, roleMap }: ProjectItemComponentProps) => {
  const nameField = pickFieldByRole(item, 'title', roleMap);
  const descriptionField = pickFieldByRole(item, 'description', roleMap);
  const technologiesField = pickFieldByRole(item, 'skills', roleMap);
  const urlField = pickFieldByRole(item, 'url', roleMap);
  const dateRange = getItemDateRange(item, roleMap);

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