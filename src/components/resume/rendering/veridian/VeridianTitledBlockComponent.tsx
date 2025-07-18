'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { pickFieldByRole, getItemDateRange } from '@/lib/roleMapUtils';

interface VeridianTitledBlockComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const VeridianTitledBlockComponent = ({
  item,
  roleMap,
}: VeridianTitledBlockComponentProps) => {
  // Use role-based lookup
  const titleField = pickFieldByRole(item, 'title', roleMap);
  const subtitleField = pickFieldByRole(item, 'organization', roleMap);
  const dateField = { value: getItemDateRange(item, roleMap) }; // Wrap in object to match original structure
  const descriptionField = pickFieldByRole(item, 'description', roleMap);

  const descriptionContent = descriptionField?.value
    ? Array.isArray(descriptionField.value)
      ? descriptionField.value.join(', ')
      : descriptionField.value
    : '';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-start">
        <h4 className="font-volkhov text-[15px] text-white flex-grow">
          {titleField?.value}
          {subtitleField?.value && (
            <span className="text-white/85 font-normal ml-2">
              &middot; {subtitleField.value}
            </span>
          )}
        </h4>
      </div>
      {dateField?.value && (
        <p className="text-[12px] text-white/85 mb-2 font-sans">
          {dateField.value}
        </p>
      )}
      {descriptionField?.value && (
        <>
          {descriptionField.markdownEnabled ? (
            <MarkdownRenderer className="text-[12px] text-white/85 font-sans">
              {descriptionContent}
            </MarkdownRenderer>
          ) : (
            <p className="text-[12px] leading-[1.4] text-white/85 whitespace-pre-line font-sans">
              {descriptionContent}
            </p>
          )}
        </>
      )}
    </div>
  );
};
