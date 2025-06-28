"use client";

import { RenderableItem } from "@/types/schema";
import { ProClassicMarkdownRenderer } from "./ProClassicMarkdownRenderer";

interface OpenSourceItemComponentProps {
  item: RenderableItem;
}

const CalendarIcon = () => (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current text-[#888888] mr-1.5">
      <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
    </svg>
);

const LinkIcon = () => (
    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current text-[#888888] mr-1.5">
        <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>
);

export const OpenSourceItemComponent = ({ item }: OpenSourceItemComponentProps) => {
  const nameField = item.fields.find(f => f.key === 'name');
  const urlField = item.fields.find(f => f.key === 'url');
  const descriptionField = item.fields.find(f => f.key === 'description');
  const startDateField = item.fields.find(f => f.key === 'startDate');
  const endDateField = item.fields.find(f => f.key === 'endDate');
  
  const dateRange = (startDateField?.value || endDateField?.value)
    ? `${startDateField?.value || ''} - ${endDateField?.value || 'Present'}`
    : null;

  const urlValue = urlField?.value as string || '';
  const descriptionContent = descriptionField?.value as string || '';

  return (
    <div className="py-1.5 px-3">
        <h3 className="font-raleway text-[17px] leading-[20px] text-[#124f44] font-semibold m-0">
          {nameField?.value}
        </h3>


      <div className="flex flex-wrap mt-1 gap-x-4 gap-y-1 text-xs text-[#888888]">
        {dateRange && (
          <div className="flex items-center">
            <CalendarIcon />
            <span>{dateRange}</span>
          </div>
        )}
        {urlValue && (
            <a href={urlValue} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                <LinkIcon />
                <span>{urlValue.replace(/^https?:\/\//, '')}</span>
            </a>
        )}
      </div>

      {descriptionContent && (
        <ProClassicMarkdownRenderer className="mt-1">
            {descriptionContent}
        </ProClassicMarkdownRenderer>
      )}
    </div>
  );
}; 