'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { pickFieldByRole } from '@/lib/roleMapUtils';
import { Trophy, Award, Zap } from 'lucide-react';

interface AchievementItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const AchievementItemComponent = ({
  item,
  roleMap,
}: AchievementItemComponentProps) => {
  const titleField = pickFieldByRole(item, 'title', roleMap);
  const organizationField = pickFieldByRole(item, 'organization', roleMap);
  const descriptionField = pickFieldByRole(item, 'description', roleMap);

  // Choose an icon based on the title or use a default
  const getIcon = () => {
    const title = titleField?.value?.toString().toLowerCase() || '';
    if (title.includes('award') || title.includes('winner')) {
      return <Award className="w-[18px] h-[18px] mt-[2px]" />;
    }
    if (title.includes('certification') || title.includes('certified')) {
      return <Trophy className="w-[18px] h-[18px] mt-[2px]" />;
    }
    return <Zap className="w-[18px] h-[18px] mt-[2px]" />;
  };

  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="text-white">{getIcon()}</div>
      <div>
        <h3 className="font-volkhov text-[15px] mb-1 text-white">
          {titleField?.value}
        </h3>
        {organizationField?.value && (
          <p className="text-[12px] mb-1 text-white/85 font-sans">
            {organizationField.value}
          </p>
        )}
        {descriptionField?.value && (
          <p className="text-[12px] leading-[1.4] m-0 text-white/85 font-sans">
            {Array.isArray(descriptionField.value)
              ? descriptionField.value.join(' ')
              : descriptionField.value}
          </p>
        )}
      </div>
    </div>
  );
};
