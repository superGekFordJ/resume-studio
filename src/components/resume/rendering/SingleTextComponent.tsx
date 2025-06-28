"use client";

import { RenderableItem } from "@/types/schema";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface SingleTextComponentProps {
  items: RenderableItem[];
}

export const SingleTextComponent = ({ items }: SingleTextComponentProps) => {
  // For single text sections, typically only one item with a content field
  const firstItem = items[0];
  if (!firstItem) return null;
  
  const contentField = firstItem.fields.find(f => f.key === 'content') || firstItem.fields[0];
  if (!contentField) return null;

  const content = Array.isArray(contentField.value) ? contentField.value.join('\n') : contentField.value;

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