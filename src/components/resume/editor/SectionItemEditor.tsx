'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, GripVertical } from 'lucide-react';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import AIFieldWrapper from './AIFieldWrapper';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import type {
  DynamicResumeSection,
  DynamicSectionItem,
  FieldSchema,
} from '@/types/schema';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface SectionItemEditorProps {
  item: DynamicSectionItem;
  section: DynamicResumeSection;
  index: number;
  onRemove: () => void;
}

function SectionItemEditor({
  item,
  section,
  index,
  onRemove,
}: SectionItemEditorProps) {
  const { t: tSchema } = useTranslation('schemas');
  const { t: tComp } = useTranslation('components');
  const schemaRegistry = SchemaRegistry.getInstance();
  const updateField = useResumeStore((state) => state.updateField);
  const isAutocompleteEnabled = useResumeStore(
    (state) => state.isAutocompleteEnabled
  );

  // Get schema for this section
  const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);

  // Use sortable hook for drag-and-drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const constructUniqueFieldId = (
    fieldName: string,
    itemId: string,
    sectionType: string
  ): string => {
    const safeItemId = itemId.replace(/_/g, '-');
    return `${safeItemId}_${sectionType}_${fieldName}`;
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    updateField({
      sectionId: section.id,
      fieldId,
      value,
      itemId: item.id,
    });
  };

  if (!sectionSchema) {
    console.warn(`No schema found for section type: ${section.schemaId}`);
    return null;
  }

  // Get field value from dynamic item
  const getFieldValue = (field: FieldSchema): unknown => {
    return item.data[field.id] || '';
  };

  // For single type sections, don't use accordion wrapper
  if (sectionSchema.type === 'single') {
    return (
      <div className="border border-[#3F51B5]/20 rounded-lg my-2">
        <div className="px-4 pb-4 pt-4 space-y-3">
          {sectionSchema.fields.map((field) => {
            const uniqueFieldId = constructUniqueFieldId(
              field.id,
              item.id,
              section.schemaId
            );
            const currentValue = getFieldValue(field);

            // For AI-enabled fields, wrap in AIFieldWrapper
            if (
              field.aiHints?.autocompleteEnabled &&
              (field.type === 'text' || field.type === 'textarea')
            ) {
              return (
                <AIFieldWrapper
                  key={field.id}
                  uniqueFieldId={uniqueFieldId}
                  label={field.label}
                  value={currentValue as string}
                  onValueChange={(value) => handleFieldChange(field.id, value)}
                  fieldId={field.id}
                  sectionId={section.id}
                  itemId={item.id}
                  sectionType={section.schemaId}
                  className={
                    field.uiProps?.rows === 1 || field.type === 'text'
                      ? 'min-h-[40px]'
                      : 'min-h-[80px]'
                  }
                  isAutocompleteEnabled={isAutocompleteEnabled}
                  placeholder={
                    field.uiProps?.placeholder
                      ? tSchema(field.uiProps.placeholder)
                      : undefined
                  }
                />
              );
            }

            // For non-AI fields, use DynamicFieldRenderer
            return (
              <DynamicFieldRenderer
                key={field.id}
                field={field}
                value={currentValue as string}
                onChange={(value) => handleFieldChange(field.id, value)}
                isAutocompleteEnabled={isAutocompleteEnabled}
                itemId={item.id}
                schemaRegistry={schemaRegistry}
                sectionId={section.id}
                fieldId={field.id}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // For list type sections, use accordion with drag-and-drop
  const getDisplayTitle = () => {
    if (sectionSchema?.fields && sectionSchema.fields.length > 0) {
      const firstFieldId = sectionSchema.fields[0].id;
      const title = item.data[firstFieldId];
      if (title && typeof title === 'string' && title.trim() !== '') {
        return title;
      }
    }
    return tComp('BatchImprovementDialog.item', { index: index + 1 });
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={item.id}
      className={`border border-[#3F51B5]/20 rounded-lg my-2 ${isDragging ? 'opacity-50' : ''}`}
    >
      <AccordionTrigger className="px-4 py-3 hover:bg-[#3F51B5]/5 rounded-t-lg">
        <div className="flex items-center space-x-3 w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#3F51B5]/10"
          >
            <GripVertical size={16} className="text-[#3F51B5]" />
          </div>
          <span
            className="font-medium text-[#3F51B5] truncate"
            title={getDisplayTitle()}
          >
            {getDisplayTitle()}
          </span>
          <div className="flex-1" />
          <div
            role="button"
            aria-label="Remove item"
            onClick={(e) => {
              e.stopPropagation(); // Prevent the accordion from toggling
              onRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                onRemove();
              }
            }}
            tabIndex={0}
            className="p-2 rounded-md text-destructive hover:text-destructive/80 hover:bg-destructive/10 focus:outline-none focus:ring-2 focus:ring-destructive/50"
          >
            <Trash2 size={16} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-3">
        {sectionSchema.fields.map((field) => {
          const uniqueFieldId = constructUniqueFieldId(
            field.id,
            item.id,
            section.schemaId
          );
          const currentValue = getFieldValue(field);

          // For AI-enabled fields, wrap in AIFieldWrapper
          if (
            field.aiHints?.autocompleteEnabled &&
            (field.type === 'text' || field.type === 'textarea')
          ) {
            return (
              <AIFieldWrapper
                key={field.id}
                uniqueFieldId={uniqueFieldId}
                label={field.label}
                value={currentValue as string}
                onValueChange={(value) => handleFieldChange(field.id, value)}
                fieldId={field.id}
                sectionId={section.id}
                itemId={item.id}
                sectionType={section.schemaId}
                className={
                  field.uiProps?.rows === 1 || field.type === 'text'
                    ? 'min-h-[40px]'
                    : 'min-h-[80px]'
                }
                isAutocompleteEnabled={isAutocompleteEnabled}
                placeholder={
                  field.uiProps?.placeholder
                    ? tSchema(field.uiProps.placeholder)
                    : undefined
                }
              />
            );
          }

          // For non-AI fields, use DynamicFieldRenderer
          return (
            <DynamicFieldRenderer
              key={field.id}
              field={field}
              value={currentValue as string}
              onChange={(value) => handleFieldChange(field.id, value)}
              isAutocompleteEnabled={isAutocompleteEnabled}
              itemId={item.id}
              schemaRegistry={schemaRegistry}
              sectionId={section.id}
              fieldId={field.id}
            />
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

export default React.memo(SectionItemEditor);
