'use client';

import { RenderableItem, RoleMap } from '@/types/schema';
import { getItemDateRange, pickFieldByRole } from '@/lib/roleMapUtils';
import { ProClassicMarkdownRenderer } from './ProClassicMarkdownRenderer';
import { Link, Calendar } from 'lucide-react';

interface OpenSourceItemComponentProps {
  item: RenderableItem;
  roleMap?: RoleMap;
}

export const OpenSourceItemComponent = ({
  item,
  roleMap,
}: OpenSourceItemComponentProps) => {
  const nameField = pickFieldByRole(item, 'title', roleMap);
  const urlField = pickFieldByRole(item, 'url', roleMap);
  const descriptionField = pickFieldByRole(item, 'description', roleMap);
  const dateRange = getItemDateRange(item, roleMap);

  const descriptionContent = descriptionField?.value
    ? Array.isArray(descriptionField.value)
      ? descriptionField.value.join(', ')
      : descriptionField.value
    : '';

  return (
    <div className="py-1.5 px-3">
      <h3 className="font-raleway text-[17px] leading-[20px] text-[#124f44] font-semibold m-0">
        {nameField?.value}
      </h3>
      <div className="flex flex-wrap mt-1 gap-x-4 gap-y-1 text-xs text-[#888888]">
        {urlField?.value && (
          <a
            href={urlField.value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-[#3cb371]"
          >
            <Link size={12} className="mr-1.5" />
            <span>{urlField.value}</span>
          </a>
        )}
        {dateRange && (
          <div className="flex items-center">
            <Calendar size={12} className="mr-1.5" />
            <span>{dateRange}</span>
          </div>
        )}
      </div>
      {descriptionField?.value && (
        <ProClassicMarkdownRenderer className="mt-1">
          {descriptionContent}
        </ProClassicMarkdownRenderer>
      )}
    </div>
  );
};
