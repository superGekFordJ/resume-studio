// Schema system for extensible resume data structures

import type { PersonalDetails } from './resume';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldSchema {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'url' | 'email' | 'phone' | 'select' | 'multiselect' | 'object' | 'array';
  label: string;
  required?: boolean;
  validation?: ValidationRule[];
  aiHints?: {
    // REMOVE: contextBuilder?: string; // 如何为AI构建上下文
    // ADD: Structured context builders for different AI tasks
    contextBuilders?: {
      improve?: string;      // Builder ID for the 'improve' task
      autocomplete?: string; // Builder ID for the 'autocomplete' task
    };
    improvementPrompts?: string[]; // 预设的改进提示
    autocompleteEnabled?: boolean;
    priority?: 'high' | 'medium' | 'low'; // AI处理优先级
  };
  uiProps?: {
    placeholder?: string;
    multiline?: boolean;
    options?: string[]; // for select/multiselect
    rows?: number; // for textarea
    maxLength?: number;
  };
}

export interface SectionSchema {
  id: string;
  name: string;
  type: 'single' | 'list'; // 单项内容 vs 列表内容
  fields: FieldSchema[];
  aiContext?: {
    // RENAME summaryBuilder for clarity
    sectionSummaryBuilder?: string; // Builder ID to summarize the entire section
    // ADD:
    itemSummaryBuilder?: string;    // Builder ID to summarize a single item in a list
    // KEEP for backward compatibility
    itemContextBuilder?: string; // 如何为AI构建单个条目的上下文 (deprecated, use itemSummaryBuilder)
    batchImprovementSupported?: boolean; // 是否支持批量改进
  };
  uiConfig?: {
    icon: string;
    addButtonText?: string;
    itemDisplayTemplate?: string; // 如何显示列表项标题
    sortable?: boolean; // 是否支持拖拽排序
    collapsible?: boolean; // 是否支持折叠
  };
}

// 动态数据结构
export interface DynamicSectionItem {
  id: string;
  schemaId: string; // 引用SectionSchema
  data: Record<string, any>; // 动态字段数据
  metadata?: {
    createdAt: string;
    updatedAt: string;
    aiGenerated?: boolean; // 是否由AI生成
  };
}

export interface DynamicResumeSection {
  id: string;
  schemaId: string; // 引用SectionSchema
  title: string;
  visible: boolean;
  items: DynamicSectionItem[];
  metadata?: {
    customTitle?: boolean; // 是否使用自定义标题
    aiOptimized?: boolean; // 是否经过AI优化
  };
}

// AI上下文构建器类型
export type ContextBuilderFunction = (data: any, allData: any) => string;

// Schema注册中心接口
export interface ISchemaRegistry {
  registerSectionSchema(schema: SectionSchema): void;
  getSectionSchema(id: string): SectionSchema | undefined;
  getAllSectionSchemas(): SectionSchema[];
  registerContextBuilder(id: string, builder: ContextBuilderFunction): void;
  buildContext(builderId: string, data: any, allData: any): string;
}

// 扩展的简历数据结构（向后兼容）
export interface ExtendedResumeData {
  personalDetails: Record<string, any>; // 支持动态个人信息字段
  sections: (DynamicResumeSection | any)[]; // 支持新旧数据结构混合
  templateId: string;
  schemaVersion: string; // 用于数据迁移
  metadata?: {
    lastAIReview?: string;
    aiOptimizationLevel?: 'basic' | 'advanced' | 'expert';
  };
}

// 预定义的高级Schema示例
export const ADVANCED_SKILLS_SCHEMA: SectionSchema = {
  id: 'advanced-skills',
  name: 'Advanced Skills',
  type: 'list',
  fields: [
    {
      id: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      uiProps: {
        options: ['Technical Skills', 'Soft Skills', 'Languages', 'Certifications', 'Tools & Platforms']
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
    addButtonText: 'Add Skill Category',
    itemDisplayTemplate: '{category}: {skills}',
    sortable: true,
    collapsible: true
    }
};

// New shared types for AI context payloads and structured context
export interface AIContextPayload {
  resumeData: any; // Use `any` for now to support legacy and dynamic data
  task: 'improve' | 'autocomplete';
  sectionId: string;
  fieldId: string;
  itemId?: string; // Optional, as some sections are not lists
}

export interface StructuredAIContext {
  currentItemContext: string;
  otherSectionsContext: string;
  // Add other relevant top-level context if needed
  userJobTitle?: string;
}

// Renderable View Models for decoupled rendering
export interface RenderableField {
  key: string;  // e.g., 'jobTitle'
  label: string; // e.g., 'Job Title'
  value: string | string[];
}

export interface RenderableItem {
  id: string;
  fields: RenderableField[];
}

export interface RenderableSection {
  id: string;
  title: string;
  schemaId: string;
  items: RenderableItem[];
}

export interface RenderableResume {
  personalDetails: PersonalDetails; // Assuming PersonalDetails is already flat
  sections: RenderableSection[];
}

// 项目经历Schema示例
export const PROJECTS_SCHEMA: SectionSchema = {
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
        placeholder: 'Describe the project, your role, and key achievements...'
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
    addButtonText: 'Add Project',
    itemDisplayTemplate: '{name} - {technologies}',
    sortable: true
  }
}; 