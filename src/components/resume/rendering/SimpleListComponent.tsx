"use client";

import { RenderableItem } from "@/types/schema";

interface SimpleListComponentProps {
  items: RenderableItem[];
}

export const SimpleListComponent = ({ items }: SimpleListComponentProps) => {
  return (
    <ul className="list-disc list-inside space-y-1">
      {items.map(item => {
        // Find the primary field (usually 'name' or 'content')
        const primaryField = item.fields.find(f => f.key === 'name' || f.key === 'content') || item.fields[0];
        if (!primaryField) return null;
        
        return (
          <li key={item.id} className="text-[11px]">
            {Array.isArray(primaryField.value) ? primaryField.value.join(', ') : primaryField.value}
          </li>
        );
      })}
    </ul>
  );
}; 