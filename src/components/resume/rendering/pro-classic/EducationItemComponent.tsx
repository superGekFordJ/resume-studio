'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { pickFieldByRole, getItemDateRange } from '@/lib/roleMapUtils';

interface EducationItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const EducationItemComponent = ({
  item,
  roleMap,
}: EducationItemComponentProps) => {
  const degreeField = pickFieldByRole(item, 'title', roleMap);
  const universityField = pickFieldByRole(item, 'organization', roleMap);

  // Use the standardized and robust date range utility
  const dateDisplay = getItemDateRange(item, roleMap);

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
