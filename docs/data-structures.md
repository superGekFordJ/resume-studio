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
}

// New: Structured context object returned by the registry
export interface StructuredAIContext {
  currentItemContext: string;
  otherSectionsContext: string;
  userJobTitle?: string;
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
*最后更新: 2025-06-19*
*文档版本: v2.0.0*

## 数据流转换

### 1. 简历数据 → 渲染数据

```typescript
// 将 ResumeData 转换为统一的渲染视图模型
function transformToRenderableView(
  resumeData: ResumeData, 
  schemaRegistry: SchemaRegistry
): RenderableResume {
  const sections: RenderableSection[] = resumeData.sections
    .filter(s => s.visible)
    .map(section => {
      if ('type' in section) {
        // 传统章节转换
        return transformLegacySection(section);
      } else {
        // 动态章节转换
        return transformDynamicSection(section, schemaRegistry);
      }
    })
    .filter((s): s is RenderableSection => s !== null);

  return {
    personalDetails: resumeData.personalDetails,
    sections,
  };
}
```

### 2. 简历数据 → AI 输入

```typescript
// 将 ResumeData (包括 LegacyResumeData 和 ExtendedResumeData) 转换为 AI 处理所需的文本格式
function stringifyResumeForAI(resumeData: ResumeData): string {
  let content = `Resume for ${resumeData.personalDetails.fullName}\n`;
  content += `Target Role: ${resumeData.personalDetails.jobTitle}\n\n`;
  
  // 添加联系信息
  content += `Contact: ${resumeData.personalDetails.email} | ${resumeData.personalDetails.phone}\n\n`;
  
  // 添加各个章节
  resumeData.sections.forEach(section => {
    if (section.visible) {
      content += `--- ${section.title.toUpperCase()} ---\n`;
      if ('type' in section) { // LegacyResumeData section
        section.items.forEach(item => {
          content += formatItemForAI(item, section.type) + '\n';
        });
      } else if ('schemaId' in section) { // DynamicResumeSection
        section.items.forEach(item => {
          content += `Dynamic Item (Schema: ${item.schemaId}):\n`;
          Object.entries(item.data).forEach(([key, value]) => {
            if (typeof value === 'string') {
              content += `  ${key}: ${value}\n`;
            } else if (Array.isArray(value)) {
              content += `  ${key}: ${value.join(', ')}\n`;
            } else {
              content += `  ${key}: ${JSON.stringify(value)}\n`;
            }
          });
          content += '\n';
        });
      }
      content += '\n';
    }
  });
  
  return content;
}

// 辅助函数：格式化单个项目为 AI 可读文本
function formatItemForAI(item: SectionItem, sectionType: SectionType): string {
  switch (sectionType) {
    case 'experience':
      const exp = item as ExperienceEntry;
      return `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`;
    case 'education':
      const edu = item as EducationEntry;
      return `${edu.degree} from ${edu.institution} (${edu.graduationYear})${edu.details ? ': ' + edu.details : ''}`;
    case 'skills':
      const skill = item as SkillEntry;
      return `- ${skill.name}`;
    case 'summary':
    case 'customText':
      const text = item as CustomTextEntry;
      return `${text.content}`;
    default:
      return JSON.stringify(item);
  }
}
```

### 3. 用户输入 → 数据更新

```typescript
// 处理用户编辑操作的数据更新
function updateResumeData(
  currentData: ResumeData, 
  updateType: 'personalDetails' | 'section' | 'item',
  targetId: string,
  newValue: any
): ResumeData {
  switch (updateType) {
    case 'personalDetails':
      return {
        ...currentData,
        personalDetails: { ...currentData.personalDetails, ...newValue }
      };
    case 'section':
      return {
        ...currentData,
        sections: currentData.sections.map(section =>
          section.id === targetId ? { ...section, ...newValue } : section
        )
      };
    case 'item':
      // 更新特定章节中的特定项目
      return updateSectionItem(currentData, targetId, newValue);
  }
}

// 辅助函数：更新章节中的单个项目
function updateSectionItem(
  currentData: ResumeData,
  targetItemId: string,
  newValue: any
): ResumeData {
  // 遍历所有章节以找到包含目标项目的章节
  const updatedSections = currentData.sections.map(section => {
    if ('items' in section) { // 适用于 LegacyResumeData 和 DynamicResumeSection
      const updatedItems = section.items.map(item => {
        if (item.id === targetItemId) {
          if ('data' in item) { // DynamicSectionItem
            return { ...item, data: { ...item.data, ...newValue } };
          } else { // Legacy SectionItem
            return { ...item, ...newValue };
          }
        }
        return item;
      });
      return { ...section, items: updatedItems };
    }
    return section;
  });

  return { ...currentData, sections: updatedSections };
}
```

## 数据验证规范

### 1. 输入验证
```typescript
import { z } from 'zod';

// 个人信息验证
const PersonalDetailsSchema = z.object({
  fullName: z.string().min(1, "姓名不能为空"),
  jobTitle: z.string().min(1, "职位不能为空"),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().min(1, "电话不能为空"),
  address: z.string().min(1, "地址不能为空"),
  linkedin: z.string().url("LinkedIn URL格式不正确").optional().or(z.literal('')),
  github: z.string().url("GitHub URL格式不正确").optional().or(z.literal('')),
  portfolio: z.string().url("作品集 URL格式不正确").optional().or(z.literal('')),
  avatar: z.string().optional().or(z.literal('')),
});

// 传统章节项验证 (示例，需为每种类型定义具体 schema)
const ExperienceEntrySchema = z.object({
  id: z.string(),
  jobTitle: z.string().min(1),
  company: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z.string().min(1),
});

// 动态章节项数据验证 (SchemaRegistry 会根据 FieldSchema 动态生成)
const DynamicSectionItemDataSchema = z.record(z.any()); // 动态，取决于 schema 定义

// 传统章节验证
const ResumeSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum(['summary', 'experience', 'education', 'skills', 'customText']),
  visible: z.boolean(),
  items: z.array(z.any()), // 类型在此处可能不精确，实际会根据 type 鉴别
  isList: z.boolean(),
});

// 动态章节验证
const DynamicResumeSectionSchema = z.object({
  id: z.string(),
  schemaId: z.string().min(1),
  title: z.string().min(1),
  visible: z.boolean(),
  items: z.array(z.object({
    id: z.string(),
    schemaId: z.string().min(1),
    data: DynamicSectionItemDataSchema,
    metadata: z.object({
      createdAt: z.string(),
      updatedAt: z.string(),
      aiGenerated: z.boolean().optional(),
    }).optional(),
  })),
  metadata: z.object({
    customTitle: z.boolean().optional(),
    aiOptimized: z.boolean().optional(),
  }).optional(),
});

// 简历数据验证 (主 Schema)
const ResumeDataSchema = z.object({
  personalDetails: PersonalDetailsSchema,
  sections: z.array(z.union([
    ResumeSectionSchema,
    DynamicResumeSectionSchema
  ])),
  templateId: z.string().min(1),
  schemaVersion: z.string().optional(), // 仅在 ExtendedResumeData 中存在
  metadata: z.object({
    lastAIReview: z.string().optional(),
    aiOptimizationLevel: z.enum(['basic', 'advanced', 'expert']).optional(),
  }).optional(),
}).superRefine((data, ctx) => {
  // 根据是否存在 schemaVersion 字段来细化验证
  if ('schemaVersion' in data) {
    const extendedData = data as ExtendedResumeData;
    // 可以在这里添加针对 ExtendedResumeData 的特定验证
  } else {
    const legacyData = data as LegacyResumeData;
    // 可以在这里添加针对 LegacyResumeData 的特定验证
  }
});

// 验证函数
function validateResumeData(data: ResumeData): { success: boolean; errors?: z.ZodError<ResumeData> } {
  const result = ResumeDataSchema.safeParse(data);
  if (!result.success) {
    return { success: false, errors: result.error };
  }
  return { success: true };
}
```

## 存储格式

### 1. 本地存储 (localStorage)
```typescript
// 存储键名规范
const STORAGE_KEYS = {
  RESUME_DATA: 'resume_studio_data',
  USER_PREFERENCES: 'resume_studio_preferences',
  TEMPLATE_CACHE: 'resume_studio_templates'
};

// 存储格式
interface StoredResumeData {
  version: string;                      // 数据版本号
  lastModified: string;                 // 最后修改时间
  data: ResumeData;                     // 简历数据
}
```

### 2. 导出格式
```typescript
// PDF 导出配置
interface ExportConfig {
  format: 'pdf' | 'docx' | 'html';
  pageSize: 'A4' | 'Letter';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  templateId: string;
}
```

## 错误处理规范

### 1. 数据错误类型
```typescript
enum DataErrorType {
  VALIDATION_ERROR = 'validation_error',
  AI_SERVICE_ERROR = 'ai_service_error',
  STORAGE_ERROR = 'storage_error',
  TEMPLATE_ERROR = 'template_error'
}

interface DataError {
  type: DataErrorType;
  message: string;
  field?: string;                       // 相关字段
  code?: string;                        // 错误代码
}
```

### 2. 错误处理策略
- **验证错误**: 显示具体字段错误信息
- **AI 服务错误**: 提供重试选项和降级方案
- **存储错误**: 自动备份和恢复机制
- **模板错误**: 回退到默认模板 