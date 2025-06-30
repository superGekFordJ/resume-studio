import type { SectionSchema, ISchemaRegistry } from '@/types/schema';
import { ADVANCED_SKILLS_SCHEMA, PROJECTS_SCHEMA } from '@/types/schema';

// Helper function to create the legacy summary schema
function createLegacySummarySchema(): SectionSchema {
  return {
    id: 'summary',
    name: 'Summary',
    type: 'single',
    fields: [
      {
        id: 'content',
        type: 'textarea',
        label: 'Summary',
        required: true,
        uiProps: {
          rows: 4,
          placeholder: 'A brief summary about your professional background...',
          markdownEnabled: true
        },
        aiHints: {
          contextBuilders: {
            improve: 'summary-content',
            autocomplete: 'summary-content'
          },
          improvementPrompts: [
            'Make it more concise',
            'Add quantifiable achievements',
            'Highlight key skills',
            'Tailor to target role'
          ],
          autocompleteEnabled: true,
          priority: 'high'
        }
      }
    ],
    aiContext: {
      sectionSummaryBuilder: 'summary-section',
      itemSummaryBuilder: 'summary-content'
    },
    uiConfig: {
      icon: 'FileText',
      defaultRenderType: 'single-text',
      addButtonText: 'Add Summary'
    }
  };
}

// Helper function to create the legacy experience schema
function createLegacyExperienceSchema(): SectionSchema {
  return {
    id: 'experience',
    name: 'Experience',
    type: 'list',
    fields: [
      {
        id: 'jobTitle',
        type: 'text',
        label: 'Job Title',
        required: true,
        aiHints: {
          contextBuilders: {
            improve: 'job-title',
            autocomplete: 'job-title'
          },
          autocompleteEnabled: true,
          priority: 'high'
        }
      },
      {
        id: 'company',
        type: 'text',
        label: 'Company',
        required: true,
        aiHints: {
          contextBuilders: {
            improve: 'company-name',
            autocomplete: 'company-name'
          },
          autocompleteEnabled: true,
          priority: 'high'
        }
      },
      {
        id: 'startDate',
        type: 'text',
        label: 'Start Date',
        required: true
      },
      {
        id: 'endDate',
        type: 'text',
        label: 'End Date',
        required: true
      },
      {
        id: 'description',
        type: 'textarea',
        label: 'Description',
        required: true,
        uiProps: {
          rows: 4,
          placeholder: 'Describe your responsibilities and achievements...',
          markdownEnabled: true
        },
        aiHints: {
          contextBuilders: {
            improve: 'job-description',
            autocomplete: 'job-description'
          },
          improvementPrompts: [
            'Add quantifiable results',
            'Use action verbs',
            'Highlight achievements',
            'Include relevant keywords'
          ],
          autocompleteEnabled: true,
          priority: 'high'
        }
      }
    ],
    aiContext: {
      sectionSummaryBuilder: 'experience-summary',
      itemSummaryBuilder: 'experience-item',
      batchImprovementSupported: true
    },
    uiConfig: {
      icon: 'Briefcase',
      defaultRenderType: 'timeline',
      addButtonText: 'Add Experience',
      itemDisplayTemplate: '{jobTitle} at {company}',
      sortable: true
    }
  };
}

// Helper function to create the legacy education schema
function createLegacyEducationSchema(): SectionSchema {
  return {
    id: 'education',
    name: 'Education',
    type: 'list',
    fields: [
      {
        id: 'degree',
        type: 'text',
        label: 'Degree',
        required: true,
        aiHints: {
          contextBuilders: {
            improve: 'degree-name',
            autocomplete: 'degree-name'
          },
          autocompleteEnabled: true,
          priority: 'high'
        }
      },
      {
        id: 'institution',
        type: 'text',
        label: 'Institution',
        required: true,
        aiHints: {
          contextBuilders: {
            improve: 'institution-name',
            autocomplete: 'institution-name'
          },
          autocompleteEnabled: true,
          priority: 'high'
        }
      },
      {
        id: 'graduationYear',
        type: 'text',
        label: 'Graduation Year',
        required: true
      },
      {
        id: 'details',
        type: 'textarea',
        label: 'Details',
        uiProps: {
          rows: 2,
          placeholder: 'Relevant coursework, projects, achievements...',
          markdownEnabled: true
        },
        aiHints: {
          contextBuilders: {
            improve: 'education-details',
            autocomplete: 'education-details'
          },
          improvementPrompts: [
            'Add relevant coursework',
            'Include academic achievements',
            'Mention projects or thesis',
            'Add GPA if impressive'
          ],
          autocompleteEnabled: true,
          priority: 'medium'
        }
      }
    ],
    aiContext: {
      sectionSummaryBuilder: 'education-summary',
      itemSummaryBuilder: 'education-item'
    },
    uiConfig: {
      icon: 'GraduationCap',
      defaultRenderType: 'timeline',
      addButtonText: 'Add Education',
      itemDisplayTemplate: '{degree} from {institution}',
      sortable: true
    }
  };
}

// Helper function to create the legacy skills schema
function createLegacySkillsSchema(): SectionSchema {
  return {
    id: 'skills',
    name: 'Skills',
    type: 'list',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Skill',
        required: true,
        aiHints: {
          contextBuilders: {
            improve: 'skill-name',
            autocomplete: 'skill-name'
          },
          improvementPrompts: [
            'Add specific technologies',
            'Include proficiency levels',
            'Group related skills',
            'Add trending skills'
          ],
          autocompleteEnabled: true,
          priority: 'high'
        }
      }
    ],
    aiContext: {
      sectionSummaryBuilder: 'skills-summary',
      itemSummaryBuilder: 'skill-item',
      batchImprovementSupported: true
    },
    uiConfig: {
      icon: 'Wand2',
      defaultRenderType: 'badge-list',
      addButtonText: 'Add Skill',
      itemDisplayTemplate: '{name}',
      sortable: true
    }
  };
}

// Helper function to create the legacy custom text schema
function createLegacyCustomTextSchema(): SectionSchema {
  return {
    id: 'customText',
    name: 'Custom Section',
    type: 'single',
    fields: [
      {
        id: 'content',
        type: 'textarea',
        label: 'Content',
        required: true,
        uiProps: {
          rows: 3,
          placeholder: 'Enter your custom content...',
          markdownEnabled: true
        },
        aiHints: {
          contextBuilders: {
            improve: 'custom-content',
            autocomplete: 'custom-content'
          },
          improvementPrompts: [
            'Improve clarity',
            'Make it more professional',
            'Add specific examples',
            'Optimize formatting'
          ],
          autocompleteEnabled: true,
          priority: 'medium'
        }
      }
    ],
    aiContext: {
      sectionSummaryBuilder: 'custom-summary',
      itemSummaryBuilder: 'custom-content'
    },
    uiConfig: {
      icon: 'FilePlus2',
      defaultRenderType: 'single-text',
      addButtonText: 'Add Content'
    }
  };
}

// Test schema for certifications
const CERTIFICATIONS_SCHEMA: SectionSchema = {
  id: 'certifications',
  name: 'Certifications',
  type: 'list',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Certification Name',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'certification-name',
          autocomplete: 'certification-name'
        },
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'issuer',
      type: 'text',
      label: 'Issuing Organization',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'certification-issuer',
          autocomplete: 'certification-issuer'
        },
        autocompleteEnabled: true,
        priority: 'medium'
      }
    },
    {
      id: 'date',
      type: 'date',
      label: 'Date Obtained',
      required: true
    },
    {
      id: 'expiryDate',
      type: 'date',
      label: 'Expiry Date (if applicable)',
      required: false
    },
    {
      id: 'credentialId',
      type: 'text',
      label: 'Credential ID',
      required: false
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'Description',
      uiProps: {
        rows: 2,
        placeholder: 'Brief description of the certification and its relevance...',
        markdownEnabled: true
      },
      aiHints: {
        contextBuilders: {
          improve: 'certification-description',
          autocomplete: 'certification-description'
        },
        improvementPrompts: [
          'Highlight relevance to target role',
          'Add key skills covered',
          'Mention if it\'s industry-recognized',
          'Include renewal status'
        ],
        autocompleteEnabled: true,
        priority: 'medium'
      }
    }
  ],
  aiContext: {
    sectionSummaryBuilder: 'certifications-summary',
    itemSummaryBuilder: 'certifications-item',
    batchImprovementSupported: true
  },
  uiConfig: {
    icon: 'Award',
    defaultRenderType: 'timeline',
    addButtonText: 'Add Certification',
    itemDisplayTemplate: '{name} - {issuer}',
    sortable: true
  }
};

// Experimental schema with different field names to test Role-Map
const VOLUNTEER_EXPERIENCE_SCHEMA: SectionSchema = {
  id: 'volunteer',
  name: 'Volunteer Experience',
  type: 'list',
  fields: [
    {
      id: 'position', // Using 'position' instead of 'jobTitle'
      type: 'text',
      label: 'Position',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-position',
          autocomplete: 'volunteer-position'
        },
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'organization', // Using 'organization' instead of 'company'
      type: 'text',
      label: 'Organization',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-org',
          autocomplete: 'volunteer-org'
        },
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'startDate',
      type: 'text',
      label: 'Start Date',
      required: true
    },
    {
      id: 'endDate',
      type: 'text',
      label: 'End Date',
      required: true
    },
    {
      id: 'impact', // Using 'impact' instead of 'description'
      type: 'textarea',
      label: 'Impact & Contributions',
      required: true,
      uiProps: {
        rows: 3,
        placeholder: 'Describe your volunteer work and impact...',
        markdownEnabled: true
      },
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-impact',
          autocomplete: 'volunteer-impact'
        },
        improvementPrompts: [
          'Highlight community impact',
          'Add volunteer hours',
          'Mention skills developed',
          'Include recognition received'
        ],
        autocompleteEnabled: true,
        priority: 'high'
      }
    }
  ],
  aiContext: {
    sectionSummaryBuilder: 'volunteer-summary',
    itemSummaryBuilder: 'volunteer-item',
    batchImprovementSupported: true
  },
  uiConfig: {
    icon: 'Heart',
    defaultRenderType: 'timeline',
    addButtonText: 'Add Volunteer Experience',
    itemDisplayTemplate: '{position} at {organization}',
    sortable: true
  }
};

/**
 * Registers all the default section schemas with the schema registry.
 * @param registry The schema registry instance.
 */
export function registerDefaultSchemas(registry: ISchemaRegistry) {
  // Register legacy schemas
  registry.registerSectionSchema(createLegacySummarySchema());
  registry.registerSectionSchema(createLegacyExperienceSchema());
  registry.registerSectionSchema(createLegacyEducationSchema());
  registry.registerSectionSchema(createLegacySkillsSchema());
  registry.registerSectionSchema(createLegacyCustomTextSchema());

  // Register dynamic schemas
  registry.registerSectionSchema(ADVANCED_SKILLS_SCHEMA);
  registry.registerSectionSchema(PROJECTS_SCHEMA);
  
  // Register test schemas
  registry.registerSectionSchema(CERTIFICATIONS_SCHEMA);
  
  // Register experimental schema with different field names
  registry.registerSectionSchema(VOLUNTEER_EXPERIENCE_SCHEMA);
} 