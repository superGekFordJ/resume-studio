# Resume Studio - 数据结构文档

## 核心数据模型

### 1. 简历数据结构 (ResumeData)

项目现在统一使用基于动态 Schema 的 `ExtendedResumeData` 格式。所有旧的 `LegacyResumeData` 格式都已被移除，并在应用加载时自动迁移。

```typescript
// 统一的简历数据格式
export type ResumeData = ExtendedResumeData;

// 扩展格式（支持动态Schema）
export interface ExtendedResumeData {
  personalDetails: PersonalDetails;
  sections: DynamicResumeSection[];
  templateId: string;
  schemaVersion: string; // 用于未来的数据迁移
  metadata?: {
    lastAIReview?: string;
    aiOptimizationLevel?: 'basic' | 'advanced' | 'expert';
  };
}
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

## 渲染视图模型 (Render View Models)

这是从 `ResumeData` 转换而来的、专门用于渲染的只读视图模型。

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
  defaultRenderType?: string;    // Schema建议的默认渲染组件
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

## 字段角色映射 (Field Role-Map)

为了实现渲染组件与具体字段名的解耦，我们引入了 Role-Map 机制。

```typescript
// 定义了字段在简历中的通用语义角色
export type FieldRole = 
  | 'title'         // 职位、学位、项目名等
  | 'organization'  // 公司、学校、组织名
  | 'description'   // 主要的描述性文本
  | 'startDate'     // 开始日期
  | 'endDate'       // 结束日期
  | 'location'      // 地理位置
  | 'dateRange'     // 组合的日期范围
  | 'url'           // 链接
  | 'skills'        // 技能列表
  | 'level'         // 等级或熟练度
  | 'identifier'    // 唯一标识符，如证书ID
  | 'other';        // 其他

// RoleMap 结构，将 schema 的字段名映射到其角色
export interface RoleMap {
  schemaId: string;
  schemaVersion: string;
  fieldMappings: Record<string, FieldRole | FieldRole[]>;
  inferredAt: string;
}
```

在渲染时，模板组件会获取对应章节的 `RoleMap`，并将其传递给原子渲染组件。渲染组件则使用 `pickFieldByRole(item, 'title', roleMap)` 这样的工具函数来安全地获取数据，而无需关心字段名是 `jobTitle` 还是 `position`。

---
*最后更新: 2025-07-04*  
*文档版本: v3.1.0*

<!-- 过时内容已移除 --> 