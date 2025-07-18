'use client';

import { RenderableSection, RoleMap } from '@/types/schema';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface CoverLetterComponentProps {
  section: RenderableSection;
  roleMap?: RoleMap;
}

export const CoverLetterComponent = ({
  section,
  roleMap,
}: CoverLetterComponentProps) => {
  // For cover letter sections, typically only one item with content field
  const firstItem = section.items[0];
  if (!firstItem) return null;

  // Use role-based lookup for description/content field
  const contentField = pickFieldByRole(firstItem, 'description', roleMap);
  if (!contentField || !contentField.value) return null;

  const content = Array.isArray(contentField.value)
    ? contentField.value.join('\n')
    : contentField.value;

  return (
    <div className="max-w-2xl mx-auto mt-2">
      <MarkdownRenderer className="text-[14px] leading-relaxed text-gray-700 [&>p]:mb-8">
        {content}
      </MarkdownRenderer>
    </div>
  );
};
