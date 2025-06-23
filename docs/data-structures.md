# A4 Resume Studio - 数据结构文档

## 核心数据模型

### 1. 简历数据结构 (ResumeData)

Resume Studio 现在支持两种数据格式：传统格式（向后兼容）和扩展格式（支持动态Schema）。

```typescript
// 主要数据类型，支持两种格式
type ResumeData = LegacyResumeData | ExtendedResumeData;

// 传统格式（向后兼容）
interface LegacyResumeData {
  personalDetails: PersonalDetails;
  sections: ResumeSection[];
  templateId: string;
}

// 扩展格式（支持动态Schema）
export interface ExtendedResumeData {
  personalDetails: PersonalDetails;     // 支持动态个人信息字段，但目前仍使用固定结构
  sections: (DynamicResumeSection | ResumeSection)[]; // 支持新旧数据结构混合
  templateId: string;
  schemaVersion: string;                    // 用于数据迁移，例如 "1.0.0"
  metadata?: {
    lastAIReview?: string;
    aiOptimizationLevel?: 'basic' | 'advanced' | 'expert';
  };
}

// 类型守卫函数
function isExtendedResumeData(data: ResumeData): data is ExtendedResumeData;
function isLegacyResumeData(data: ResumeData): data is LegacyResumeData;
```

#### 个人信息 (PersonalDetails)
```typescript
interface PersonalDetails {
  fullName: string;           // 全名
  jobTitle: string;           // 职位标题
  email: string;              // 邮箱
  phone: string;              // 电话
  address: string;            // 地址
  linkedin?: string;          // LinkedIn 链接 (可选)
  github?: string;            // GitHub 链接 (可选)
  portfolio?: string;         // 作品集链接 (可选)
  avatar?: string;            // 头像 (Base64 或 URL)
}
```

#### 传统简历章节 (ResumeSection)
```typescript
interface ResumeSection {
  id: string;                 // 唯一标识符
  title: string;              // 章节标题
  type: SectionType;          // 章节类型
  visible: boolean;           // 是否可见
  items: SectionItem[];       // 章节内容项
  isList: boolean;            // 是否为列表类型
}

type SectionType = 
  | 'summary'      // 个人简介
  | 'experience'   // 工作经历
  | 'education'    // 教育背景
  | 'skills'       // 技能
  | 'customText';  // 自定义文本

// 使用鉴别联合 (discriminated union) 以确保类型安全
type SectionItem = ExperienceEntry | EducationEntry | SkillEntry | CustomTextEntry;

interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string; // Can be 'Present'
  description: string;
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  details?: string;
}

interface SkillEntry {
  id: string;
  name: string;
}

interface CustomTextEntry {
  id: string;
  content: string;
}
```

#### 动态简历章节 (DynamicResumeSection)
```typescript
export interface DynamicResumeSection {
  id: string;                 // 唯一标识符
  schemaId: string;           // 引用SectionSchema
  title: string;              // 章节标题
  visible: boolean;           // 是否可见
  items: DynamicSectionItem[]; // 动态章节内容项
  metadata?: {
    customTitle?: boolean;    // 是否使用自定义标题
    aiOptimized?: boolean;    // 是否经过AI优化
  };
}

export interface DynamicSectionItem {
  id: string;                 // 唯一标识符
  schemaId: string;           // 引用SectionSchema
  data: Record<string, any>;  // 动态字段数据 (键值对)
  metadata?: {
    createdAt: string;
    updatedAt: string;
    aiGenerated?: boolean;    // 是否由AI生成
  };
}
```

## Zustand 状态结构 (Updated 2025-06-23)

### ResumeStore 状态

```typescript
// 状态接口
export interface ResumeState {
  // 基础状态
  resumeData: ResumeData;                  // 简历数据
  selectedTemplateId: string;              // 当前选择的模板ID
  editingTarget: string | null;            // 当前编辑目标 (sectionId 或 'personalDetails')
  isLeftPanelOpen: boolean;                // 左侧面板是否打开
  isAutocompleteEnabled: boolean;          // 是否启用自动补全
  
  // 简历评审状态
  isReviewDialogOpen: boolean;             // 评审对话框是否打开
  reviewContent: ReviewResumeOutput | null; // 评审结果
  isReviewLoading: boolean;                // 评审是否加载中
  
  // AI 改进状态 (新增)
  aiImprovement: {                         // 当前AI改进建议
    uniqueFieldId: string;                 // 唯一字段ID (用于标识目标字段)
    suggestion: string;                    // AI建议内容
    originalText: string;                  // 原始文本
  } | null;
  isImprovingFieldId: string | null;       // 当前正在改进的字段ID (用于加载状态)
  aiPrompt: string;                        // 当前AI提示
  
  // 批量改进状态 (计划中)
  batchImprovement?: {                     // 批量改进结果
    sectionId: string;                     // 目标章节ID
    improvedData: any;                     // 改进后的数据
    summary: string;                       // 改进摘要
    changes: Array<{                       // 详细变更
      fieldId: string;
      originalValue: string;
      improvedValue: string;
      changeReason: string;
    }>;
  } | null;
  isBatchImproving: string | null;         // 当前正在批量改进的章节ID
}
```

### ResumeStore 操作

```typescript
// 操作接口
export interface ResumeActions {
  // 基础操作
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setSelectedTemplateId: (templateId: string) => void;
  setEditingTarget: (target: string | null) => void;
  setIsLeftPanelOpen: (isOpen: boolean) => void;
  toggleLeftPanel: () => void;
  setIsAutocompleteEnabled: (isEnabled: boolean) => void;
  toggleAutocomplete: () => void;
  
  // 评审操作
  setIsReviewDialogOpen: (isOpen: boolean) => void;
  toggleReviewDialog: (isOpen?: boolean) => void;
  setReviewContent: (content: ReviewResumeOutput | null) => void;
  setIsReviewLoading: (isLoading: boolean) => void;
  
  // 数据操作 (新增)
  updateField: (payload: { 
    sectionId: string; 
    itemId?: string; 
    fieldId: string; 
    value: any; 
    isPersonalDetails?: boolean 
  }) => void;
  updateSectionTitle: (payload: { 
    sectionId: string; 
    newTitle: string 
  }) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (payload: { 
    sectionId: string; 
    itemId: string 
  }) => void;
  
  // AI 改进操作 (新增)
  setAIPrompt: (prompt: string) => void;
  startAIImprovement: (payload: { 
    sectionId: string; 
    itemId?: string; 
    fieldId: string; 
    currentValue: string; 
    uniqueFieldId: string; 
    isPersonalDetails?: boolean 
  }) => Promise<void>;
  acceptAIImprovement: () => void;
  rejectAIImprovement: () => void;
  
  // 批量改进操作 (计划中)
  batchImproveSection: (payload: { 
    sectionId: string; 
    improvementGoals: string[] 
  }) => Promise<void>;
}
```

### 唯一字段ID结构

为了在 AI 改进操作中唯一标识字段，我们使用了一个特殊的字符串格式：

```typescript
// 构造唯一字段ID
function constructUniqueFieldId(
  isPersonal: boolean,
  fieldId: string,
  itemId: string | null,
  sectionType: string
): string {
  if (isPersonal) {
    return `personal_${fieldId}`;
  } else {
    return `${sectionType}_${itemId || 'no-item'}_${fieldId}`;
  }
}

// 解析唯一字段ID
function deconstructUniqueFieldId(uniqueFieldId: string): {
  isPersonal: boolean;
  fieldName: string;
  itemId: string | null;
  sectionType: string;
} {
  if (uniqueFieldId.startsWith('personal_')) {
    return {
      isPersonal: true,
      fieldName: uniqueFieldId.replace('personal_', ''),
      itemId: null,
      sectionType: 'personalDetails'
    };
  } else {
    const parts = uniqueFieldId.split('_');
    const fieldName = parts.pop() || '';
    const itemId = parts.pop() || null;
    const sectionType = parts.join('_');
    
    return {
      isPersonal: false,
      fieldName,
      itemId: itemId === 'no-item' ? null : itemId,
      sectionType
    };
  }
}
```

## 动态Schema系统

### 1. 字段Schema (FieldSchema)

```typescript
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FieldSchema {
  id: string;                           // 字段唯一标识
  type: 'text' | 'textarea' | 'date' | 'url' | 'email' | 'phone' | 'select' | 'multiselect' | 'object' | 'array';
  label: string;                        // 字段显示标签
  required?: boolean;                   // 是否必填
  validation?: ValidationRule[];        // 验证规则
  aiHints?: {
    // New: Structured context builders for different AI tasks
    contextBuilders?: {
      improve?: string;      // Builder ID for the 'improve' task
      autocomplete?: string; // Builder ID for the 'autocomplete' task
    };
    improvementPrompts?: string[];      // 预设的改进提示
    autocompleteEnabled?: boolean;      // 是否启用自动补全
    priority?: 'high' | 'medium' | 'low'; // AI处理优先级
  };
  uiProps?: {
    placeholder?: string;               // 占位符文本
    multiline?: boolean;                // 是否多行 (适用于textarea)
    options?: string[];                 // 选项列表（用于select/multiselect）
    rows?: number;                      // 行数（用于textarea）
    maxLength?: number;                 // 最大长度
  };
}
```

### 2. 章节Schema (SectionSchema)

```typescript
export interface SectionSchema {
  id: string;                           // 章节唯一标识
  name: string;                         // 章节显示名称
  type: 'single' | 'list';              // 单项内容 vs 列表内容
  fields: FieldSchema[];                // 字段定义
  aiContext?: {
    // New: Builder ID to summarize the entire section for review or other sections' context
    sectionSummaryBuilder?: string; 
    // New: Builder ID to summarize a single item in a list
    itemSummaryBuilder?: string;    
    batchImprovementSupported?: boolean; // 是否支持批量改进
  };
  uiConfig?: {
    icon: string;                       // Lucide Icon 名称
    addButtonText?: string;             // 添加按钮文本
    itemDisplayTemplate?: string;       // 如何显示列表项标题，支持模板字符串，例如 "{name}: {description}"
    sortable?: boolean;                 // 是否支持拖拽排序
    collapsible?: boolean;              // 是否支持折叠
  };
}
```

### 3. Schema注册中心 (SchemaRegistry)

```typescript
// ISchemaRegistry 接口定义了 SchemaRegistry 的公共方法
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
}

// ContextBuilderFunction 定义了用于构建 AI 上下文的函数签名
export type ContextBuilderFunction = (data: any, allData: any) => string;

// New: Payload for building AI context
export interface AIContextPayload {
  resumeData: any;
  task: 'improve' | 'autocomplete';
  sectionId: string;
  fieldId: string;
  itemId?: string;
  aiConfig?: any; // For global context like target job
  inputText?: string; // For real-time text before cursor
  textAfterCursor?: string; // For real-time text after cursor
}

// New: Structured context object returned by the registry
export interface StructuredAIContext {
  currentItemContext: string;
  otherSectionsContext: string;
  userJobTitle?: string;
  userJobInfo?: string; // For global context
  userBio?: string;     // For global context
}
```

### 4. 预定义Schema示例

#### 高级技能Schema (`advanced-skills`)
```typescript
const ADVANCED_SKILLS_SCHEMA: SectionSchema = {
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
      } // 新增 AI 提示
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
      } // 新增 AI 提示
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
```

#### 项目经历Schema (`projects`)
```typescript
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
        placeholder: 'Describe the project, your role, and key achievements...'
      },
      aiHints: {
        contextBuilders: {
          improve: 'project-description',
          autocomplete: 'project-description'
        },
        improvementPrompts: [
          'Add quantifiable results',
          'Highlight technical challenges',
          'Emphasize your specific contributions',
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
      } // 新增 AI 提示
    },
    {
      id: 'url',
      type: 'url',
      label: 'Project URL',
      uiProps: {
        placeholder: 'https://github.com/username/project'
      }
    },
    {
      id: 'startDate',
      type: 'date',
      label: 'Start Date',
      aiHints: {
        contextBuilders: {
          improve: 'project-start-date',
          autocomplete: 'project-start-date'
        },
        priority: 'low'
      } // 新增 AI 提示
    },
    {
      id: 'endDate',
      type: 'date',
      label: 'End Date',
      uiProps: {
        placeholder: 'Present'
      },
      aiHints: {
        contextBuilders: {
          improve: 'project-end-date',
          autocomplete: 'project-end-date'
        },
        priority: 'low'
      } // 新增 AI 提示
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
    itemDisplayTemplate: '{name}',
    sortable: true,
    collapsible: true
  }
};
```

## 渲染视图模型 (Render View Models)

### 1. RenderableField

```typescript
export interface RenderableField {
  key: string;     // 字段标识符，如 'jobTitle'
  label: string;   // 字段显示标签，如 'Job Title'
  value: string | string[];  // 字段值，支持单值或数组
}
```

### 2. RenderableItem

```typescript
export interface RenderableItem {
  id: string;                    // 项目唯一标识符
  fields: RenderableField[];     // 该项目的所有字段
}
```

### 3. RenderableSection

```typescript
export interface RenderableSection {
  id: string;                    // 章节唯一标识符
  title: string;                 // 章节标题
  schemaId: string;              // 关联的Schema ID
  items: RenderableItem[];       // 该章节的所有项目
}
```

### 4. RenderableResume

```typescript
export interface RenderableResume {
  personalDetails: PersonalDetails;  // 个人信息（保持扁平结构）
  sections: RenderableSection[];     // 所有渲染章节
}
```

### 5. 数据转换函数

```typescript
// 将原始简历数据转换为可渲染视图
export function transformToRenderableView(
  resumeData: ResumeData, 
  schemaRegistry: SchemaRegistry
): RenderableResume;
```

这个转换函数负责：
- 过滤不可见章节
- 将传统章节数据转换为统一格式
- 将动态章节数据根据Schema定义转换为统一格式
- 确保所有数据都是纯粹的显示数据，不含业务逻辑

## 数据迁移

### 迁移工具函数

```typescript
// 检查是否需要迁移
function needsMigration(data: ResumeData): boolean;

// 执行迁移
function migrateLegacyResumeToExtended(legacyData: LegacyResumeData): ExtendedResumeData;

// 安全迁移（如果需要）
function migrateResumeDataIfNeeded(data: ResumeData): ExtendedResumeData;

// 验证迁移结果
function validateMigratedData(original: LegacyResumeData, migrated: ExtendedResumeData): boolean;
```

### 迁移示例

```typescript
// 自动检测并迁移
const resumeData = loadResumeData();
const extendedData = migrateResumeDataIfNeeded(resumeData);

// 手动迁移
if (isLegacyResumeData(resumeData)) {
  const migrated = migrateLegacyResumeToExtended(resumeData);
  const isValid = validateMigratedData(resumeData, migrated);
  if (isValid) {
    saveResumeData(migrated);
  }
}
```

## AI 接口规范 (Schema-Driven)

所有 AI Flow 的输入都已被重构，以接收一个由 `SchemaRegistry` 统一构建的结构化 `context` 对象，而不是多个零散的字符串。这确保了AI上下文的一致性和可扩展性。

### 1. `autocomplete` 和 `improve` 接口

#### 输入参数 (Zod Schema)
```typescript
// improve-resume-section.ts
const ImproveResumeSectionInputSchema = z.object({
  resumeSection: z.string(),
  prompt: z.string(),
  context: z.object({
    currentItemContext: z.string(),
    otherSectionsContext: z.string(),
    userJobTitle: z.string().optional(),
  }),
  sectionType: z.string().optional(),
});

// autocomplete-input.ts
const AutocompleteInputInputSchema = z.object({
  inputText: z.string(),
  context: z.object({
    currentItemContext: z.string(),
    otherSectionsContext: z.string(),
    userJobTitle: z.string().optional(),
  }),
  sectionType: z.string().optional(),
});
```

### 2. `review` 接口

`review` 接口保持不变，但其输入字符串现在由 `schemaRegistry.stringifyResumeForReview(resumeData)` 统一生成，确保了对动态和传统章节的完全支持。

#### 输入参数 (Zod Schema)
```typescript
// review-resume.ts
const ReviewResumeInputSchema = z.object({
  resumeText: z.string().describe('The complete text content of the resume to be reviewed.'),
});
```

### 3. `batchImprove` 接口

`batchImprove` 接口用于对整个章节进行批量优化。

#### 输入参数 (Zod Schema)
```typescript
// batch-improve-section.ts
const BatchImproveSectionInputSchema = z.object({
  sectionData: z.record(z.any()),
  sectionType: z.string(),
  improvementGoals: z.array(z.string()),
  userJobTitle: z.string().optional(),
  otherSectionsContext: z.string().optional(),
});
```

---
*最后更新: 2025-06-24*  
*文档版本: v2.1.0*

<!-- 过时内容已移除 --> 