import { SchemaRegistry } from '@/lib/schemaRegistry';
import { ResumeData, initialPersonalDetails } from '@/types/resume';
import { DynamicResumeSection, DynamicSectionItem, SectionSchema, FieldSchema, FieldRole } from '@/types/schema';


// Interface for AI-friendly section data
export interface AIBridgedSection {
  schemaId: string;
  items: Record<string, any>[];
}

// Interface for AI-friendly resume data (kept for compatibility with batch improvement)
export interface AIBridgedResume {
  sections: AIBridgedSection[];
}

/**
 * AIDataBridge is the sole conversion layer between AI and application data models.
 * It provides bidirectional transformation between the simplified AI formats and
 * the complex ExtendedResumeData structure.
 */
export class AIDataBridge {
  /**
   * Build dynamic schema instructions for AI based on SchemaRegistry
   * @param registry SchemaRegistry instance
   * @returns Detailed instructions text for AI prompt
   */
  static buildSchemaInstructions(registry: SchemaRegistry): string {
    const schemas = registry.getAllSectionSchemas();
    const instructions: string[] = [];
    
    for (const schema of schemas) {
      const fieldDefinitions: string[] = [];
      
      for (const field of schema.fields) {
        let fieldType: string;
        let fieldDescription = field.uiProps?.placeholder || `The ${field.label} for an item`;
        
        switch (field.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'phone':
          case 'url':
            fieldType = 'string';
            break;
          case 'date':
            fieldType = 'string (e.g., YYYY-MM or Month YYYY)';
            break;
          case 'select':
            fieldType = field.uiProps?.options 
              ? `string (must be one of: ${field.uiProps.options.join(', ')})` 
              : 'string';
            break;
          case 'combobox':
            fieldType = field.uiProps?.options
              ? `string (you can use a suggested value from this list: [${field.uiProps.options.join(', ')}], or you can provide your own custom value)`
              : 'string';
            break;
          case 'multiselect':
          case 'array':
            fieldType = 'array of strings';
            break;
          case 'object':
            fieldType = 'object';
            break;
          default:
            fieldType = 'string';
        }
        
        if (field.type === 'textarea' && field.id.includes('description')) {
          fieldDescription += ' (use bullet points with \\n- )';
        }
        
        fieldDefinitions.push(`    "${field.id}": "${fieldType}" // ${fieldDescription}`);
      }
      
      const sectionInstruction = `
- For a section with "schemaId": "${schema.id}", each object in its "items" array must have the following keys:
  {
${fieldDefinitions.join(',\n')}
  }`;
      
      instructions.push(sectionInstruction);
    }
    
    return instructions.join('\n');
  }

  static buildSchemaInstruction(registry: SchemaRegistry, schemaId: string): string {
    const schema = registry.getSectionSchema(schemaId);
    if (!schema) {
      return '';
    }
  
    const fieldDefinitions: string[] = [];
  
    for (const field of schema.fields) {
      let fieldType: string;
      let fieldDescription = field.uiProps?.placeholder || `The ${field.label} for an item`;
  
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'email':
        case 'phone':
        case 'url':
          fieldType = 'string';
          break;
        case 'date':
          fieldType = 'string (e.g., YYYY-MM or Month YYYY)';
          break;
        case 'select':
          fieldType = field.uiProps?.options
            ? `string (must be one of: ${field.uiProps.options.join(', ')})`
            : 'string';
          break;
        case 'combobox':
          fieldType = field.uiProps?.options
            ? `string (you can use a suggested value from this list: [${field.uiProps.options.join(', ')}], or you can provide your own custom value)`
            : 'string';
          break;
        case 'multiselect':
        case 'array':
          fieldType = 'array of strings';
          break;
        case 'object':
          fieldType = 'object';
          break;
        default:
          fieldType = 'string';
      }
  
      if (field.type === 'textarea' && field.id.includes('description')) {
        fieldDescription += ' (use bullet points with \\n- )';
      }
  
      fieldDefinitions.push(`    "${field.id}": "${fieldType}" // ${fieldDescription}`);
    }
  
    const sectionInstruction = `
- For a section with "schemaId": "${schema.id}", each object in its "items" array must have the following keys:
  {
${fieldDefinitions.join(',\\n')}
  }`;
  
    return sectionInstruction;
  }

  /**
   * Convert AI-generated resume data to ExtendedResumeData format
   * @param aiResult The AI-generated resume with dynamic sections
   * @param registry SchemaRegistry instance for validation and structure
   * @returns A complete ResumeData object with empty personalDetails
   */
  static toExtendedResumeData(
    aiResult: AIBridgedResume,
    registry: SchemaRegistry
  ): ResumeData {
    // Create empty personal details as per spec
    const personalDetails = { ...initialPersonalDetails };

    const sections: DynamicResumeSection[] = aiResult.sections.map(aiSection => {
      const sectionSchema = registry.getSectionSchema(aiSection.schemaId);
      if (!sectionSchema) {
        return null;
      }

      const validFieldIds = new Set(sectionSchema.fields.map(f => f.id));

      const newSection: DynamicResumeSection = {
        id: `${aiSection.schemaId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        schemaId: aiSection.schemaId,
        title: sectionSchema.name,
        visible: true,
        items: aiSection.items.map((itemData: any, index: number) => {
          // Filter out any invalid fields that AI might have hallucinated
          const validatedData: Record<string, any> = {};
          for (const [key, value] of Object.entries(itemData)) {
            if (validFieldIds.has(key) && value !== undefined && value !== '') {
              validatedData[key] = value;
            }
          }

          return {
            id: `${aiSection.schemaId}_item_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
            schemaId: aiSection.schemaId,
            data: validatedData,
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              aiGenerated: true,
            },
          };
        }),
      };
      
      return newSection;
    }).filter(Boolean) as DynamicResumeSection[];
    
    const result = {
      personalDetails,
      sections,
      templateId: 'default',
      schemaVersion: '1.0.0',
    };
    
    return result;
  }
  
  /**
   * Convert a DynamicResumeSection to simplified AI format
   * @param section The section to convert
   * @param registry SchemaRegistry instance for role mapping
   * @returns A simplified AIBridgedSection with only core fields
   */
  static fromSection(
    section: DynamicResumeSection,
    registry: SchemaRegistry
  ): AIBridgedSection {
    const roleMap = registry.getRoleMap(section.schemaId);
    const sectionSchema = registry.getSectionSchema(section.schemaId);
    
    if (!sectionSchema) {
      throw new Error(`No schema found for section: ${section.schemaId}`);
    }
    
    // Extract core fields from each item using role map
    const simplifiedItems: Record<string, any>[] = [];
    
    for (const item of section.items) {
      const simplifiedItem: Record<string, any> = {};
      
      // Use role map to identify core fields
      if (roleMap) {
        // Extract fields based on their roles
        const coreRoles: FieldRole[] = [
          'title', 
          'organization', 
          'description', 
          'startDate', 
          'endDate',
          'level',
          'skills'
        ];
        
        for (const role of coreRoles) {
          // Find fields mapped to this role
          for (const [fieldKey, mappedRole] of Object.entries(roleMap.fieldMappings)) {
            if (mappedRole === role || (Array.isArray(mappedRole) && mappedRole.includes(role))) {
              const value = item.data?.[fieldKey];
              if (value !== undefined && value !== '') {
                simplifiedItem[fieldKey] = value;
              }
            }
          }
        }
      } else {
        // Fallback: include all non-empty fields
        for (const [key, value] of Object.entries(item.data || {})) {
          if (value !== undefined && value !== '' && key !== 'id') {
            simplifiedItem[key] = value;
          }
        }
      }
      
      if (Object.keys(simplifiedItem).length > 0) {
        simplifiedItems.push(simplifiedItem);
      }
    }
    
    return {
      schemaId: section.schemaId,
      items: simplifiedItems
    };
  }
  
  /**
   * Merge an improved section back into the resume data
   * @param originalResume The original resume data
   * @param sectionId The ID of the section to update
   * @param itemsToMerge An array of items to update, each with an ID and new data
   * @returns Updated resume data with improved section
   */
  static mergeImprovedSection(
    originalResume: ResumeData,
    sectionId: string,
    itemsToMerge: { id: string, data: Record<string, any> }[]
  ): ResumeData {
    const itemsToMergeMap = new Map(itemsToMerge.map(item => [item.id, item.data]));

    if (itemsToMergeMap.size === 0) {
      return originalResume; // No changes to apply
    }

    const updatedSections = originalResume.sections.map(section => {
      if (section.id !== sectionId) return section;
      
      const dynamicSection = section as DynamicResumeSection;
      
      // Map improved items back to original items
      const updatedItems = dynamicSection.items.map((originalItem) => {
        const improvedData = itemsToMergeMap.get(originalItem.id);
        
        if (!improvedData) {
            return originalItem; // This item was not staged for improvement
        }
        
        // Merge improved data with original, preserving metadata
        return {
          ...originalItem,
          data: {
            ...originalItem.data,
            ...improvedData
          },
          metadata: {
            ...originalItem.metadata,
            updatedAt: new Date().toISOString(),
            aiImproved: true
          }
        };
      });
      
      return {
        ...section,
        items: updatedItems,
        metadata: {
            ...section.metadata,
            aiOptimized: true,
        }
      };
    });
    
    return {
      ...originalResume,
      sections: updatedSections
    };
  }
  
  /**
   * Helper method to convert AI item data to DynamicSectionItem
   */
  private static convertAIItemToSectionItem(
    aiItem: Record<string, any>,
    sectionSchema: SectionSchema,
    registry: SchemaRegistry
  ): DynamicSectionItem | null {
    const itemData: Record<string, any> = {};
    
    // Validate and convert each field
    for (const fieldSchema of sectionSchema.fields) {
      const value = aiItem[fieldSchema.id];
      
      if (value !== undefined) {
        // Validate field type
        const isValid = this.validateFieldValue(value, fieldSchema);
        if (isValid) {
          itemData[fieldSchema.id] = value;
        } else {
          console.warn(`Invalid value for field ${fieldSchema.id}: ${value}`);
        }
      } else if (fieldSchema.required) {
        // Add empty value for required fields
        itemData[fieldSchema.id] = this.getDefaultFieldValue(fieldSchema);
      }
    }
    
    // Only create item if it has data
    if (Object.keys(itemData).length === 0) {
      return null;
    }
    
    return {
      id: `${sectionSchema.id}_item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      schemaId: sectionSchema.id,
      data: itemData,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: true
      }
    };
  }
  
  /**
   * Validate field value against schema
   */
  private static validateFieldValue(value: any, fieldSchema: FieldSchema): boolean {
    switch (fieldSchema.type) {
      case 'text':
      case 'textarea':
        return typeof value === 'string';
      case 'select':
      case 'multiselect':
      case 'combobox':
        if (fieldSchema.uiProps?.options) {
          return fieldSchema.uiProps.options.includes(value);
        }
        return typeof value === 'string';
      case 'date':
        return typeof value === 'string' && !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
  
  /**
   * Get default value for a field type
   */
  private static getDefaultFieldValue(fieldSchema: FieldSchema): any {
    switch (fieldSchema.type) {
      case 'text':
      case 'textarea':
      case 'date':
      case 'url':
      case 'email':
      case 'phone':
        return '';
      case 'select':
      case 'combobox':
        return fieldSchema.uiProps?.options?.[0] || '';
      case 'multiselect':
        return [];
      case 'array':
        return [];
      case 'object':
        return {};
      default:
        return '';
    }
  }
} 