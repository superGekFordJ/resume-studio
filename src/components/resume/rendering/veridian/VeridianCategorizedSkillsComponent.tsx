'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { pickFieldByRole } from '@/lib/roleMapUtils';

interface VeridianCategorizedSkillsComponentProps {
  items: RenderableItem[];
  roleMap?: RoleMap;
}

export const VeridianCategorizedSkillsComponent = ({
  items,
  roleMap,
}: VeridianCategorizedSkillsComponentProps) => {
  return (
    <div>
      {items.map((item) => {
        const categoryField = pickFieldByRole(item, 'title', roleMap);
        const skillsField = pickFieldByRole(item, 'skills', roleMap);

        const skills = skillsField?.value
          ? Array.isArray(skillsField.value)
            ? skillsField.value
            : [skillsField.value]
          : [];

        if (!categoryField?.value || skills.length === 0) {
          return null;
        }

        return (
          <div key={item.id} className="mb-4">
            <h3 className="font-volkhov text-[14px] font-normal text-white mb-2">
              {categoryField.value}
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="text-[12px] px-2 py-1 border border-white/30 rounded-md text-white/90 bg-white/10 font-sans"
                >
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
