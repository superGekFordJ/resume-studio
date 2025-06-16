/**
 * @fileOverview Data migration script for converting legacy resume data to extended format
 * 
 * This script provides utilities to migrate from the old ResumeData format to the new
 * ExtendedResumeData format that supports dynamic schemas.
 */

import type { LegacyResumeData, ResumeData } from '@/types/resume';
import type { ExtendedResumeData, DynamicResumeSection, DynamicSectionItem } from '@/types/schema';
import { SchemaRegistry } from '@/lib/schemaRegistry';

/**
 * Migrates a legacy resume data structure to the new extended format
 */
export function migrateLegacyResumeToExtended(legacyData: LegacyResumeData): ExtendedResumeData {
  const schemaRegistry = SchemaRegistry.getInstance();
  
  // Convert legacy sections to dynamic sections where possible
  const migratedSections: (DynamicResumeSection | any)[] = legacyData.sections.map(section => {
    // Check if there's a corresponding schema for this section type
    const sectionSchema = schemaRegistry.getSectionSchema(section.type);
    
    if (sectionSchema && schemaRegistry.isLegacySectionType(section.type)) {
      // Convert to dynamic section format
      const dynamicSection: DynamicResumeSection = {
        id: section.id,
        schemaId: section.type,
        title: section.title,
        visible: section.visible,
        items: section.items.map(item => {
          const dynamicItem: DynamicSectionItem = {
            id: item.id,
            schemaId: section.type,
            data: convertLegacyItemToData(item, section.type),
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              aiGenerated: false
            }
          };
          return dynamicItem;
        }),
        metadata: {
          customTitle: false,
          aiOptimized: false
        }
      };
      return dynamicSection;
    } else {
      // Keep as legacy section for now
      return section;
    }
  });

  const extendedData: ExtendedResumeData = {
    personalDetails: legacyData.personalDetails,
    sections: migratedSections,
    templateId: legacyData.templateId,
    schemaVersion: '1.0.0',
    metadata: {
      lastAIReview: new Date().toISOString(),
      aiOptimizationLevel: 'basic'
    }
  };

  return extendedData;
}

/**
 * Converts a legacy section item to dynamic data format
 */
function convertLegacyItemToData(item: any, sectionType: string): Record<string, any> {
  switch (sectionType) {
    case 'experience':
      return {
        jobTitle: item.jobTitle || '',
        company: item.company || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        description: item.description || ''
      };
    
    case 'education':
      return {
        degree: item.degree || '',
        institution: item.institution || '',
        graduationYear: item.graduationYear || '',
        details: item.details || ''
      };
    
    case 'skills':
      return {
        name: item.name || ''
      };
    
    case 'summary':
    case 'customText':
      return {
        content: item.content || ''
      };
    
    default:
      // For unknown types, try to preserve all properties
      const { id, ...data } = item;
      return data;
  }
}

/**
 * Checks if resume data needs migration
 */
export function needsMigration(data: ResumeData): boolean {
  return !('schemaVersion' in data);
}

/**
 * Safely migrates resume data if needed
 */
export function migrateResumeDataIfNeeded(data: ResumeData): ExtendedResumeData {
  if (needsMigration(data)) {
    console.log('Migrating legacy resume data to extended format...');
    return migrateLegacyResumeToExtended(data as LegacyResumeData);
  }
  return data as ExtendedResumeData;
}

/**
 * Validates that the migrated data is correct
 */
export function validateMigratedData(original: LegacyResumeData, migrated: ExtendedResumeData): boolean {
  try {
    // Check basic structure
    if (!migrated.schemaVersion) return false;
    if (migrated.sections.length !== original.sections.length) return false;
    if (migrated.templateId !== original.templateId) return false;
    
    // Check personal details
    const personalDetailsMatch = Object.keys(original.personalDetails).every(key => 
      migrated.personalDetails[key as keyof typeof original.personalDetails] === 
      original.personalDetails[key as keyof typeof original.personalDetails]
    );
    if (!personalDetailsMatch) return false;
    
    // Check sections (basic validation)
    for (let i = 0; i < original.sections.length; i++) {
      const originalSection = original.sections[i];
      const migratedSection = migrated.sections[i];
      
      if (originalSection.id !== migratedSection.id) return false;
      if (originalSection.title !== migratedSection.title) return false;
      if (originalSection.visible !== migratedSection.visible) return false;
    }
    
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

/**
 * Example usage function
 */
export function exampleMigration() {
  // This would typically be called with actual resume data
  const exampleLegacyData: LegacyResumeData = {
    personalDetails: {
      fullName: 'John Doe',
      jobTitle: 'Software Engineer',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: 'New York, NY',
    },
    sections: [
      {
        id: 'summary_1',
        title: 'Summary',
        type: 'summary',
        visible: true,
        isList: false,
        items: [{ id: 'summary_content_1', content: 'Experienced software engineer...' }]
      }
    ],
    templateId: 'default'
  };

  const migrated = migrateLegacyResumeToExtended(exampleLegacyData);
  const isValid = validateMigratedData(exampleLegacyData, migrated);
  
  console.log('Migration result:', { migrated, isValid });
  return { migrated, isValid };
}