'use client';

import { Badge } from '@/components/ui/badge';
import { RenderableSection, RoleMap } from '@/types/schema';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface BadgeListComponentProps {
  section: RenderableSection;
  roleMap?: RoleMap;
}

export const BadgeListComponent = ({
  section,
  roleMap,
}: BadgeListComponentProps) => {
  // Add a guard clause to prevent rendering with incomplete data
  if (!section || !section.items) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
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
            variant="secondary"
            className="text-[10px] px-2 py-0.5 font-normal"
          >
            {value}
          </Badge>
        ));
      })}
    </div>
  );
};
