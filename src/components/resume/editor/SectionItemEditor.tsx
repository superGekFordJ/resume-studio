"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import AIFieldWrapper from './AIFieldWrapper';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import type { DynamicResumeSection, DynamicSectionItem, FieldSchema } from '@/types/schema';

interface SectionItemEditorProps {
  item: DynamicSectionItem;
  section: DynamicResumeSection;
  index: number;
  onRemove: () => void;
}

export default function SectionItemEditor({ item, section, index, onRemove }: SectionItemEditorProps) {
  const schemaRegistry = SchemaRegistry.getInstance();
  const updateField = useResumeStore(state => state.updateField);
  const resumeData = useResumeStore(state => state.resumeData);
  const isAutocompleteEnabled = useResumeStore(state => state.isAutocompleteEnabled);
  
  const constructUniqueFieldId = (fieldName: string, itemId: string, sectionType: string): string => {
    const safeItemId = itemId.replace(/_/g, '-');
    return `${safeItemId}_${sectionType}_${fieldName}`;
  };
  
  const handleFieldChange = (fieldId: string, value: any) => {
    updateField({
      sectionId: section.id,
      fieldId,
      value,
      itemId: item.id
    });
  };
  
  // Get schema for this section
  const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
  
  if (!sectionSchema) {
    console.warn(`No schema found for section type: ${section.schemaId}`);
    return null;
  }
  
  // Get field value from dynamic item
  const getFieldValue = (field: FieldSchema): any => {
      return item.data[field.id] || '';
  };
  
  return (
    <Card className="my-4 p-3 space-y-2 bg-muted/50">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-sm">Item {index + 1}</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRemove} 
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 size={16} />
        </Button>
      </div>
      <div className="space-y-3">
        {sectionSchema.fields.map(field => {
          const uniqueFieldId = constructUniqueFieldId(field.id, item.id, section.schemaId);
          const currentValue = getFieldValue(field);
          
          // For AI-enabled fields, wrap in AIFieldWrapper
          if (field.aiHints?.autocompleteEnabled && (field.type === 'text' || field.type === 'textarea')) {
            return (
              <AIFieldWrapper
                key={field.id}
                uniqueFieldId={uniqueFieldId}
                label={field.label}
                value={currentValue}
                onValueChange={(value) => handleFieldChange(field.id, value)}
                fieldId={field.id}
                sectionId={section.id}
                itemId={item.id}
                userJobTitle={resumeData.personalDetails.jobTitle}
                sectionType={section.schemaId}
                currentItem={item}
                allResumeSections={resumeData.sections}
                currentSectionId={section.id}
                className={field.uiProps?.rows === 1 || field.type === 'text' ? "min-h-[40px]" : "min-h-[80px]"}
                isAutocompleteEnabled={isAutocompleteEnabled}
                placeholder={field.uiProps?.placeholder}
              />
            );
          }
          
          // For non-AI fields, use DynamicFieldRenderer
          return (
            <DynamicFieldRenderer
              key={field.id}
              field={field}
              value={currentValue}
              onChange={(value) => handleFieldChange(field.id, value)}
              userJobTitle={resumeData.personalDetails.jobTitle}
              currentItem={item}
              allResumeSections={resumeData.sections}
              currentSectionId={section.id}
              isAutocompleteEnabled={isAutocompleteEnabled}
              itemId={item.id}
              schemaRegistry={schemaRegistry}
              sectionId={section.id}
              fieldId={field.id}
            />
          );
        })}
      </div>
    </Card>
  );
} 