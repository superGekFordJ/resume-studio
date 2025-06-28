"use client";

import { RenderableItem } from "@/types/schema";

interface EducationItemComponentProps {
  item: RenderableItem;
}

export const EducationItemComponent = ({ item }: EducationItemComponentProps) => {
  const degreeField = item.fields.find(f => f.key === 'degree');
  const universityField = item.fields.find(f => f.key === 'institution');
  const graduationYearField = item.fields.find(f => f.key === 'graduationYear');
  const startDateField = item.fields.find(f => f.key === 'startDate');
  const endDateField = item.fields.find(f => f.key === 'endDate');
  
  // Determine display date - prefer date range if available, fall back to graduation year
  const dateDisplay = (() => {
    if (startDateField?.value || endDateField?.value) {
      return `${startDateField?.value || ''} - ${endDateField?.value || 'Present'}`;
    }
    if (graduationYearField?.value) {
      return graduationYearField.value as string;
    }
    return null;
  })();

  return (
    <div className="py-1.5 px-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-raleway text-[17px] leading-[20px] text-[#124f44] font-semibold m-0 mb-0.5">
            {degreeField?.value}
          </h3>
          {universityField?.value && (
            <span className="font-raleway text-[15px] leading-[18px] text-[#3cb371] font-medium pt-1">
              {universityField.value}
            </span>
          )}
        </div>
        {dateDisplay && (
          <span className="text-xs text-[#888888] whitespace-nowrap pt-1">
            {dateDisplay}
          </span>
        )}
      </div>
    </div>
  );
}; 