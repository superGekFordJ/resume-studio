# A4 Resume Studio - 项目架构文档

## 项目概述

A4 Resume Studio 是一个基于 Next.js 的现代化简历构建应用，集成了 AI 功能来提供智能的简历编辑和优化体验。它采用 **Schema 驱动** 的架构，确保了数据的一致性、可扩展性和可维护性。

## 技术栈

- **前端框架**: Next.js 15.3.3 (React 18.3.1)
- **UI 组件库**: Radix UI + Tailwind CSS
- **AI 集成**: Google Genkit + Gemini API
- **状态管理**: React Hooks (useState, useEffect)
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
│   └── resume/           # 简历相关组件
│       ├── AIReviewDialog.tsx        # AI 评审对话框
│       ├── AutocompleteTextarea.tsx  # 自动补全文本框
│       ├── ResumeCanvas.tsx          # 简历画布
│       ├── SectionEditor.tsx         # 章节编辑器
│       ├── SectionManager.tsx        # 章节管理器
│       ├── TemplateSelector.tsx      # 模板选择器
│       ├── ModernTemplate.tsx        # 现代模板组件
│       ├── AvatarUploader.tsx        # 头像上传组件 (新增)
│       └── DynamicFieldRenderer.tsx  # 动态字段渲染器 (新增)
├── hooks/                # 自定义 Hooks
│   └── use-toast.ts      # Toast 通知
├── lib/                  # 工具函数
│   ├── utils.ts          # 通用工具
│   ├── schemaRegistry.ts # Schema 注册中心 (新增)
│   └── pdfExport.ts      # PDF 导出工具 (新增)
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

### 2. 数据流架构

```
                               +---------------------+
                               |   SchemaRegistry    |  <-- Single Source of Truth
                               | (Defines Everything)|
                               +----------+----------+
                                          |
                 +------------------------+------------------------+
                 |                                                 |
+----------------v----------------+           +--------------------v-------------------+
|      UI Components              |           |        AI Services (Flows)           |
| (e.g., SectionEditor)           |           | (e.g., improve, autocomplete)      |
| - Render based on Schema        |           | - Receive structured context         |
| - Dispatch user events          |           | - Perform AI tasks                   |
+----------------+----------------+           +--------------------+-------------------+
                 |                                                 |
                 | 1. User action (e.g., type in textarea)         |
                 |                                                 | 4. AI returns result
                 | 2. Component asks SchemaRegistry to build context |
                 |                                                 |
                 | 3. Component calls AI Service with context      |
                 |                                                 |
                 +------------------------------------------------->
```

- **用户输入 → Schema 查询 → AI 处理 → UI 更新**
  1. 用户在 UI 组件中进行操作（例如，在 `AutocompleteTextarea` 中输入文本）。
  2. UI 组件不自己构建上下文，而是调用 `schemaRegistry.buildAIContext(payload)`，并提供任务类型 (`improve` 或 `autocomplete`) 和相关 ID（`sectionId`, `fieldId`, `itemId`）。
  3. `SchemaRegistry` 根据相关的 `SectionSchema` 和 `FieldSchema` 定义，调用对应的 `ContextBuilderFunction` 来构建一个结构化的 `StructuredAIContext` 对象。
  4. UI 组件将此结构化上下文和用户输入一起传递给相应的 AI Flow。
  5. AI Flow 返回结果，UI 组件更新状态以向用户显示结果。

### 3. AI 集成架构
- **统一的上下文构建**: 所有 AI 功能的上下文都由 `schemaRegistry.buildAIContext` 方法统一构建，确保了数据的一致性和可预测性。
- **结构化输入**: AI Flow 的输入（`inputSchema`）接收的是结构化的 `context` 对象，而不是非结构化的字符串 "context blob"，这使得 Prompt Engineering 更加稳定和可控。
- **Flow-based**: 使用 Genkit 的 Flow 模式，将每个 AI 功能封装为独立、可复用的单元。
- **Server Actions**: 所有 AI 调用都在服务端执行，保证了安全性和性能。

## 关键设计决策

### 1. 依赖倒置 (Dependency Inversion)
- **旧架构**: UI 组件**告诉** `SchemaRegistry` 要构建什么。
- **新架构**: UI 组件**询问** `SchemaRegistry` 它应该如何处理数据和构建上下文。这种依赖倒置是本次重构的核心，它极大地降低了耦合度，提升了系统的可维护性和扩展性。

### 2. 状态管理
- 使用 React 内置的 `useState` 和 `useEffect` 进行状态管理。
- `ResumeData` 对象作为包含所有简历信息的单一状态树。
- 严格的自上而下的单向数据流。

### 3. 扩展性
- **添加新章节**: 只需在 `schemaRegistry.ts` 中定义一个新的 `SectionSchema` 并注册对应的 `ContextBuilderFunction`，UI 无需任何修改即可支持新章节的编辑和 AI 功能。
- **添加新AI功能**: 只需创建一个新的 AI Flow，并在 `FieldSchema.aiHints.contextBuilders` 中为新功能添加一个 `contextBuilder` ID。

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

## 扩展性考虑

### 1. 新模板添加
1. 创建新的模板组件
2. 更新 `templates` 配置
3. 在 `ResumeCanvas` 中注册

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