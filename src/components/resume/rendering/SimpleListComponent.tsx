"use client";

import { RenderableSection, RoleMap } from "@/types/schema";
import { pickFieldByRole } from "@/lib/roleMapUtils";

interface SimpleListComponentProps {
  section: RenderableSection;
  roleMap?: RoleMap;
}

export const SimpleListComponent = ({ section, roleMap }: SimpleListComponentProps) => {
  // Add a guard clause to prevent rendering with incomplete data
  if (!section || !section.items) {
    return null;
  }

  return (
    <ul className="list-disc list-inside text-[11px] space-y-0.5">
      {section.items.map(item => {
        // Try to find a primary field using role mapping, fallback to first field
        const primaryField = pickFieldByRole(item, 'title', roleMap) || 
                           pickFieldByRole(item, 'skills', roleMap) ||
                           pickFieldByRole(item, 'description', roleMap) || 
                           item.fields[0];
        if (!primaryField?.value) return null;
        
        const value = Array.isArray(primaryField.value) 
          ? primaryField.value.join(', ')
          : primaryField.value;
          
        return <li key={item.id}>{value}</li>;
      })}
    </ul>
  );
}; 