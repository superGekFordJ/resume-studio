"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { pickFieldByRole, getItemDateRange } from "@/lib/roleMapUtils";

interface TitledBlockComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const TitledBlockComponent = ({ item, roleMap }: TitledBlockComponentProps) => {
  // Use role-based lookup
  const titleField = pickFieldByRole(item, 'title', roleMap);
  const subtitleField = pickFieldByRole(item, 'organization', roleMap);
  const dateField = { value: getItemDateRange(item, roleMap) }; // Wrap in object to match original structure
  const descriptionField = pickFieldByRole(item, 'description', roleMap);

  const descriptionContent = descriptionField?.value ? 
    (Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value) : '';

  return (
    <div className="mb-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-[12px] text-gray-800 flex-grow">
          {titleField?.value}
          {subtitleField?.value && (
            <span className="text-gray-600 font-normal ml-2">
              &middot; {subtitleField.value}
            </span>
          )}
        </h4>
      </div>
      {dateField?.value && (
        <p className="text-[10px] text-gray-500 mb-1">{dateField.value}</p>
      )}
      {descriptionField?.value && (
        <>
          {descriptionField.markdownEnabled ? (
            <MarkdownRenderer className="text-[11px] text-gray-700">
              {descriptionContent}
            </MarkdownRenderer>
          ) : (
            <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">
              {descriptionContent}
            </p>
          )}
        </>
      )}
    </div>
  );
}; 