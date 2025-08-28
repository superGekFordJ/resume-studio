# Resume Studio - 项目架构文档

## 项目概述

Resume Studio 是一个基于 Next.js 的现代化简历构建应用，集成了 AI 功能来提供智能的简历编辑和优化体验。它采用 **Schema 驱动** 的架构，确保了数据的一致性、可扩展性和可维护性。

## 技术栈

- **前端框架**: Next.js 15.3.3 (React 18.3.1)
- **UI 组件库**: Radix UI + Tailwind CSS
- **浮层定位**: Floating UI (@floating-ui/react)
- **AI 集成**: Google Genkit, `copilot-react-kit`(a fork of `copilot-react-textarea` without cloud service hard-binding)
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
│   │   └── batch-improve-section.ts   # 批量改进
│   ├── genkit.ts          # Genkit 配置
│   └── dev.ts             # 开发环境配置
├── app/                   # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件 (shadcn/ui)
│   ├── ai/               # (新增;alpha阶段组件，没有实际调用) AI 相关组件
│   │   └── completions/  # AI 补全功能组件
│   │       ├── AICompletionsTextarea.tsx # AI 补全文本框
│   │       └── types.ts  # AI 补全类型定义
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx           # 应用头部
│   │   ├── Logo.tsx             # (新增) 应用Logo组件
│   │   ├── SettingsPanel.tsx    # 设置面板
│   │   ├── SidebarNavigator.tsx # 两阶段侧边栏导航器
│   │   └── upload/              # 上传相关组件
│   │       └── ImageUploadArea.tsx # 图片上传区域
│   └── resume/           # 简历相关组件 (重组后)
│       ├── canvas/             # 画布相关组件
│       │   ├── ResumeCanvas.tsx      # 简历画布
│       │   └── PrintableResume.tsx   # 可打印简历组件
│       ├── editor/             # 编辑器相关组件
│       │   ├── SectionEditor.tsx     # 章节编辑器
│       │   ├── PersonalDetailsEditor.tsx # 个人信息编辑器
│       │   ├── SectionItemEditor.tsx # 章节项目编辑器
│       │   ├── AIFieldWrapper.tsx    # AI字段包装器 (重构)
│       │   ├── SectionManager.tsx    # 章节管理器
│       │   └── DynamicFieldRenderer.tsx # 动态字段渲染器
│       ├── rendering/          # 原子渲染组件
│       │   ├── pro-classic/      # ProClassic 模板专用组件
│       │   ├── sapphire/ # SapphireSidebar 模板专用组件
│       │   ├── veridian/ # VeridianSidebar 模板专用组件
│       │   ├── AdvancedSkillsComponent.tsx # 高级技能组件
│       │   ├── BadgeListComponent.tsx   # 徽章列表组件
│       │   ├── CertificationItemComponent.tsx # 认证项目组件
│       │   ├── ProjectItemComponent.tsx # 项目项目组件
│       │   ├── SimpleListComponent.tsx  # 简单列表组件
│       │   ├── TitledBlockComponent.tsx # 标题块组件
│       │   └── SingleTextComponent.tsx  # 单文本组件
│       ├── templates/          # 模板组件
│       │   ├── DefaultTemplate.tsx   # 默认模板
│       │   ├── ModernTemplate.tsx    # 现代模板组件
│       │   ├── CreativeTemplate.tsx  # 创意模板
│       │   ├── ContinuousNarrativeTemplate.tsx # 连续叙述模板
│       │   ├── ParallelModularTemplate.tsx # 并行模块模板
│       │   └── ProClassicTemplate.tsx # 专业经典模板
│       │   └── SapphireSidebarTemplate.tsx # 蓝宝石模板
│       │   └── VeridianSidebarTemplate.tsx # 维尔德尼模板
│       └── ui/                # UI 相关组件
│           ├── AIReviewDialog.tsx    # AI 评审对话框
│           ├── AISuggestionCard.tsx  # (新增) AI 建议卡片 - 单字段改进
│           ├── BatchImprovementDialog.tsx # (重构) 批量改进对话框 - 手风琴布局
│           ├── AutocompleteTextarea.tsx # 自动补全文本框
│           ├── AvatarUploader.tsx    # 头像上传组件
│           └── TemplateSelector.tsx  # 模板选择器
├── hooks/                # 自定义 Hooks
│   ├── use-toast.ts      # Toast 通知
│   └── useHydratedStore.ts # Zustand hydration hook
├── stores/               # Zustand stores
│   └── resumeStore.ts    # 中央状态存储
│   └── types.ts          # 类型定义
│   └── actions/          # 动作定义
│       ├── dataActions.ts # 数据动作定义
│       └── aiActions.ts   # AI动作定义
│       └── uiActions.ts   # UI动作定义
│       └── snapshotActions.ts # 快照动作定义
├── lib/                  # 工具函数
│   ├── utils.ts          # 通用工具
│   ├── schemaRegistry.ts # Schema 注册中心
│   ├── dataTransformer.ts # 数据转换器
│   ├── pdfExport.ts      # PDF 导出工具
│   ├── schemas/          # Schema 定义与静态数据
│   │   ├── staticRoleMaps.ts  # (新增) 静态角色映射定义
│   │   └── defaultSchemas.ts    # (重构自schemaRegistry) 提供默认的简历Schema
│   │   └── defaultContextBuilders.ts # (重构自schemaRegistry) 默认上下文构建器定义
│   └── roleMapUtils.ts   # (新增) 角色映射工具函数
└── types/                # TypeScript 类型定义
    ├── resume.ts         # 简历相关类型
    └── schema.ts         # Schema 定义
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

为了确保用户体验的流畅性，应用程序针对不同类型的 AI 交互采用了两种不同的数据流模式：

1.  **冷路径 (Cold Path - 标准流程)**: 用于用户点击触发、对延迟不敏感的操作（如"AI改进"）。此路径遵循 `组件 -> Store -> AI -> Store -> 组件` 的完整单向数据流，保证了逻辑的集中和可维护性。

2.  **热路径 (Hot Path - 优化流程)**: 专为 `autocomplete` 等需要即时响应的功能设计。此路径允许组件在从 `SchemaRegistry` 获取上下文后，直接调用 AI 服务（`组件 -> SchemaRegistry -> AI -> 组件`），绕过了 Store 的派发周期，从而将延迟降至最低。

下面的图表和说明详细描述了这两种路径：

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
                 | **Cold Path (e.g., Improve Section):**
                 | 1. User clicks "Improve" button.
                 | 2. Component dispatches `improveSection` action to Store.
                 | 3. Store calls `SchemaRegistry` to build context.
                 | 4. Store calls AI Service with context.
                 | 5. AI returns result to Store, which updates state.
                 |
                 | **Hot Path (e.g., Autocomplete):**
                 | 1. User types in textarea.
                 | 2. (`onDebounce`) Component asks `SchemaRegistry` to build context.
                 | 3. Component *directly* calls AI Service with context.
                 | 4. AI returns result directly to component for display.
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
     (View Model with defaultRenderType & Role-Map)
                           |
                           v
                   ResumeCanvas
                 (Screen & PDF Rendering)
                           |
                           v
                 Template Components
            (Layout & Role-Map Dispatchers)
                           |
                           v
              Atomic Rendering Components
           (Consume data via pickFieldByRole)
```

**重要更新 (2025-06-20)**: PDF 导出现已通过 `react-to-print` 库直接使用 `ResumeCanvas` 组件，确保了真正
的 WYSIWYG（所见即所得）体验。不再需要单独的 PDF 渲染路径。

**重要更新 (2025-06-28)**: 为了实现彻底的渲染解耦，我们引入了 **字段角色映射 (Field Role-Map)** 机制。

- **问题**: 在旧架构中，原子渲染组件（如 `TitledBlockComponent`）需要硬编码查找可能的字段名（例如 `jobTitle`, `degree`, `name` 都可能被视为"标题"），这使得组件难以复用和维护。
- **解决方案**:
  1. **静态角色定义 (`staticRoleMaps.ts`)**: 我们创建了一个静态文件，为每个 `SectionSchema` 定义其字段 (`field.key`) 到一个通用角色 (`FieldRole`, 如 `'title'`, `'organization'`) 的映射。这是新的"单一事实来源"。
  2. **`SchemaRegistry` 作为提供者**: `SchemaRegistry` 在启动时加载这些静态映射，并提供一个同步方法 `getRoleMap(schemaId)`。
  3. **模板作为传递者**: 模板组件从 `SchemaRegistry` 获取对应章节的 `roleMap`，并将其作为 `prop` 传递给原子渲染组件。
  4. **`pickFieldByRole` 作为消费者**: 原子渲染组件**必须**使用 `pickFieldByRole(item, 'title', roleMap)` 这样的工具函数来按"角色"获取数据，而不是按硬编码的字段名查找。

这个机制使得原子组件完全与具体的字段名解耦，极大地提升了系统的可复用性和可维护性。

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
   - Store Action 调用 `schemaRegistry.buildAIContext(payload)` 构建上下文，**传递 aiConfig**
   - Store Action 调用 AI Flow 并处理结果
   - Store 更新状态（如 `aiImprovement`）
   - UI 组件自动响应状态变化并更新视图

**Global Context Integration**:

- 所有 AI 操作现在都接收增强的上下文，包括：
  - `targetJobInfo`: 用户的目标职位（从设置面板或个人详情）
  - `userBio`: 用户的专业背景描述
  - 这些全局上下文字段通过 `aiConfig` 传递到 `SchemaRegistry.buildAIContext()`

2. **组件分解与职责明确**
   - `SectionEditor`: 纯展示组件，协调子组件的渲染
   - `PersonalDetailsEditor`: 处理个人信息编辑
   - `SectionItemEditor`: 处理章节项目编辑
   - `AIFieldWrapper`: 封装所有 AI 改进 UI 交互
   - `AutocompleteTextarea`: 处理自动补全交互。它直接调用 AI flow 来获取内联建议，并通过 props 接收来自 store 的"强制建议"（AI 改进建议）。

**UI/UX 增强 (Updated 2025-07-04)**:

- **`SectionManager`**: 章节管理功能已增强，通过 `dnd-kit` 支持**拖拽排序**，取代了原有的上下箭头按钮，提升了操作的流畅性。
- **`SectionItemEditor`**: 章节内的项目现已重构为**可拖拽的、可折叠的手风琴式 (`Accordion`) 项目**。为了提高可用性，手风琴的标题会动态显示该项目第一个字段的内容。

### 5. AI 集成架构

- **统一的上下文构建**: 所有 AI 功能的上下文都由 `schemaRegistry.buildAIContext` 方法统一构建，确保了数据的一致性和可预测性。
- **结构化输入**: AI Flow 的输入（`inputSchema`）接收的是结构化的 `context` 对象，而不是非结构化的字符串 "context blob"，这使得 Prompt Engineering 更加稳定和可控。
- **Flow-based**: 使用 Genkit 的 Flow 模式，将每个 AI 功能封装为独立、可复用的单元。
- **Server Actions**: 所有 AI 调用都在服务端执行，保证了安全性和性能。
- **可靠的动态内容生成 (V2)**: 为了解决 AI 服务商对动态嵌套对象（dynamic nested objects）的 schema 验证限制，我们采用了 **"JSON 字符串包装器" (`JSON String Wrapper`)** 模式。AI Flow 会指示模型返回一个包含 JSON 字符串的简单对象，然后在 Flow 内部进行解析和验证。这确保了即使是复杂的、动态的简历结构也能可靠生成。

> **[核心文档]** 关于 AI 集成、数据流和核心模式的详细说明，请参阅新的 AI 文档中心：[`docs/ai/`](./ai/)。

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

  // AI 改进系统 v3 - 基于卡片/对话框的审查流程
  batchImprovementReview: BatchImprovementReview | null;
  singleFieldImprovementReview: SingleFieldImprovementReview | null;

  aiPrompt: string; // 通用AI提示词
  aiConfig: AIConfig;

  // AI 操作Loading状态 (Updated 2025-07-25)
  isExtractingJobInfo: boolean; // 图片职位信息提取
  isGeneratingSnapshot: boolean; // 简历快照生成
  isGeneratingCoverLetter: boolean; // 求职信生成

  // 版本快照管理
  versionSnapshots: VersionSnapshot[];

  // 已移除: 旧的强制建议流程 (v2)
  // SingleFieldImproveDialog.tsx 已删除
  // 相关 store 状态已清理
}

interface BatchImprovementReview {
  sectionId: string;
  isLoading: boolean;
  improvedItems: Array<{
    id: string;
    originalData: any;
    improvedData: any;
    isSelected: boolean; // 用户是否选中此项改进
  }>;
  summary: string;
}

interface SingleFieldImprovementReview {
  sectionId: string;
  itemId?: string;
  fieldId: string;
  isPersonalDetails: boolean;
  isLoading: boolean;
  originalValue: string;
  improvedValue: string;
  fieldContext: {
    label: string;
    placeholder?: string;
  };
}

interface ResumeActions {
  // 现有操作
  setResumeData: (data: ResumeData) => void;
  updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
  setSelectedTemplateId: (templateId: string) => void;
  setEditingTarget: (target: string | null) => void;

  // 数据操作
  updateField: (payload: {
    sectionId: string;
    itemId?: string;
    fieldId: string;
    value: any;
    isPersonalDetails?: boolean;
  }) => void;
  updateSectionTitle: (payload: {
    sectionId: string;
    newTitle: string;
  }) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (payload: { sectionId: string; itemId: string }) => void;
  reorderSectionItems: (payload: {
    sectionId: string;
    fromIndex: number;
    toIndex: number;
  }) => void;
  reorderSections: (payload: { fromIndex: number; toIndex: number }) => void;

  // AI 改进操作 v3
  setAIPrompt: (prompt: string) => void;

  // 批量改进流程
  startBatchImprovement: (sectionId: string, prompt: string) => Promise<void>;
  acceptBatchImprovement: (
    itemsToAccept: Array<{ id: string; data: any }>
  ) => void;
  rejectBatchImprovement: () => void;

  // 单字段改进流程
  startSingleFieldImprovement: (payload: {
    sectionId: string;
    itemId?: string;
    fieldId: string;
    currentValue: string;
    prompt: string;
    isPersonalDetails?: boolean;
  }) => Promise<void>;
  acceptSingleFieldImprovement: () => void;
  rejectSingleFieldImprovement: () => void;
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

- **添加新章节**: 只需在 `defaultSchemas.ts` 中定义一个新的 `SectionSchema` 并注册对应的 `ContextBuilderFunction`，UI 无需任何修改即可支持新章节的编辑和 AI 功能。
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

本项目已实现完整的国际化（i18n）支持，允许轻松添加新语言。

- **核心库**: 使用 `react-i18next` 和 `i18next` 进行翻译管理。
- **SSR 兼容**: 通过在 `i18n.ts` 中预加载翻译资源，确保在服务端渲染(SSR)和客户端渲染(CSR)之间的一致性。
- **模块化翻译文件**: 翻译内容按命名空间（`common`, `components`, `schemas`）组织，便于维护。

关于如何添加新语言或修改现有翻译的详细说明，请参阅：
**[-> 国际化（i18n）文档](./i18n.md)**

## 安全考虑

- **API 密钥**: 服务端环境变量管理
- **输入验证**: Zod schema 验证所有 AI Flow 的输入
- **错误处理**: 不暴露敏感信息的错误处理
- **CORS**: 适当的跨域资源共享配置

## 错误处理和加载状态 (Updated 2025-08-07)
- Review 使用对话框骨架屏（AIReviewDialog）承载加载状态；AI 中枢入口处的按钮在“忙碌”状态可选择性展示轻量“呼吸式”辉光动效（遵从 reduced-motion 首选项）。动效参数与降级策略详见 docs/ui/header-ai-hub.md。

应用程序采用了一套统一的机制来处理异步操作（尤其是AI交互）的加载状态和潜在错误，以确保流畅和可预测的用户体验。

- **集中式状态管理**: 所有异步操作的加载状态（如 `isExtractingJobInfo`, `isGeneratingSnapshot`）都在 `resumeStore` 中进行管理。这使得UI组件可以轻松订阅这些状态并显示加载指示器（如spinners）或禁用相关控件。

- **统一的错误反馈**: 我们创建了一个中心化的工具函数 `mapErrorToToast` (`src/lib/utils.ts`)，它将来自后端的各种技术性错误（如HTTP状态码或Genkit错误代码）转换为对用户友好的、可操作的Toast通知。

- **可靠的工作流程**: 在 `aiActions.ts` 中，每个异步Action都遵循 `try...catch...finally` 模式。`try` 块执行核心逻辑，`catch` 块使用 `mapErrorToToast` 来报告错误，而 `finally` 块确保加载状态在操作结束后（无论成功或失败）都被重置为 `false`，从而避免了UI卡在加载状态。

## AI Services

- **Purpose**: Provide intelligent assistance for resume writing
- **Key Features**: Auto-completion, section improvement, resume review
- **Implementation**: Server-side AI flows using Genkit with memoized AIManager

### AI Context Building with Caching (Updated 2025-07-20)

The application now features a sophisticated, two-layer caching system to optimize AI context building, dramatically improving performance during text editing.

This system uses a combination of coarse-grained caching for the overall context and fine-grained, builder-level caching for its constituent parts. It also enhances the context by using a placeholder for the field currently being edited, providing clearer instructions to the LLM.

For a detailed explanation of the caching strategy, placeholder logic, and how to enable debug logs, please refer to the dedicated documentation:
**[-> AI Context Building: A Deep Dive (V3)](./ai/ai-context-building.md)**

### AI Provider Architecture (Updated 2025-06-23)

The application now features a sophisticated AI provider system:

1. **AIManager Singleton**
   - Manages Genkit instance lifecycle with memoization
   - Only recreates instances when AI configuration changes
   - Significantly improves performance by preventing wasteful recreations
   - Located at `src/ai/AIManager.ts`

2. **Global AI Context**
   - Users can now provide target job information and professional bio via Settings
   - This context is automatically injected into all AI operations
   - Enhances personalization and relevance of AI suggestions

3. **API Key Priority System**
   - UI-provided keys (highest priority)
   - Environment variables in development (fallback)
   - Default authentication (lowest priority)

4. **Provider Support**
   - Google AI (Gemini) - fully implemented
   - Ollama (local) - prepared for integration
   - Anthropic (Claude) - prepared for integration

## Template System (Updated 2025-06-19)
> 导航提示：与模板无直接耦合的 Header/AI 入口交互规范详见 docs/ui/header-ai-hub.md；模板渲染保持解耦，避免在模板内部实现全局入口或交互逻辑。

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
   const sidebarSections = [
     'skills',
     'advanced-skills',
     'languages',
     'certifications',
   ];

   const mainColumnSections = sections.filter(
     (s) => !sidebarSections.includes(s.schemaId)
   );
   const sideColumnSections = sections.filter((s) =>
     sidebarSections.includes(s.schemaId)
   );
   ```

### How to Develop a New Template

1. **Create Template Component**
   - Create a new file in `src/components/resume/templates/`
   - Accept a single prop: `{ resume: RenderableResume }`
   - Implement layout-specific logic, such as defining main and side columns.

2. **Implement Rendering Dispatcher**
   The core of a template is its `renderSectionByRenderType` function. This function is responsible for retrieving the correct `RoleMap` and dispatching to the appropriate atomic rendering component.

   ```typescript
   const renderSectionByRenderType = (section: RenderableSection) => {
     const schemaRegistry = SchemaRegistry.getInstance();

     // 1. Get the RoleMap for the current section
     const roleMap = schemaRegistry.getRoleMap(section.schemaId);

     // 2. Define template-specific rendering overrides (optional)
     const templateLayoutMap: Record<string, string> = {
       'skills': 'simple-list', // Override skills section to use a simple list
     };

     // 3. Determine the final render type
     const finalRenderType = templateLayoutMap[section.schemaId] || section.defaultRenderType;

     // 4. Dispatch to atomic components, passing the section and roleMap
     switch (finalRenderType) {
       case 'simple-list':
         return <SimpleListComponent section={section} roleMap={roleMap} />;
       case 'timeline':
         return section.items.map(item => <TitledBlockComponent key={item.id} item={item} roleMap={roleMap} />);
       // ... other cases
     }
   };
   ```

3. **Register Template**
   - Add to `templates` array in `src/types/resume.ts`
   - Add case in `PrintableResume.tsx` switch statement to render the new template component.

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
