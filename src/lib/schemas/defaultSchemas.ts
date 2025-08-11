import type { SectionSchema, ISchemaRegistry } from '@/types/schema';

// Helper function to create the legacy summary schema
export const SUMMARY_SCHEMA: SectionSchema = {
  id: 'summary',
  name: 'schemas:summary.name',
  type: 'single',
  fields: [
    {
      id: 'content',
      type: 'textarea',
      label: 'schemas:summary.fields.content.label',
      required: true,
      uiProps: {
        rows: 4,
        placeholder: 'schemas:summary.fields.content.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'summary-content',
          autocomplete: 'summary-content',
        },
        improvementPrompts: [
          'schemas:summary.fields.content.prompts.0',
          'schemas:summary.fields.content.prompts.1',
          'schemas:summary.fields.content.prompts.2',
          'schemas:summary.fields.content.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'summary-section',
    itemSummaryBuilder: 'summary-content',
  },
  uiConfig: {
    icon: 'FileText',
    defaultRenderType: 'single-text',
    addButtonText: 'schemas:summary.uiConfig.addButtonText',
  },
};

// Helper function to create the legacy experience schema
export const EXPERIENCE_SCHEMA: SectionSchema = {
  id: 'experience',
  name: 'schemas:experience.name',
  type: 'list',
  fields: [
    {
      id: 'jobTitle',
      type: 'text',
      label: 'schemas:experience.fields.jobTitle.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'job-title',
          autocomplete: 'job-title',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'company',
      type: 'text',
      label: 'schemas:experience.fields.company.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'company-name',
          autocomplete: 'company-name',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'startDate',
      type: 'text',
      label: 'schemas:experience.fields.startDate.label',
      required: true,
    },
    {
      id: 'endDate',
      type: 'text',
      label: 'schemas:experience.fields.endDate.label',
      required: true,
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'schemas:experience.fields.description.label',
      required: true,
      uiProps: {
        rows: 4,
        placeholder: 'schemas:experience.fields.description.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'job-description',
          autocomplete: 'job-description',
        },
        improvementPrompts: [
          'schemas:experience.fields.description.prompts.0',
          'schemas:experience.fields.description.prompts.1',
          'schemas:experience.fields.description.prompts.2',
          'schemas:experience.fields.description.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'experience-summary',
    itemSummaryBuilder: 'experience-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Briefcase',
    defaultRenderType: 'timeline',
    addButtonText: 'schemas:experience.uiConfig.addButtonText',
    itemDisplayTemplate: '{jobTitle} at {company}',
    sortable: true,
  },
};

// Helper function to create the legacy education schema
export const EDUCATION_SCHEMA: SectionSchema = {
  id: 'education',
  name: 'schemas:education.name',
  type: 'list',
  fields: [
    {
      id: 'degree',
      type: 'text',
      label: 'schemas:education.fields.degree.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'degree-name',
          autocomplete: 'degree-name',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'institution',
      type: 'text',
      label: 'schemas:education.fields.institution.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'institution-name',
          autocomplete: 'institution-name',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'graduationYear',
      type: 'text',
      label: 'schemas:education.fields.graduationYear.label',
      required: true,
    },
    {
      id: 'details',
      type: 'textarea',
      label: 'schemas:education.fields.details.label',
      uiProps: {
        rows: 2,
        placeholder: 'schemas:education.fields.details.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'education-details',
          autocomplete: 'education-details',
        },
        improvementPrompts: [
          'schemas:education.fields.details.prompts.0',
          'schemas:education.fields.details.prompts.1',
          'schemas:education.fields.details.prompts.2',
          'schemas:education.fields.details.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'medium',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'education-summary',
    itemSummaryBuilder: 'education-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'GraduationCap',
    defaultRenderType: 'timeline',
    addButtonText: 'schemas:education.uiConfig.addButtonText',
    itemDisplayTemplate: '{degree} from {institution}',
    sortable: true,
  },
};

// Helper function to create the legacy skills schema
export const SKILLS_SCHEMA: SectionSchema = {
  id: 'skills',
  name: 'schemas:skills.name',
  type: 'list',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'schemas:skills.fields.name.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'skill-name',
          autocomplete: 'skill-name',
        },
        improvementPrompts: [
          'schemas:skills.fields.name.prompts.0',
          'schemas:skills.fields.name.prompts.1',
          'schemas:skills.fields.name.prompts.2',
          'schemas:skills.fields.name.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'skills-summary',
    itemSummaryBuilder: 'skill-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Wand2',
    defaultRenderType: 'badge-list',
    addButtonText: 'schemas:skills.uiConfig.addButtonText',
    itemDisplayTemplate: '{name}',
    sortable: true,
  },
};

// Helper function to create the legacy custom text schema
export const CUSTOM_TEXT_SCHEMA: SectionSchema = {
  id: 'customText',
  name: 'schemas:customText.name',
  type: 'single',
  fields: [
    {
      id: 'content',
      type: 'textarea',
      label: 'schemas:customText.fields.content.label',
      required: true,
      uiProps: {
        rows: 3,
        placeholder: 'schemas:customText.fields.content.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'custom-content',
          autocomplete: 'custom-content',
        },
        improvementPrompts: [
          'schemas:customText.fields.content.prompts.0',
          'schemas:customText.fields.content.prompts.1',
          'schemas:customText.fields.content.prompts.2',
          'schemas:customText.fields.content.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'medium',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'custom-summary',
    itemSummaryBuilder: 'custom-content',
  },
  uiConfig: {
    icon: 'FilePlus2',
    defaultRenderType: 'single-text',
    addButtonText: 'schemas:customText.uiConfig.addButtonText',
  },
};

// Test schema for certifications
const CERTIFICATIONS_SCHEMA: SectionSchema = {
  id: 'certifications',
  name: 'schemas:certifications.name',
  type: 'list',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'schemas:certifications.fields.name.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'certification-name',
          autocomplete: 'certification-name',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'issuer',
      type: 'text',
      label: 'schemas:certifications.fields.issuer.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'certification-issuer',
          autocomplete: 'certification-issuer',
        },
        autocompleteEnabled: true,
        priority: 'medium',
      },
    },
    {
      id: 'date',
      type: 'date',
      label: 'schemas:certifications.fields.date.label',
      required: true,
    },
    {
      id: 'expiryDate',
      type: 'date',
      label: 'schemas:certifications.fields.expiryDate.label',
      required: false,
    },
    {
      id: 'credentialId',
      type: 'text',
      label: 'schemas:certifications.fields.credentialId.label',
      required: false,
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'schemas:certifications.fields.description.label',
      uiProps: {
        rows: 2,
        placeholder: 'schemas:certifications.fields.description.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'certification-description',
          autocomplete: 'certification-description',
        },
        improvementPrompts: [
          'schemas:certifications.fields.description.prompts.0',
          'schemas:certifications.fields.description.prompts.1',
          'schemas:certifications.fields.description.prompts.2',
          'schemas:certifications.fields.description.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'medium',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'certifications-summary',
    itemSummaryBuilder: 'certifications-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Award',
    defaultRenderType: 'timeline',
    addButtonText: 'schemas:certifications.uiConfig.addButtonText',
    itemDisplayTemplate: '{name} - {issuer}',
    sortable: true,
  },
};

// Experimental schema with different field names to test Role-Map
const VOLUNTEER_EXPERIENCE_SCHEMA: SectionSchema = {
  id: 'volunteer',
  name: 'schemas:volunteer.name',
  type: 'list',
  fields: [
    {
      id: 'position', // Using 'position' instead of 'jobTitle'
      type: 'text',
      label: 'schemas:volunteer.fields.position.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-position',
          autocomplete: 'volunteer-position',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'organization', // Using 'organization' instead of 'company'
      type: 'text',
      label: 'schemas:volunteer.fields.organization.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-org',
          autocomplete: 'volunteer-org',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'startDate',
      type: 'text',
      label: 'schemas:volunteer.fields.startDate.label',
      required: true,
    },
    {
      id: 'endDate',
      type: 'text',
      label: 'schemas:volunteer.fields.endDate.label',
      required: true,
    },
    {
      id: 'impact', // Using 'impact' instead of 'description'
      type: 'textarea',
      label: 'schemas:volunteer.fields.impact.label',
      required: true,
      uiProps: {
        rows: 3,
        placeholder: 'schemas:volunteer.fields.impact.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'volunteer-impact',
          autocomplete: 'volunteer-impact',
        },
        improvementPrompts: [
          'schemas:volunteer.fields.impact.prompts.0',
          'schemas:volunteer.fields.impact.prompts.1',
          'schemas:volunteer.fields.impact.prompts.2',
          'schemas:volunteer.fields.impact.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'volunteer-summary',
    itemSummaryBuilder: 'volunteer-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Heart',
    defaultRenderType: 'timeline',
    addButtonText: 'schemas:volunteer.uiConfig.addButtonText',
    itemDisplayTemplate: '{position} at {organization}',
    sortable: true,
  },
};

const PROJECTS_SCHEMA: SectionSchema = {
  id: 'projects',
  name: 'schemas:projects.name',
  type: 'list',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'schemas:projects.fields.name.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'project-name',
          autocomplete: 'project-name',
        },
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'schemas:projects.fields.description.label',
      required: true,
      uiProps: {
        rows: 3,
        placeholder: 'schemas:projects.fields.description.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'project-description',
          autocomplete: 'project-description',
        },
        improvementPrompts: [
          'schemas:projects.fields.description.prompts.0',
          'schemas:projects.fields.description.prompts.1',
          'schemas:projects.fields.description.prompts.2',
          'schemas:projects.fields.description.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'technologies',
      type: 'multiselect',
      label: 'schemas:projects.fields.technologies.label',
      aiHints: {
        contextBuilders: {
          improve: 'project-technologies',
          autocomplete: 'project-technologies',
        },
        autocompleteEnabled: true,
        priority: 'medium',
      },
    },
    {
      id: 'url',
      type: 'url',
      label: 'schemas:projects.fields.url.label',
      validation: [
        {
          type: 'pattern',
          value: '^https?://',
          message: 'schemas:projects.fields.url.validation.0',
        },
      ],
    },
    {
      id: 'startDate',
      type: 'date',
      label: 'schemas:projects.fields.startDate.label',
    },
    {
      id: 'endDate',
      type: 'date',
      label: 'schemas:projects.fields.endDate.label',
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'projects-summary',
    itemSummaryBuilder: 'projects-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Code',
    defaultRenderType: 'timeline',
    addButtonText: 'schemas:projects.uiConfig.addButtonText',
    itemDisplayTemplate: '{name} - {technologies}',
    sortable: true,
  },
};

// 预定义的高级Schema示例
const ADVANCED_SKILLS_SCHEMA: SectionSchema = {
  id: 'advanced-skills',
  name: 'schemas:advanced-skills.name',
  type: 'list',
  fields: [
    {
      id: 'category',
      type: 'combobox',
      label: 'schemas:advanced-skills.fields.category.label',
      required: true,
      uiProps: {
        options: [
          'schemas:advanced-skills.fields.category.options.0',
          'schemas:advanced-skills.fields.category.options.1',
          'schemas:advanced-skills.fields.category.options.2',
          'schemas:advanced-skills.fields.category.options.3',
          'schemas:advanced-skills.fields.category.options.4',
          'schemas:advanced-skills.fields.category.options.5',
          'schemas:advanced-skills.fields.category.options.6',
          'schemas:advanced-skills.fields.category.options.7',
          'schemas:advanced-skills.fields.category.options.8',
          'schemas:advanced-skills.fields.category.options.9',
        ],
      },
      aiHints: {
        contextBuilders: {
          improve: 'skill-category',
          autocomplete: 'skill-category',
        },
        autocompleteEnabled: false,
        priority: 'high',
      },
    },
    {
      id: 'skills',
      type: 'multiselect',
      label: 'schemas:advanced-skills.fields.skills.label',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'skill-list',
          autocomplete: 'skill-list',
        },
        improvementPrompts: [
          'schemas:advanced-skills.fields.skills.prompts.0',
          'schemas:advanced-skills.fields.skills.prompts.1',
          'schemas:advanced-skills.fields.skills.prompts.2',
          'schemas:advanced-skills.fields.skills.prompts.3',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
    {
      id: 'proficiency',
      type: 'combobox',
      label: 'schemas:advanced-skills.fields.proficiency.label',
      uiProps: {
        options: [
          'schemas:advanced-skills.fields.proficiency.options.0',
          'schemas:advanced-skills.fields.proficiency.options.1',
          'schemas:advanced-skills.fields.proficiency.options.2',
          'schemas:advanced-skills.fields.proficiency.options.3',
        ],
      },
      aiHints: {
        contextBuilders: {
          improve: 'skill-proficiency',
          autocomplete: 'skill-proficiency',
        },
        priority: 'medium',
      },
    },
    {
      id: 'yearsOfExperience',
      type: 'text',
      label: 'schemas:advanced-skills.fields.yearsOfExperience.label',
      validation: [
        {
          type: 'pattern',
          value: '^[0-9]+$',
          message:
            'schemas:advanced-skills.fields.yearsOfExperience.validation.0',
        },
      ],
      aiHints: {
        contextBuilders: {
          improve: 'skill-experience',
          autocomplete: 'skill-experience',
        },
        priority: 'low',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'advanced-skills-summary',
    itemSummaryBuilder: 'advanced-skills-item',
    batchImprovementSupported: true,
  },
  uiConfig: {
    icon: 'Wand2',
    defaultRenderType: 'badge-list',
    addButtonText: 'schemas:advanced-skills.uiConfig.addButtonText',
    itemDisplayTemplate: '{category}: {skills}',
    sortable: true,
    collapsible: true,
  },
};

// Cover Letter Schema
export const COVER_LETTER_SCHEMA: SectionSchema = {
  id: 'cover-letter',
  name: 'schemas:cover-letter.name',
  type: 'single',
  fields: [
    {
      id: 'content',
      type: 'textarea',
      label: 'schemas:cover-letter.fields.content.label',
      required: true,
      uiProps: {
        rows: 12,
        placeholder: 'schemas:cover-letter.fields.content.placeholder',
        markdownEnabled: true,
      },
      aiHints: {
        contextBuilders: {
          improve: 'cover-letter-content',
          autocomplete: 'cover-letter-content',
        },
        improvementPrompts: [
          'schemas:cover-letter.fields.content.prompts.0',
          'schemas:cover-letter.fields.content.prompts.1',
          'schemas:cover-letter.fields.content.prompts.2',
          'schemas:cover-letter.fields.content.prompts.3',
          'schemas:cover-letter.fields.content.prompts.4',
        ],
        autocompleteEnabled: true,
        priority: 'high',
      },
    },
  ],
  aiContext: {
    sectionSummaryBuilder: 'cover-letter-section',
    itemSummaryBuilder: 'cover-letter-content',
  },
  uiConfig: {
    icon: 'FileText',
    defaultRenderType: 'cover-letter',
    addButtonText: 'schemas:cover-letter.uiConfig.addButtonText',
  },
};

/**
 * Registers all the default section schemas with the schema registry.
 * @param registry The schema registry instance.
 */
export function registerDefaultSchemas(registry: ISchemaRegistry) {
  // Register legacy (now constant) schemas
  registry.registerSectionSchema(SUMMARY_SCHEMA);
  registry.registerSectionSchema(EXPERIENCE_SCHEMA);
  registry.registerSectionSchema(EDUCATION_SCHEMA);
  registry.registerSectionSchema(SKILLS_SCHEMA);
  registry.registerSectionSchema(CUSTOM_TEXT_SCHEMA);

  // Register dynamic schemas
  registry.registerSectionSchema(ADVANCED_SKILLS_SCHEMA);
  registry.registerSectionSchema(PROJECTS_SCHEMA);

  // Register test schemas
  registry.registerSectionSchema(CERTIFICATIONS_SCHEMA);

  // Register experimental schema with different field names
  registry.registerSectionSchema(VOLUNTEER_EXPERIENCE_SCHEMA);

  // Register cover letter schema
  registry.registerSectionSchema(COVER_LETTER_SCHEMA);
}
