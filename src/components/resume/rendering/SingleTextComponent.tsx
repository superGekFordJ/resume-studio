'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface SingleTextComponentProps {
  items: RenderableItem[];
  roleMap?: RoleMap;
}

export const SingleTextComponent = ({
  items,
  roleMap,
}: SingleTextComponentProps) => {
  // For single text sections, typically only one item with a content field
  const firstItem = items[0];
  if (!firstItem) return null;

  // Use role-based lookup for description/content field
  const contentField =
    pickFieldByRole(firstItem, 'description', roleMap) || firstItem.fields[0];
  if (!contentField) return null;

  const content = Array.isArray(contentField.value)
    ? contentField.value.join('\n')
    : contentField.value;

  if (contentField.markdownEnabled) {
    return (
      <MarkdownRenderer className="text-[11px] text-gray-700">
        {content}
      </MarkdownRenderer>
    );
  }

  return (
    <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">
      {content}
    </p>
  );
};
