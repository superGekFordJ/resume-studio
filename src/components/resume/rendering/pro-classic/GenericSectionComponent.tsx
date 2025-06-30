"use client";

import { RenderableItem, RenderableSection } from "@/types/schema";

const GenericItem = ({ item }: { item: RenderableItem }) => (
    <div className="py-1.5 px-3">
        <div className="p-3 border border-[#e0e0e0] rounded-md bg-gray-50">
            {item.fields.map(field => {
                if (!field.value) return null;
                
                return (
                    <div key={field.key} className="mb-1 last:mb-0">
                        <span className="font-raleway text-[13px] font-medium text-[#3cb371] mr-2">
                            {field.label}:
                        </span>
                        <span className="text-[13px] text-[#333333]">
                            {Array.isArray(field.value) ? field.value.join(', ') : String(field.value)}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

export const GenericSectionComponent = ({ section }: { section: RenderableSection }) => {
  return (
    <div>
        {section.items.map(item => (
            <GenericItem key={item.id} item={item} />
        ))}
    </div>
  );
}; 