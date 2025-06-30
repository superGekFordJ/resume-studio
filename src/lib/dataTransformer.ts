import { ResumeData, PersonalDetails } from "@/types/resume";
import { RenderableResume, RenderableSection, RenderableItem, RenderableField, DynamicResumeSection } from "@/types/schema";
import { SchemaRegistry } from "./schemaRegistry";

export function transformToRenderableView(resumeData: ResumeData, schemaRegistry: SchemaRegistry): RenderableResume {
  const sections: RenderableSection[] = resumeData.sections
    .filter(s => s.visible)
    .map(section => {
      // All sections are now dynamic
        const dynamicSection = section as DynamicResumeSection;
        return transformDynamicSection(dynamicSection, schemaRegistry);
    })
    .filter((s): s is RenderableSection => s !== null);

  return {
    personalDetails: resumeData.personalDetails as PersonalDetails,
    sections,
  };
}

function transformDynamicSection(section: DynamicResumeSection, schemaRegistry: SchemaRegistry): RenderableSection | null {
  const schema = schemaRegistry.getSectionSchema(section.schemaId);
  if (!schema) return null;

  const items: RenderableItem[] = section.items.map(item => {
    const fields: RenderableField[] = schema.fields
      .filter(field => {
        const value = item.data[field.id];
        // Only include fields that have actual values
        return value !== undefined && value !== '' && value !== null && 
               (Array.isArray(value) ? value.length > 0 : true);
      })
      .map(field => ({
        key: field.id,
        label: field.label,
        value: item.data[field.id],
        markdownEnabled: field.uiProps?.markdownEnabled
      }));
    return { id: item.id, fields };
  });

  return {
    id: section.id,
    title: section.title,
    schemaId: section.schemaId,
    defaultRenderType: schema.uiConfig?.defaultRenderType,
    items
  };
} 