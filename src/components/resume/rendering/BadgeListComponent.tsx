"use client";

import { RenderableItem } from "@/types/schema";
import { Badge } from "@/components/ui/badge";

interface BadgeListComponentProps {
  items: RenderableItem[];
}

export const BadgeListComponent = ({ items }: BadgeListComponentProps) => {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(item => {
        // Find the primary field (usually 'name' for skills)
        const primaryField = item.fields.find(f => f.key === 'name') || item.fields[0];
        if (!primaryField) return null;
        
        return (
          <Badge key={item.id} variant="secondary" className="text-[10px]">
            {Array.isArray(primaryField.value) ? primaryField.value.join(', ') : primaryField.value}
          </Badge>
        );
      })}
    </div>
  );
}; 