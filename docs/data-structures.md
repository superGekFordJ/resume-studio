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
    contextBuilder?: string;            // 如何为AI构建上下文的构建器ID
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
    summaryBuilder: string;             // 如何为其他章节构建此章节的摘要的构建器ID
    itemContextBuilder: string;         // 如何为AI构建单个条目的上下文的构建器ID
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
}

// ContextBuilderFunction 定义了用于构建 AI 上下文的函数签名
export type ContextBuilderFunction = (data: any, allData: any) => string;
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
        contextBuilder: 'skill-category',
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
        contextBuilder: 'skill-list',
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
        contextBuilder: 'skill-proficiency',
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
        contextBuilder: 'skill-experience',
        priority: 'low'
      } // 新增 AI 提示
    }
  ],
  aiContext: {
    summaryBuilder: 'advanced-skills-summary',
    itemContextBuilder: 'advanced-skills-item',
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
        contextBuilder: 'project-name',
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
        contextBuilder: 'project-description',
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
        contextBuilder: 'project-technologies',
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
        contextBuilder: 'project-start-date',
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
        contextBuilder: 'project-end-date',
        priority: 'low'
      } // 新增 AI 提示
    }
  ],
  aiContext: {
    summaryBuilder: 'projects-summary',
    itemContextBuilder: 'projects-item',
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

## AI 接口规范

### 1. 增强的自动补全接口

#### 输入参数
```typescript
interface AutocompleteInputInput {
  inputText: string;                    // 用户输入的文本
  userJobTitle?: string;                // 用户目标职位
  sectionType?: string;                 // 章节类型或动态schema ID
  currentItemContext?: string;          // 当前项目上下文 (legacy support)
  otherSectionsContext?: string;        // 其他章节上下文
  // 增强的动态章节支持
  fieldId?: string;                     // 特定字段ID
  currentItemData?: Record<string, any>; // 当前项目完整数据
  allResumeData?: Record<string, any>;  // 完整简历数据
  enhancedContext?: string;             // 预构建的增强上下文，用于解决 Handlebars helper 问题
}
```

### 2. 增强的内容改进接口

#### 输入参数
```typescript
interface ImproveResumeSectionInput {
  resumeSection: string;                // 待改进的章节内容
  prompt: string;                       // 改进指令
  userJobTitle?: string;                // 用户目标职位
  sectionType?: string;                 // 章节类型或动态schema ID
  currentItemContext?: string;          // 当前项目上下文 (legacy support)
  otherSectionsContext?: string;        // 其他章节上下文
  // 增强的动态章节支持
  fieldId?: string;                     // 特定字段ID
  currentItemData?: Record<string, any>; // 当前项目完整数据
  allResumeData?: Record<string, any>;  // 完整简历数据
  enhancedContext?: string;             // 预构建的增强上下文，用于解决 Handlebars helper 问题
}
```

### 3. 批量改进接口

#### 输入参数
```typescript
interface BatchImproveSectionInput {
  sectionData: Record<string, any>;     // 完整章节数据
  sectionType: string;                  // 章节类型/schema ID
  improvementGoals: string[];           // 改进目标列表
  userJobTitle?: string;                // 用户目标职位
  otherSectionsContext?: string;        // 其他章节上下文
  allResumeData?: Record<string, any>;  // 完整的简历数据 (包含个人信息和所有章节)
  priorityFields?: string[];            // 优先改进的字段
}
```

#### 输出结果
```typescript
interface BatchImproveSectionOutput {
  improvedSectionData: Record<string, any>; // 改进后的章节数据
  improvementSummary: string;               // 改进摘要
  fieldChanges: Array<{
    fieldId: string;
    originalValue: string;
    improvedValue: string;
    changeReason: string;
  }>;
}
```

### 4. 综合简历分析接口

#### 输入参数
```typescript
interface ComprehensiveResumeAnalysisInput {
  resumeData: Record<string, any>;      // 完整简历数据
  analysisType: 'ats-optimization' | 'content-enhancement' | 'structure-improvement' | 'industry-alignment';
  targetRole?: string;                  // 目标职位
  industryContext?: string;             // 目标行业
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
}
```

#### 输出结果
```typescript
interface ComprehensiveResumeAnalysisOutput {
  overallScore: number;                 // 整体评分 (0-100)
  sectionScores: Record<string, number>; // 各章节评分
  priorityImprovements: Array<{
    section: string;
    field?: string;
    issue: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;
  atsCompatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  contentAnalysis: {
    strengthsCount: number;
    weaknessesCount: number;
    keywordDensity: Record<string, number>;
    readabilityScore: number;
  };
  nextSteps: string[];
}
```

## 使用示例

### 创建动态章节

```typescript
// 获取Schema注册中心
const schemaRegistry = SchemaRegistry.getInstance();

// 创建新的高级技能章节
const newSection: DynamicResumeSection = {
  id: 'advanced-skills_' + Date.now(),
  schemaId: 'advanced-skills',
  title: 'Advanced Skills',
  visible: true,
  items: [
    {
      id: 'skill_1',
      schemaId: 'advanced-skills',
      data: {
        category: 'Technical Skills',
        skills: ['React', 'TypeScript', 'Node.js'],
        proficiency: 'Advanced'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiGenerated: false
      }
    }
  ],
  metadata: {
    customTitle: false,
    aiOptimized: false
  }
};
```

### 使用AI上下文构建器

```typescript
// 构建项目上下文
const projectContext = schemaRegistry.buildContext(
  'projects-item',
  {
    name: 'E-commerce Platform',
    technologies: ['React', 'Node.js', 'MongoDB']
  },
  allResumeData
);
// 结果: "Project: E-commerce Platform, Tech: React, Node.js, MongoDB"

// 批量改进章节
const improvedSection = await batchImproveSection({
  sectionData: projectsSection.items[0].data,
  sectionType: 'projects',
  improvementGoals: [
    'Add quantifiable results',
    'Highlight technical challenges',
    'Emphasize leadership skills'
  ],
  userJobTitle: 'Senior Full Stack Developer',
  allResumeData: allResumeData // 确保传入完整的简历数据
});
```

## 数据流转换

### 1. 简历数据 → 渲染数据

```typescript
// 将 ResumeData 转换为模板渲染所需的格式
function transformForRendering(resumeData: ResumeData): TemplateRenderData {
  return {
    personalInfo: resumeData.personalDetails,
    visibleSections: resumeData.sections.filter(section => section.visible),
    templateConfig: getTemplateConfig(resumeData.templateId)
  };
}

interface TemplateRenderData {
  personalInfo: PersonalDetails;
  visibleSections: (ResumeSection | DynamicResumeSection)[];
  templateConfig: any; // 具体类型待定义
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

### 2. AI 输入验证
```typescript
// 所有 AI 接口都使用 Zod schema 进行输入验证
const AutocompleteInputSchema = z.object({
  inputText: z.string().min(1, "输入文本不能为空"),
  userJobTitle: z.string().optional(),
  sectionType: z.string().optional(),
  currentItemContext: z.string().optional(),
  otherSectionsContext: z.string().optional(),
  fieldId: z.string().optional(),
  currentItemData: z.record(z.any()).optional(),
  allResumeData: z.record(z.any()).optional(),
  enhancedContext: z.string().optional(),
});

const ImproveResumeSectionInputSchema = z.object({
  resumeSection: z.string().min(1, "待改进内容不能为空"),
  prompt: z.string().min(1, "提示不能为空"),
  userJobTitle: z.string().optional(),
  sectionType: z.string().optional(),
  currentItemContext: z.string().optional(),
  otherSectionsContext: z.string().optional(),
  fieldId: z.string().optional(),
  currentItemData: z.record(z.any()).optional(),
  allResumeData: z.record(z.any()).optional(),
  enhancedContext: z.string().optional(),
});

const BatchImproveSectionInputSchema = z.object({
  sectionData: z.record(z.any()),
  sectionType: z.string().min(1),
  improvementGoals: z.array(z.string().min(1)),
  userJobTitle: z.string().optional(),
  otherSectionsContext: z.string().optional(),
  allResumeData: z.record(z.any()).optional(),
  priorityFields: z.array(z.string()).optional(),
});

const ComprehensiveResumeAnalysisInputSchema = z.object({
  resumeData: z.record(z.any()),
  analysisType: z.enum(['ats-optimization', 'content-enhancement', 'structure-improvement', 'industry-alignment']),
  targetRole: z.string().optional(),
  industryContext: z.string().optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
});
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