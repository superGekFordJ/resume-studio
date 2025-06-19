"use client";

import { RenderableItem } from "@/types/schema";

interface TitledBlockComponentProps {
  item: RenderableItem;
}

export const TitledBlockComponent = ({ item }: TitledBlockComponentProps) => {
  // Extract common fields for timeline items
  const titleField = item.fields.find(f => 
    f.key === 'jobTitle' || f.key === 'degree' || f.key === 'name' || f.key === 'title'
  );
  const subtitleField = item.fields.find(f => 
    f.key === 'company' || f.key === 'institution' || f.key === 'issuer'
  );
  const dateField = item.fields.find(f => 
    f.key === 'dateRange' || f.key === 'graduationYear' || f.key === 'date'
  );
  const descriptionField = item.fields.find(f => 
    f.key === 'description' || f.key === 'details' || f.key === 'content'
  );

  return (
    <div className="mb-3">
      {titleField?.value && subtitleField?.value && (
        <h4 className="font-medium text-[12px] text-gray-800">
          {titleField.value}
          {` at ${subtitleField.value}`}
        </h4>
      )}
      {!subtitleField?.value && titleField?.value && (
        <h4 className="font-medium text-[12px] text-gray-800">
          {titleField.value}
        </h4>
      )}
      {dateField?.value && (
        <p className="text-[10px] text-gray-500 mb-1">{dateField.value}</p>
      )}
      {descriptionField?.value && (
        <p className="text-[11px] leading-[1.4] text-gray-700 whitespace-pre-line">
          {Array.isArray(descriptionField.value) ? descriptionField.value.join(', ') : descriptionField.value}
        </p>
      )}
    </div>
  );
}; 