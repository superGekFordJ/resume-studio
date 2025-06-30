// Schema system for extensible resume data structures

import type { PersonalDetails } from './resume';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldSchema {
  id: string;
  type: 'text' | 'textarea' | 'date' | 'url' | 'email' | 'phone' | 'select' | 'multiselect' | 'combobox' | 'object' | 'array';
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
    markdownEnabled?: boolean; // Whether this field supports markdown rendering
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
    defaultRenderType?: string; // 默认的渲染类型（可被模板覆写）
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
  // New: Main method to build structured AI context
  buildAIContext(payload: AIContextPayload): StructuredAIContext;
  // New: Method to stringify the entire resume for review
  stringifyResumeForReview(resumeData: any): string;
  // NEW: Role-Map methods - simplified for static loading
  getRoleMap(schemaId: string): RoleMap | undefined;
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

// New shared types for AI context payloads and structured context
export interface AIContextPayload {
  resumeData: any; // Use `any` for now to support legacy and dynamic data
  task: 'improve' | 'autocomplete';
  sectionId: string;
  fieldId: string;
  itemId?: string;
  inputText?: string; // This is textBeforeCursor
  textAfterCursor?: string; // Add textAfterCursor
  aiConfig?: any;
}

export interface StructuredAIContext {
  currentItemContext: string;
  otherSectionsContext: string;
  // Add other relevant top-level context if needed
  userJobTitle?: string;
  userJobInfo?: string;
  userBio?: string;
}

// Renderable View Models for decoupled rendering
export interface RenderableField {
  key: string;  // e.g., 'jobTitle'
  label: string; // e.g., 'Job Title'
  value: string | string[];
  markdownEnabled?: boolean; // Whether this field should be rendered as markdown
}

export interface RenderableItem {
  id: string;
  fields: RenderableField[];
}

export interface RenderableSection {
  id: string;
  title: string;
  schemaId: string;
  defaultRenderType?: string; // 从schema中的uiConfig继承的默认渲染类型
  items: RenderableItem[];
}

export interface RenderableResume {
  personalDetails: PersonalDetails; // Assuming PersonalDetails is already flat
  sections: RenderableSection[];
}


// Role-Map types
export type FieldRole = 
  | 'title'         // Job title, position, role name
  | 'organization'  // Company, institution, school name
  | 'description'   // Main content description
  | 'startDate'     // Begin date
  | 'endDate'       // End date
  | 'location'      // Geographic location
  | 'dateRange'     // Combined date range
  | 'url'           // Website link
  | 'skills'        // Skills list
  | 'level'         // Proficiency or education level
  | 'identifier'    // A unique ID or code
  | 'other';        // Catch-all for unclassifiable fields

export interface RoleMap {
  schemaId: string;
  schemaVersion: string;
  fieldMappings: Record<string, FieldRole | FieldRole[]>; // fieldId -> role(s)
  inferredAt: string; // ISO timestamp
} 