# A4 Resume Studio - 项目架构文档

## 项目概述

A4 Resume Studio 是一个基于 Next.js 的现代化简历构建应用，集成了 AI 功能来提供智能的简历编辑和优化体验。

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

### 1. 组件化架构
- **原子组件**: 基础 UI 组件 (`src/components/ui/`)
- **分子组件**: 业务逻辑组件 (`src/components/resume/`)
- **有机体组件**: 页面级组件 (`src/app/page.tsx`)

### 2. 数据流架构
```
用户输入 → 状态更新 → 组件重渲染 → UI 更新
     ↓
AI 处理 → 数据转换 → 状态更新 → 组件重渲染
```

### 3. AI 集成架构
- **Flow-based**: 使用 Genkit 的 Flow 模式
- **Server Actions**: AI 处理在服务端执行
- **Type-safe**: 完整的 TypeScript 类型支持，支持动态 Schema 验证和上下文构建。

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

## 关键设计决策

### 1. 状态管理
- 使用 React 内置的 `useState` 而非外部状态管理库
- 单一数据源: `ResumeData` 对象包含所有简历信息，支持传统和扩展格式。
- 自上而下的数据流
- **简化的面板状态**: 移除了复杂的多面板状态管理，采用单一编辑目标状态

### 2. AI 集成
- 服务端处理: 所有 AI 调用都在服务端执行
- 流式处理: 支持实时的 AI 响应
- 错误处理: 完善的错误处理和用户反馈
- **动态上下文构建**: 利用 `SchemaRegistry` 动态构建 AI 上下文，实现"零代码适配"新章节。

### 3. 性能优化
- 组件懒加载: 按需加载模板组件
- 防抖处理: 自动补全功能使用防抖
- 内存优化: 及时清理不必要的状态

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
- **输入验证**: Zod schema 验证所有输入
- **错误处理**: 不暴露敏感信息的错误处理
- **CORS**: 适当的跨域资源共享配置 