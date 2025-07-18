'use client';

import { Badge } from '@/components/ui/badge';
import { RenderableSection, RoleMap } from '@/types/schema';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface VeridianBadgeListComponentProps {
  section: RenderableSection;
  roleMap?: RoleMap;
}

export const VeridianBadgeListComponent = ({
  section,
  roleMap,
}: VeridianBadgeListComponentProps) => {
  // Add a guard clause to prevent rendering with incomplete data
  if (!section || !section.items) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {section.items.map((item) => {
        // Try to find a primary field using role mapping
        const primaryField =
          pickFieldByRole(item, 'skills', roleMap) ||
          pickFieldByRole(item, 'title', roleMap) ||
          item.fields[0];
        if (!primaryField?.value) return null;

        const values = Array.isArray(primaryField.value)
          ? primaryField.value
          : [primaryField.value];

        return values.map((value, index) => (
          <Badge
            key={`${item.id}-${index}`}
            variant="outline"
            className="text-[12px] px-[10px] py-1 font-normal bg-white/15 text-white border-0 rounded-[4px] font-sans"
          >
            {value}
          </Badge>
        ));
      })}
    </div>
  );
};
