# A4 Resume Studio - 项目架构文档

## 项目概述

A4 Resume Studio 是一个基于 Next.js 的现代化简历构建应用，集成了 AI 功能来提供智能的简历编辑和优化体验。它采用 **Schema 驱动** 的架构，确保了数据的一致性、可扩展性和可维护性。

## 技术栈

- **前端框架**: Next.js 15.3.3 (React 18.3.1)
- **UI 组件库**: Radix UI + Tailwind CSS
- **AI 集成**: Google Genkit + Gemini API
- **状态管理**: Zustand (with persistence)
- **类型系统**: TypeScript
- **样式**: Tailwind CSS + CSS Variables

## 项目结构

```
src/
├── ai/                     # AI 功能模块
│   ├── flows/             # AI 流程定义
│   │   ├── autocomplete-input.ts      # 自动补全
│   │   ├── improve-resume-section.ts  # 简历改进
│   │   ├── review-resume.ts           # 简历评审
│   │   └── batch-improve-section.ts   # 批量改进 (新增)
│   ├── genkit.ts          # Genkit 配置
│   └── dev.ts             # 开发环境配置
├── app/                   # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件 (shadcn/ui)
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx           # 应用头部
│   │   └── SidebarNavigator.tsx # 两阶段侧边栏导航器 (新增)
│   └── resume/           # 简历相关组件 (重组后)
│       ├── canvas/             # 画布相关组件
│       │   ├── ResumeCanvas.tsx      # 简历画布
│       │   └── PrintableResume.tsx   # 可打印简历组件 (新增)
│       ├── editor/             # 编辑器相关组件
│       │   ├── SectionEditor.tsx     # 章节编辑器 (已重构)
│       │   ├── PersonalDetailsEditor.tsx # 个人信息编辑器 (新增)
│       │   ├── SectionItemEditor.tsx # 章节项目编辑器 (新增)
│       │   ├── AIFieldWrapper.tsx    # AI字段包装器 (新增)
│       │   ├── SectionManager.tsx    # 章节管理器
│       │   └── DynamicFieldRenderer.tsx # 动态字段渲染器
│       ├── rendering/          # 原子渲染组件 (新增)
│       │   ├── BadgeListComponent.tsx   # 徽章列表组件
│       │   ├── SimpleListComponent.tsx  # 简单列表组件
│       │   ├── TitledBlockComponent.tsx # 标题块组件
│       │   └── SingleTextComponent.tsx  # 单文本组件
│       ├── templates/          # 模板组件
│       │   ├── DefaultTemplate.tsx   # 默认模板 (新增)
│       │   └── ModernTemplate.tsx    # 现代模板组件
│       └── ui/                # UI 相关组件
│           ├── AIReviewDialog.tsx    # AI 评审对话框
│           ├── AutocompleteTextarea.tsx # 自动补全文本框
│           ├── AvatarUploader.tsx    # 头像上传组件
│           └── TemplateSelector.tsx  # 模板选择器
├── hooks/                # 自定义 Hooks
│   ├── use-toast.ts      # Toast 通知
│   └── useHydratedStore.ts # Zustand hydration hook (新增)
├── stores/               # Zustand stores (新增)
│   └── resumeStore.ts    # 中央状态存储
├── lib/                  # 工具函数
│   ├── utils.ts          # 通用工具
│   ├── schemaRegistry.ts # Schema 注册中心 (新增)
│   ├── dataTransformer.ts # 数据转换器 (新增)
│   └── pdfExport.ts      # PDF 导出工具 (已简化，仅保留工具函数)
└── types/                # TypeScript 类型定义
    ├── resume.ts         # 简历相关类型
    └── schema.ts         # Schema 定义 (新增)
```

## 核心架构模式

### 1. Schema 驱动架构 (Schema-Driven Architecture) - 单一数据源

本项目的核心是 **Schema 驱动架构**，其中 `SchemaRegistry` (`src/lib/schemaRegistry.ts`) 是**唯一的真实来源 (Single Source of Truth)**。

- **`SchemaRegistry` 的职责**:
  - **定义数据结构**: 管理所有 `SectionSchema` 和 `FieldSchema`，定义了简历中每个部分的结构、类型和属性。
  - **定义UI行为**: Schema 中包含 `uiConfig` 和 `uiProps`，直接驱动 UI 组件的渲染方式（例如，图标、占位符、按钮文本）。
  - **定义验证规则**: Schema 中包含字段的验证规则。
  - **定义AI交互**: Schema 中的 `aiHints` 和 `aiContext` 定义了如何为每个字段或章节构建 AI 上下文，以及哪些 AI 功能可用。

- **UI 组件的角色**:
  - **"无知"的渲染层**: UI 组件（如 `SectionEditor`, `AutocompleteTextarea`）不包含任何业务逻辑。它们只负责根据从 `SchemaRegistry` 获取的 Schema 定义来渲染界面，并向上派发用户事件。
  - **禁止硬编码**: 组件中严禁出现任何基于 `section.type` 或 `field.id` 的硬编码逻辑判断。所有行为都由 Schema 驱动。

### 2. 数据流架构 (Updated 2025-06-23)

```
                               +---------------------+
                               |   SchemaRegistry    |  <-- Business Logic & Schema
                               | (Defines Everything)|
                               +----------+----------+
                                          |
                                          |
                               +----------v----------+
                               |   Zustand Store     |  <-- UI State Management
                               | (resumeStore.ts)    |
                               | - Centralized State |
                               | - Persistence       |
                               | - AI Interactions   |
                               +----------+----------+
                                          |
                 +------------------------+------------------------+
                 |                                                 |
+----------------v----------------+           +--------------------v-------------------+
|      UI Components              |           |        AI Services (Flows)           |
| (e.g., SectionEditor)           |           | (e.g., improve, autocomplete)        |
| - Subscribe to Store            |           | - Receive structured context         |
| - Dispatch Store Actions        |           | - Perform AI tasks                   |
| - Pure Presentation             |           | - Return results to Store            |
+----------------+----------------+           +--------------------+-------------------+
                 |                                                 |
                 | 1. User action (e.g., type in textarea)         |
                 |                                                 | 5. AI returns result
                 | 2. Component dispatches Store Action            |
                 |                                                 |
                 | 3. Store calls SchemaRegistry for context       |
                 |                                                 |
                 | 4. Store calls AI Service with context          |
                 |                                                 |
                 +------------------------------------------------->
```

### 3. 解耦渲染架构 (Decoupled Rendering Architecture) - 混合渲染模型

```
       ResumeData                    SchemaRegistry
            |                              |
            +------------------------------+
                           |
                           v
                   DataTransformer
                (transformToRenderableView)
                           |
                           v
                   RenderableResume
                 (View Model with defaultRenderType)
                           |
                           v
                   ResumeCanvas
                 (Screen & PDF Rendering)
                           |
                           v
                 Template Components
                  (Layout Dispatchers)
                           |
                           v
              Atomic Rendering Components
```

**重要更新 (2025-06-20)**: PDF 导出现已通过 `react-to-print` 库直接使用 `ResumeCanvas` 组件，确保了真正的 WYSIWYG（所见即所得）体验。不再需要单独的 PDF 渲染路径。

#### 混合渲染模型 ("Default + Override")

新的架构引入了一个**混合渲染模型**，平衡了约定与灵活性：

- **Schema 提供默认建议**: 每个 `SectionSchema` 的 `uiConfig` 中包含 `defaultRenderType`，建议该类型章节的默认渲染方式（如 `badge-list`、`timeline`、`simple-list` 等）。

- **模板作为布局调度器**: 模板组件（如 `DefaultTemplate`、`ModernTemplate`）充当"布局调度器"，它们可以：
  - 接受 Schema 的默认渲染建议
  - 通过 `templateLayoutMap` 覆写特定章节的渲染方式
  - 调度到相应的原子渲染组件

- **原子渲染组件**: 可复用的渲染组件，专注于特定的展示逻辑：
  - `BadgeListComponent`: 徽章式列表展示
  - `SimpleListComponent`: 简单的项目符号列表
  - `TitledBlockComponent`: 带标题的块状布局（时间线样式）
  - `SingleTextComponent`: 单一文本内容展示

**示例**：
```typescript
// 在模板中的混合渲染逻辑
const renderSectionByRenderType = (section: RenderableSection) => {
  // 模板特定的覆写规则
  const templateLayoutMap = {
    'skills': 'simple-list', // 覆写技能部分为简单列表
  };

  // 使用覆写或默认渲染类型
  const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType;

  // 调度到相应的原子组件
  switch (finalRenderType) {
    case 'simple-list':
      return <SimpleListComponent items={section.items} />;
    case 'badge-list':
      return <BadgeListComponent items={section.items} />;
    // ... 其他渲染类型
  }
};
```

### 4. 数据流与AI交互 (Updated 2025-06-23)

**重要更新**: 随着 `SectionEditor` 的重构和 Zustand 状态管理的深度集成，数据流和 AI 交互流程已经显著简化：

1. **用户输入 → Store Action → Schema查询 → AI处理 → Store更新 → UI更新**
   - 用户在 UI 组件中进行操作（例如，点击"改进"按钮）
   - UI 组件**不直接**调用 AI 服务，而是派发 Store Action（如 `startAIImprovement`）
   - Store Action 调用 `schemaRegistry.buildAIContext(payload)` 构建上下文
   - Store Action 调用 AI Flow 并处理结果
   - Store 更新状态（如 `aiImprovement`）
   - UI 组件自动响应状态变化并更新视图

2. **组件分解与职责明确**
   - `SectionEditor`: 纯展示组件，协调子组件的渲染
   - `PersonalDetailsEditor`: 处理个人信息编辑
   - `SectionItemEditor`: 处理章节项目编辑
   - `AIFieldWrapper`: 封装所有 AI 改进 UI 交互
   - `AutocompleteTextarea`: 处理自动补全交互。它直接调用 AI flow 来获取内联建议，并通过 props 接收来自 store 的"强制建议"（AI 改进建议）。

### 5. AI 集成架构
- **统一的上下文构建**: 所有 AI 功能的上下文都由 `schemaRegistry.buildAIContext` 方法统一构建，确保了数据的一致性和可预测性。
- **结构化输入**: AI Flow 的输入（`inputSchema`）接收的是结构化的 `context` 对象，而不是非结构化的字符串 "context blob"，这使得 Prompt Engineering 更加稳定和可控。
- **Flow-based**: 使用 Genkit 的 Flow 模式，将每个 AI 功能封装为独立、可复用的单元。
- **Server Actions**: 所有 AI 调用都在服务端执行，保证了安全性和性能。

## 关键设计决策

### 1. 依赖倒置 (Dependency Inversion)
- **旧架构**: UI 组件**告诉** `SchemaRegistry` 要构建什么。
- **新架构**: UI 组件**询问** `SchemaRegistry` 它应该如何处理数据和构建上下文。这种依赖倒置是本次重构的核心，它极大地降低了耦合度，提升了系统的可维护性和扩展性。

### 2. 状态管理 (Updated 2025-06-23)

#### Zustand Store Architecture
- **Centralized State**: 所有 UI 状态都集中在单一 Zustand store (`resumeStore.ts`) 中管理
- **Persistence**: 使用 Zustand 的 persist 中间件自动保存到 `localStorage`
- **Type Safety**: 完整的 TypeScript 支持，强类型的状态和操作
- **Performance**: 组件只订阅它们需要的状态切片，最小化不必要的重渲染
- **Hydration Handling**: 自定义 `useHydratedStore` hook 防止 SSR/客户端水合不匹配
- **AI Interaction**: 所有 AI 交互现在由 Store Actions 处理，而非组件

#### Store Structure
```typescript
interface ResumeState {
  resumeData: ResumeData;
  selectedTemplateId: string;
  editingTarget: string | null;
  isLeftPanelOpen: boolean;
  isAutocompleteEnabled: boolean;
  isReviewDialogOpen: boolean;
  reviewContent: ReviewResumeOutput | null;
  isReviewLoading: boolean;
  
  // 新增: AI 改进状态
  aiImprovement: {
    uniqueFieldId: string;
    suggestion: string;
    originalText: string;
  } | null;
  isImprovingFieldId: string | null;
  aiPrompt: string;
}

interface ResumeActions {
  // 现有操作
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setSelectedTemplateId: (templateId: string) => void;
  setEditingTarget: (target: string | null) => void;
  
  // 新增: 数据操作
  updateField: (payload: { sectionId: string; itemId?: string; fieldId: string; value: any; isPersonalDetails?: boolean }) => void;
  updateSectionTitle: (payload: { sectionId: string; newTitle: string }) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (payload: { sectionId: string; itemId: string }) => void;
  
  // 新增: AI 改进操作
  setAIPrompt: (prompt: string) => void;
  startAIImprovement: (payload: { sectionId: string; itemId?: string; fieldId: string; currentValue: string; uniqueFieldId: string; isPersonalDetails?: boolean }) => Promise<void>;
  acceptAIImprovement: () => void;
  rejectAIImprovement: () => void;
}
```

#### Benefits
- **No Prop Drilling**: 组件直接从 Store 访问状态，不再需要层层传递 props
- **Persistence**: 用户的工作自动保存和恢复
- **Scalability**: 无需重构即可轻松添加新的状态切片
- **DevTools**: 完全支持 Redux DevTools 进行调试
- **Simplified Components**: UI 组件显著简化，专注于渲染而非状态管理
- **Unified AI Flow**: AI 交互统一由 Store 处理，确保一致性

### 3. 组件分解与单一职责 (Updated 2025-06-23)

**SectionEditor 重构**:
- **重构前**: 800多行代码，混合了状态管理、UI 渲染和业务逻辑
- **重构后**: ~180行清晰、专注的代码，零本地业务状态

**新增组件**:
- **PersonalDetailsEditor**: 处理个人信息编辑，直接连接到 Store Actions
- **SectionItemEditor**: 管理单个章节项目的编辑，适用于传统和动态章节
- **AIFieldWrapper**: 封装所有 AI 改进功能，管理 AI 提示输入和改进按钮

**AutocompleteTextarea 增强**:
- 现在可以直接从 Store 读取 AI 改进建议
- 保持向后兼容性的同时，自动绑定到 Store Actions

### 4. 扩展性
- **添加新章节**: 只需在 `schemaRegistry.ts` 中定义一个新的 `SectionSchema` 并注册对应的 `ContextBuilderFunction`，UI 无需任何修改即可支持新章节的编辑和 AI 功能。
- **添加新AI功能**: 只需创建一个新的 AI Flow，并在 `FieldSchema.aiHints.contextBuilders` 中为新功能添加一个 `contextBuilder` ID。
- **添加新模板**: 创建新的模板组件，可以自由选择接受或覆写默认渲染建议。
- **添加新渲染样式**: 创建新的原子渲染组件，在 Schema 中指定为默认，或在模板中作为覆写选项。

## 主要功能模块

### 1. 简历编辑器 (Resume Editor)
- **模板选择**: 支持多种简历模板
- **章节管理**: 动态添加/删除/重排序章节，支持传统章节和动态 Schema 章节。
- **两阶段编辑**: 结构视图和内容视图的分离，提供清晰的编辑焦点
- **实时预览**: 所见即所得的编辑体验
- **响应式设计**: 支持桌面和移动端

### 2. AI 助手 (AI Assistant)
- **自动补全**: 基于上下文的智能补全
- **内容改进**: AI 驱动的文本优化
- **批量改进**: 针对特定章节内容的批量优化。
- **整体评审**: 全面的简历质量分析

### 3. 模板系统 (Template System)
- **可扩展**: 易于添加新模板
- **组件化**: 每个模板都是独立的 React 组件
- **主题支持**: 支持深色/浅色主题
- **灵活渲染**: 通过混合渲染模型，模板可以保持个性化同时利用统一的原子组件

## 扩展性考虑

### 1. 新模板添加
1. 创建新的模板组件
2. 定义模板特定的 `templateLayoutMap`（可选）
3. 在 `PrintableResume` 中注册

### 2. 新 AI 功能
1. 在 `src/ai/flows/` 中定义新的 Flow
2. 创建对应的 UI 组件
3. 集成到主应用中

### 3. 国际化支持
- 预留了多语言支持的架构
- 使用 TypeScript 确保类型安全
- 组件化设计便于本地化

## 部署架构

- **平台**: Firebase App Hosting
- **构建**: Next.js 静态导出 + 服务端功能
- **AI 服务**: Google Gemini API
- **CDN**: Firebase CDN 加速

## 安全考虑

- **API 密钥**: 服务端环境变量管理
- **输入验证**: Zod schema 验证所有 AI Flow 的输入
- **错误处理**: 不暴露敏感信息的错误处理
- **CORS**: 适当的跨域资源共享配置

## AI Services
- **Purpose**: Provide intelligent assistance for resume writing
- **Key Features**: Auto-completion, section improvement, resume review
- **Implementation**: Server-side AI flows using Genkit

## Schema-Driven Architecture (Updated 2025-06-19)

### Current State
The application has successfully transitioned to a pure Schema-driven architecture where:

1. **SchemaRegistry as Single Source of Truth**
   - All section structures defined in schemas
   - All AI context building centralized
   - All business logic contained in the registry

2. **Pure UI Components**
   - `SectionEditor` no longer contains type-specific rendering logic
   - All fields rendered through `DynamicFieldRenderer`
   - UI components are "dumb" renderers driven by schemas

3. **Unified AI Service Layer**
   - All AI operations go through `SchemaRegistry` methods:
     - `improveField()` - Field improvement
     - `getAutocomplete()` - Auto-completion
     - `batchImproveSection()` - Batch improvements
     - `reviewResume()` - Full resume review
   - No direct AI Flow calls from UI components

4. **Proven Extensibility**
   - New section types (e.g., "Certifications") can be added by only:
     - Registering a schema in SchemaRegistry
     - Adding context builders
   - Zero UI code changes required

### Architecture Flow
```
Schema Definition → SchemaRegistry → UI Components
                          ↓
                    AI Service Layer
                          ↓
                      AI Flows
```

## State Management with Zustand (Updated 2025-06-23)

### Overview
The application now uses Zustand for centralized state management, replacing the previous prop-drilling approach:

1. **Single Source of Truth**: All UI state lives in `resumeStore.ts`
2. **Automatic Persistence**: State is automatically saved to localStorage
3. **Direct Component Access**: Components subscribe directly to state slices
4. **Hydration Safety**: Custom hook prevents SSR/client mismatches
5. **Business Logic Centralization**: All data manipulation and AI interaction logic now resides in store actions

### Migration Benefits
- **Eliminated Prop Drilling**: No more passing state through multiple layers
- **Improved Performance**: Components only re-render when their subscribed state changes
- **Better Developer Experience**: Clear separation between UI state and business logic
- **User Experience**: Work is automatically saved and restored between sessions
- **Simplified Components**: UI components are now pure presentation, focused only on rendering

## Hybrid Rendering Model (Updated 2025-06-20)

### Overview
The hybrid rendering model provides a perfect balance between convention and flexibility:

1. **Convention Through Defaults**
   - Each schema defines a `defaultRenderType` suggesting the best way to render that section
   - Provides consistency across different templates
   - Makes it easy to add new sections with sensible defaults

2. **Flexibility Through Overrides**
   - Templates can override any section's rendering through `templateLayoutMap`
   - Allows templates to maintain their unique character
   - No need to modify schemas when creating specialized templates

3. **Reusability Through Atomic Components**
   - Shared atomic rendering components ensure consistency
   - Templates focus on layout decisions, not implementation details
   - Easy to add new rendering styles by creating new atomic components

This architecture ensures maximum flexibility and maintainability while keeping the codebase clean and organized.

## Template System (Updated 2025-06-19)

### Template Architecture
The template system follows the hybrid rendering model, allowing each template to maintain its unique design while leveraging shared atomic components:

1. **Available Templates**
   - **Classic Professional** (`default`): Traditional single-column layout with enhanced personal details rendering
   - **Modern Minimalist** (`modern-minimalist`): Clean design with subtle styling
   - **Creative Two-Column** (`creative`): Innovative two-column layout with sidebar for skills and contact info

2. **Atomic Rendering Components**
   - `BadgeListComponent`: Renders items as badges (e.g., skills)
   - `SimpleListComponent`: Renders items as bullet points
   - `TitledBlockComponent`: Timeline-style rendering for experiences/education
   - `SingleTextComponent`: For single text content like summaries
   - `ProjectItemComponent`: Specialized rendering for projects with tech tags
   - `CertificationItemComponent`: Renders certifications with icons and validity
   - `AdvancedSkillsComponent`: Groups skills by category with proficiency levels

3. **Two-Column Layout Implementation**
   The Creative template demonstrates how to implement complex layouts:
   ```typescript
   // Define which sections go into which column
   const sidebarSections = ['skills', 'advanced-skills', 'languages', 'certifications'];
   
   const mainColumnSections = sections.filter(s => !sidebarSections.includes(s.schemaId));
   const sideColumnSections = sections.filter(s => sidebarSections.includes(s.schemaId));
   ```

### How to Develop a New Template

1. **Create Template Component**
   - Create a new file in `src/components/resume/templates/`
   - Accept a single prop: `{ resume: RenderableResume }`
   - Implement layout-specific logic

2. **Implement Rendering Dispatcher**
   ```typescript
   const renderSectionByRenderType = (section: RenderableSection) => {
     // Define template-specific overrides
     const templateLayoutMap: Record<string, string> = {
       'skills': 'simple-list', // Override default
     };
     
     // Use override or default
     const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType;
     
     // Dispatch to atomic components
     switch (finalRenderType) {
       case 'simple-list':
         return <SimpleListComponent items={section.items} />;
       // ... other cases
     }
   };
   ```

3. **Register Template**
   - Add to `templates` array in `src/types/resume.ts`
   - Add case in `PrintableResume.tsx` switch statement

### WYSIWYG PDF Export
The PDF export system ensures pixel-perfect consistency between screen and print:

1. **Unified Styling**: PDF export uses the exact same CSS classes as Canvas rendering
2. **Font Consistency**: Both Canvas and PDF use the same font families and sizes
3. **Layout Preservation**: Margins, padding, and spacing are identical
4. **Dynamic Field Handling**: Empty fields are filtered at the data transformation layer

### Best Practices

1. **Template Design**
   - Focus on layout and visual hierarchy
   - Leverage existing atomic components
   - Only create new atomic components for truly unique rendering needs

2. **Field Rendering**
   - Always check for field values before rendering
   - Use optional chaining (`?.`) for safe access
   - Filter empty fields at the data layer when possible

3. **Responsive Design**
   - Design templates to work well at A4 size (210mm × 297mm)
   - Consider print margins (20mm top/bottom, 25mm left/right)
   - Test both screen and PDF output