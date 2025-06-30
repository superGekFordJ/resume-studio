"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { pickFieldByRole } from "@/lib/roleMapUtils";

interface SimpleSkillsComponentProps {
  items: RenderableItem[];
  roleMap?: RoleMap;
}

export const SimpleSkillsComponent = ({ items, roleMap }: SimpleSkillsComponentProps) => {
  const allSkills: string[] = [];
  
  // Extract all skill names from items using role-based lookup
  items.forEach(item => {
    const nameField = pickFieldByRole(item, 'skills', roleMap);
    if (nameField?.value) {
      allSkills.push(nameField.value as string);
    }
  });

  if (allSkills.length === 0) return null;

  return (
    <div className="py-1.5 px-3">
      <div className="flex flex-wrap gap-2">
        {allSkills.map((skill, idx) => (
          <div key={idx} className="text-[13px] px-2.5 py-1 border border-[#e0e0e0] rounded-md text-[#333333]">
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
}; 