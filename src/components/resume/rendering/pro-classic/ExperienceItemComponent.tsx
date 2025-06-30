"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { ProClassicMarkdownRenderer } from "./ProClassicMarkdownRenderer";
import { pickFieldByRole, getItemDateRange } from "@/lib/roleMapUtils";

interface ExperienceItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current text-[#888888] mr-1.5">
    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
  </svg>
);

export const ExperienceItemComponent = ({ item, roleMap }: ExperienceItemComponentProps) => {
  const titleField = pickFieldByRole(item, 'title', roleMap);
  const companyField = pickFieldByRole(item, 'organization', roleMap);
  const dateRange = getItemDateRange(item, roleMap);
  const descriptionField = pickFieldByRole(item, 'description', roleMap);
  
  const descriptionContent = descriptionField?.value ? 
    (Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value) : '';

  return (
    <div className="py-1.5 px-3">
        <h3 className="font-raleway text-[17px] leading-[20px] text-[#124f44] font-semibold m-0 inline">
          {titleField?.value}
        </h3>
        {companyField?.value && (
          <span className="font-raleway text-[15px] leading-[18px] text-[#3cb371] font-medium ml-2 pt-1">
            {companyField.value}
          </span>
        )}

      <div className="flex flex-wrap mt-1 gap-x-4 gap-y-1 text-xs text-[#888888]">
        {dateRange && (
          <div className="flex items-center">
            <CalendarIcon />
            <span>{dateRange}</span>
          </div>
        )}
      </div>

      {descriptionField?.value && (
        <>
          {descriptionField.markdownEnabled ? (
            <ProClassicMarkdownRenderer className="mt-1">
              {descriptionContent}
            </ProClassicMarkdownRenderer>
          ) : (
            <p className="text-[13px] leading-[18px] text-[#555] mt-1">
              {descriptionField.value}
            </p>
          )}
        </>
      )}
    </div>
  );
}; 