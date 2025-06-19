"use client";

import { RenderableItem } from "@/types/schema";
import { ChevronRight } from "lucide-react";

interface AdvancedSkillsComponentProps {
  item: RenderableItem;
}

export const AdvancedSkillsComponent = ({ item }: AdvancedSkillsComponentProps) => {
  // Extract advanced skills fields
  const categoryField = item.fields.find(f => f.key === 'category');
  const skillsField = item.fields.find(f => f.key === 'skills');
  const proficiencyField = item.fields.find(f => f.key === 'proficiency');
  const yearsField = item.fields.find(f => f.key === 'yearsOfExperience');

  const skills = skillsField?.value
    ? (Array.isArray(skillsField.value) ? skillsField.value : [skillsField.value])
    : [];

  // Define proficiency colors
  const proficiencyColors: Record<string, string> = {
    'Beginner': 'bg-gray-100 text-gray-600',
    'Intermediate': 'bg-blue-100 text-blue-700',
    'Advanced': 'bg-green-100 text-green-700',
    'Expert': 'bg-purple-100 text-purple-700'
  };

  const proficiencyColor = proficiencyField?.value 
    ? proficiencyColors[proficiencyField.value as string] || 'bg-gray-100 text-gray-600'
    : 'bg-gray-100 text-gray-600';

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <ChevronRight size={12} className="text-primary" />
        {categoryField?.value && (
          <h5 className="font-medium text-[11px] text-gray-800">
            {categoryField.value}
          </h5>
        )}
        {proficiencyField?.value && (
          <span className={`text-[9px] px-2 py-0.5 rounded-full ${proficiencyColor}`}>
            {proficiencyField.value}
          </span>
        )}
        {yearsField?.value && (
          <span className="text-[9px] text-gray-500">
            ({yearsField.value}+ years)
          </span>
        )}
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1 ml-4">
          {skills.map((skill, idx) => (
            <span 
              key={idx}
              className="inline-block bg-gray-50 border border-gray-200 text-gray-700 px-2 py-0.5 text-[10px] rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}; 