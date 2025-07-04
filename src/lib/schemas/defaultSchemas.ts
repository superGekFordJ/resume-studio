import type { SectionSchema, ISchemaRegistry } from '@/types/schema';


// Helper function to create the legacy summary schema
export const SUMMARY_SCHEMA: SectionSchema = {
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

// Helper function to create the legacy experience schema
export const EXPERIENCE_SCHEMA: SectionSchema = {
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

// Helper function to create the legacy education schema
export const EDUCATION_SCHEMA: SectionSchema = {
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
    itemSummaryBuilder: 'education-item',
    batchImprovementSupported: true
  },
  uiConfig: {
    icon: 'GraduationCap',
    defaultRenderType: 'timeline',
    addButtonText: 'Add Education',
    itemDisplayTemplate: '{degree} from {institution}',
    sortable: true
  }
};

// Helper function to create the legacy skills schema
export const SKILLS_SCHEMA: SectionSchema = {
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

// Helper function to create the legacy custom text schema
export const CUSTOM_TEXT_SCHEMA: SectionSchema = {
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

const PROJECTS_SCHEMA: SectionSchema = {
  id: 'projects',
  name: 'Projects',
  type: 'list',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Project Name',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'project-name',
          autocomplete: 'project-name'
        },
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      uiProps: {
        rows: 3,
        placeholder: 'Describe the project, your role, and key achievements...',
        markdownEnabled: true
      },
      aiHints: {
        contextBuilders: {
          improve: 'project-description',
          autocomplete: 'project-description'
        },
        improvementPrompts: [
          'Add quantifiable results',
          'Highlight technical challenges solved',
          'Emphasize business impact',
          'Include technologies used'
        ],
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'technologies',
      type: 'multiselect',
      label: 'Technologies Used',
      aiHints: {
        contextBuilders: {
          improve: 'project-technologies',
          autocomplete: 'project-technologies'
        },
        autocompleteEnabled: true,
        priority: 'medium'
      }
    },
    {
      id: 'url',
      type: 'url',
      label: 'Project URL',
      validation: [
        { type: 'pattern', value: '^https?://', message: 'Must be a valid URL' }
      ]
    },
    {
      id: 'startDate',
      type: 'date',
      label: 'Start Date'
    },
    {
      id: 'endDate',
      type: 'date',
      label: 'End Date'
    }
  ],
  aiContext: {
    sectionSummaryBuilder: 'projects-summary',
    itemSummaryBuilder: 'projects-item',
    batchImprovementSupported: true
  },
  uiConfig: {
    icon: 'Code',
    defaultRenderType: 'timeline',
    addButtonText: 'Add Project',
    itemDisplayTemplate: '{name} - {technologies}',
    sortable: true
  }
}; 

// 预定义的高级Schema示例
const ADVANCED_SKILLS_SCHEMA: SectionSchema = {
  id: 'advanced-skills',
  name: 'Advanced Skills',
  type: 'list',
  fields: [
    {
      id: 'category',
      type: 'combobox',
      label: 'Category',
      required: true,
      uiProps: {
        options: [
          'Technical Skills', 
          'Soft Skills', 
          'Languages', 
          'Certifications', 
          'Tools & Platforms', 
          'Programming Languages', 
          'Frameworks', 
          'Databases', 
          'Cloud Platforms', 
          'DevOps Tools']
      },
      aiHints: {
        contextBuilders: {
          improve: 'skill-category',
          autocomplete: 'skill-category'
        },
        autocompleteEnabled: false,
        priority: 'high'
      }
    },
    {
      id: 'skills',
      type: 'multiselect',
      label: 'Skills',
      required: true,
      aiHints: {
        contextBuilders: {
          improve: 'skill-list',
          autocomplete: 'skill-list'
        },
        improvementPrompts: [
          'Add industry-relevant skills',
          'Include proficiency levels',
          'Add trending technologies',
          'Optimize for ATS keywords'
        ],
        autocompleteEnabled: true,
        priority: 'high'
      }
    },
    {
      id: 'proficiency',
      type: 'select',
      label: 'Proficiency Level',
      uiProps: {
        options: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
      },
      aiHints: {
        contextBuilders: {
          improve: 'skill-proficiency',
          autocomplete: 'skill-proficiency'
        },
        priority: 'medium'
      }
    },
    {
      id: 'yearsOfExperience',
      type: 'text',
      label: 'Years of Experience',
      validation: [
        { type: 'pattern', value: '^[0-9]+$', message: 'Must be a number' }
      ],
      aiHints: {
        contextBuilders: {
          improve: 'skill-experience',
          autocomplete: 'skill-experience'
        },
        priority: 'low'
      }
    }
  ],
  aiContext: {
    sectionSummaryBuilder: 'advanced-skills-summary',
    itemSummaryBuilder: 'advanced-skills-item',
    batchImprovementSupported: true
  },
  uiConfig: {
    icon: 'Wand2',
    defaultRenderType: 'badge-list',
    addButtonText: 'Add Skill Category',
    itemDisplayTemplate: '{category}: {skills}',
    sortable: true,
    collapsible: true
  }
};

// Cover Letter Schema
export const COVER_LETTER_SCHEMA: SectionSchema = {
  id: 'cover-letter',
  name: 'Cover Letter',
  type: 'single',
  fields: [
    {
      id: 'content',
      type: 'textarea',
      label: 'Cover Letter Content',
      required: true,
      uiProps: {
        rows: 12,
        placeholder: 'Your personalized cover letter content will appear here...',
        markdownEnabled: true
      },
      aiHints: {
        contextBuilders: {
          improve: 'cover-letter-content',
          autocomplete: 'cover-letter-content'
        },
        improvementPrompts: [
          'Make it more compelling',
          'Add specific examples',
          'Tailor to company culture',
          'Strengthen value proposition',
          'Improve flow and readability'
        ],
        autocompleteEnabled: true,
        priority: 'high'
      }
    }
  ],
  aiContext: {
    sectionSummaryBuilder: 'cover-letter-section',
    itemSummaryBuilder: 'cover-letter-content'
  },
  uiConfig: {
    icon: 'FileText',
    defaultRenderType: 'cover-letter',
    addButtonText: 'Add Cover Letter'
  }
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