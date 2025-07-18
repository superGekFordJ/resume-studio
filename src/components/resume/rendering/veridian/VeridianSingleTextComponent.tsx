'use client';

import { RenderableSection, RoleMap } from '@/types/schema';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface VeridianSingleTextComponentProps {
  section: RenderableSection;
  roleMap?: RoleMap;
}

export const VeridianSingleTextComponent = ({
  section,
  roleMap,
}: VeridianSingleTextComponentProps) => {
  if (!section?.items?.[0]) return null;

  const item = section.items[0];
  const contentField =
    pickFieldByRole(item, 'description', roleMap) ||
    pickFieldByRole(item, 'title', roleMap) ||
    item.fields[0];

  if (!contentField?.value) return null;

  const content = Array.isArray(contentField.value)
    ? contentField.value.join('\n')
    : String(contentField.value);

  if (contentField.markdownEnabled) {
    return (
      <MarkdownRenderer className="text-[12px] leading-[1.4] text-white/85 font-sans">
        {content}
      </MarkdownRenderer>
    );
  }

  return (
    <p className="text-[12px] leading-[1.4] text-white/85 whitespace-pre-line font-sans">
      {content}
    </p>
  );
};
