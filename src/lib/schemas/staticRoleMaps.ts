import type { RoleMap } from '@/types/schema';

const version = '1.0.0'; // Default schema version for static maps

/**
 * A collection of statically defined RoleMaps for each schema.
 * This provides a reliable and fast way to map field IDs to semantic roles
 * without relying on AI at runtime.
 */
export const staticRoleMaps: Record<string, RoleMap> = {
  summary: {
    schemaId: 'summary',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      content: 'description',
    },
  },
  experience: {
    schemaId: 'experience',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      jobTitle: 'title',
      company: 'organization',
      startDate: 'startDate',
      endDate: 'endDate',
      description: 'description',
    },
  },
  education: {
    schemaId: 'education',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      degree: 'title',
      institution: 'organization',
      graduationYear: 'endDate', // Mapped to endDate for date ranging
      details: 'description',
    },
  },
  skills: {
    schemaId: 'skills',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      name: 'skills',
    },
  },
  customText: {
    schemaId: 'customText',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      content: 'description',
    },
  },
  'advanced-skills': {
    schemaId: 'advanced-skills',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      category: 'title',
      skills: 'skills',
      proficiency: 'level',
      yearsOfExperience: 'other',
    },
  },
  projects: {
    schemaId: 'projects',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      name: 'title',
      description: 'description',
      technologies: 'skills',
      url: 'url',
      startDate: 'startDate',
      endDate: 'endDate',
    },
  },
  certifications: {
    schemaId: 'certifications',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      name: 'title',
      issuer: 'organization',
      date: 'endDate',
      credentialId: 'identifier',
      description: 'description',
    },
  },
  volunteer: {
    schemaId: 'volunteer',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      position: 'title',
      organization: 'organization',
      startDate: 'startDate',
      endDate: 'endDate',
      impact: 'description',
    },
  },
  'cover-letter': {
    schemaId: 'cover-letter',
    schemaVersion: version,
    inferredAt: new Date().toISOString(),
    fieldMappings: {
      content: 'description',
    },
  },
};
