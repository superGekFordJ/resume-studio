import { ResumeData, isLegacyResumeData, ResumeSection, SectionType, PersonalDetails } from "@/types/resume";
import { RenderableResume, RenderableSection, RenderableItem, RenderableField, DynamicResumeSection } from "@/types/schema";
import { SchemaRegistry } from "./schemaRegistry";

export function transformToRenderableView(resumeData: ResumeData, schemaRegistry: SchemaRegistry): RenderableResume {
  const sections: RenderableSection[] = resumeData.sections
    .filter(s => s.visible)
    .map(section => {
      // Handle legacy sections
      if ('type' in section) {
        const legacySection = section as ResumeSection;
        return transformLegacySection(legacySection);
      } else {
        // Handle dynamic sections
        const dynamicSection = section as DynamicResumeSection;
        return transformDynamicSection(dynamicSection, schemaRegistry);
      }
    })
    .filter((s): s is RenderableSection => s !== null);

  return {
    personalDetails: resumeData.personalDetails as PersonalDetails,
    sections,
  };
}

function transformLegacySection(section: ResumeSection): RenderableSection | null {
  // Get schema registry for legacy sections
  const schemaRegistry = SchemaRegistry.getInstance();
  const schema = schemaRegistry.getSectionSchema(section.type);
  
  const items: RenderableItem[] = section.items.map(item => {
    const fields: RenderableField[] = [];
    
    switch (section.type) {
      case 'experience':
        if ('jobTitle' in item) {
          fields.push({ key: 'jobTitle', label: 'Job Title', value: item.jobTitle });
          fields.push({ key: 'company', label: 'Company', value: item.company });
          fields.push({ key: 'dateRange', label: 'Date Range', value: `${item.startDate} - ${item.endDate}` });
          // Check if description field has markdown enabled
          const descriptionField = schema?.fields.find(f => f.id === 'description');
          fields.push({ 
            key: 'description', 
            label: 'Description', 
            value: item.description,
            markdownEnabled: descriptionField?.uiProps?.markdownEnabled
          });
        }
        break;
      
      case 'education':
        if ('degree' in item) {
          fields.push({ key: 'degree', label: 'Degree', value: item.degree });
          fields.push({ key: 'institution', label: 'Institution', value: item.institution });
          fields.push({ key: 'graduationYear', label: 'Graduation Year', value: item.graduationYear });
          if (item.details) {
            // Check if details field has markdown enabled
            const detailsField = schema?.fields.find(f => f.id === 'details');
            fields.push({ 
              key: 'details', 
              label: 'Details', 
              value: item.details,
              markdownEnabled: detailsField?.uiProps?.markdownEnabled
            });
          }
        }
        break;
      
      case 'skills':
        if ('name' in item) {
          fields.push({ key: 'name', label: 'Skill', value: item.name });
        }
        break;
      
      case 'summary':
      case 'customText':
        if ('content' in item) {
          // Check if content field has markdown enabled
          const contentField = schema?.fields.find(f => f.id === 'content');
          fields.push({ 
            key: 'content', 
            label: 'Content', 
            value: item.content,
            markdownEnabled: contentField?.uiProps?.markdownEnabled
          });
        }
        break;
    }
    
    return { id: item.id, fields };
  });
  
  return {
    id: section.id,
    title: section.title,
    schemaId: section.type, // Use type as schemaId for legacy sections
    defaultRenderType: schema?.uiConfig?.defaultRenderType,
    items
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