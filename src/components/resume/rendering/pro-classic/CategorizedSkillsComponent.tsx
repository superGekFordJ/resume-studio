"use client";

import { RenderableItem, RoleMap } from "@/types/schema";
import { pickFieldByRole } from "@/lib/roleMapUtils";

interface CategorizedSkillsComponentProps {
  items: RenderableItem[];
  roleMap?: RoleMap;
}

export const CategorizedSkillsComponent = ({ items, roleMap }: CategorizedSkillsComponentProps) => {
  return (
    <div>
      {items.map((item) => {
        const categoryField = pickFieldByRole(item, 'title', roleMap);
        const skillsField = pickFieldByRole(item, 'skills', roleMap);
        
        const skills = skillsField?.value
          ? (Array.isArray(skillsField.value) ? skillsField.value : [skillsField.value])
          : [];

        if (!categoryField?.value || skills.length === 0) {
          return null;
        }

        return (
          <div key={item.id} className="py-1.5 px-3">
            <h3 className="font-raleway text-[15px] leading-[18px] text-[#3cb371] font-medium pt-1">
              {categoryField.value}
            </h3>
            <div className="flex flex-wrap gap-2 py-1.5">
              {skills.map((skill, idx) => (
                <div key={idx} className="text-[13px] px-1.5 py-0.5 border border-[#e0e0e0] rounded-md text-[#333333]">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}; 