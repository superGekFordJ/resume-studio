# Resume Studio - 文档中心

欢迎来到 Resume Studio 的文档中心！这里包含了项目的完整技术文档，帮助开发者理解和扩展这个现代化的简历构建应用。

## 📚 文档导航

### 🏗️ 架构文档

- **[项目架构](./architecture.md)** - 整体架构设计、Schema驱动系统和技术栈
- **[数据结构](./data-structures.md)** - 核心数据模型和AI接口规范
- **[简历渲染管道](./resume-rendering-pipeline.md)** - 从数据到视觉呈现的完整流程

### 🤖 AI 集成

- **[AI 集成指南](./ai-integration-guide.md)** - AI功能实现、统一服务层和最佳实践

### 🧩 组件参考

- **[组件 API 参考](./component-api-reference.md)** - 详细的组件接口和使用方法

### 📋 项目规划

- **[项目蓝图](./blueprint.md)** - 核心功能、设计指南和技术要求
- **[修复总结](./FIXES_SUMMARY.md)** - 架构重构完成状态和历史修复记录

## 🚀 快速开始

### 1. 理解Schema驱动架构

首先阅读 [项目架构文档](./architecture.md) 来了解：

- Schema驱动的设计理念
- SchemaRegistry作为单一数据源
- 纯UI组件渲染模式
- 统一AI服务层架构

### 2. 掌握数据结构

查看 [数据结构文档](./data-structures.md) 来理解：

- 简历数据模型 (`ResumeData`)
- Schema定义和字段类型
- AI 接口规范和类型定义
- 数据验证和转换流程

### 3. 学习组件使用

参考 [组件 API 文档](./component-api-reference.md) 来：

- 了解Schema驱动组件的使用
- 掌握DynamicFieldRenderer的扩展
- 学习最佳实践

### 4. 集成 AI 功能

通过 [AI 集成指南](./ai-integration-guide.md) 来：

- 理解SchemaRegistry AI服务层
- 实现字段级AI改进和自动补全
- 优化性能和错误处理

## 🎯 核心概念

### Schema驱动数据流

```
Schema定义 → SchemaRegistry → UI组件 → 用户交互
     ↓              ↓              ↓
AI服务层 ← 上下文构建 ← 字段渲染 ← 动态扩展
```

### 架构层次

```
Schema Layer (数据结构定义)
    ↓
SchemaRegistry (业务逻辑中心)
    ↓
UI Layer (纯渲染组件)
    ↓
AI Service Layer (统一AI接口)
```

### 组件层次

```
App
├── Header (导航和操作)
├── SidebarNavigator (两阶段侧边栏)
│   ├── Structure View (结构视图)
│   │   ├── TemplateSelector (模板选择)
│   │   └── SectionManager (章节管理, 支持拖拽排序)
│   └── Content View (内容视图)
│       └── SectionEditor (Schema驱动编辑器)
│           └── SectionItemEditor (可拖拽、可折叠的Accordion UI)
│               └── DynamicFieldRenderer (通用字段渲染)
│                   └── AutocompleteTextarea (AI 补全)
├── ResumeCanvas (简历渲染)
│   └── Template Components (模板组件)
└── AIReviewDialog (AI 评审)
```

### AI 功能架构

```
UI组件 → SchemaRegistry → AI Service Layer → Genkit Flow → Gemini API
   ↑                                                            ↓
用户界面 ← 结构化结果 ← 上下文构建 ← 统一接口 ← 处理结果
```

## 🛠️ 开发指南

### 添加新Section类型 (零代码修改)

1. 在SchemaRegistry中定义Schema

```typescript
this.registerSectionSchema({
  id: 'newSection',
  name: 'New Section',
  fields: [...],
  aiContext: {...}
});
```

2. 注册相应的Context Builders
3. UI自动支持新section类型

### 扩展字段类型

1. 在DynamicFieldRenderer中添加新的field.type处理
2. 更新FieldSchema类型定义
3. 添加相应的AI上下文构建逻辑

### 自定义AI行为

1. 在SchemaRegistry中添加新的AI服务方法
2. 定义相应的Context Builders
3. UI组件通过统一接口调用

## 📖 API 参考

### Schema驱动核心

- `SchemaRegistry` - 架构核心，统一数据源
- `SectionSchema` - Section结构定义
- `FieldSchema` - 字段类型定义
- `AIContextPayload` - AI上下文构建参数

### 核心类型

- `ResumeData` - 简历主数据结构
- `DynamicResumeSection` - Schema驱动的Section
- `DynamicSectionItem` - Schema驱动的Item
- `TemplateInfo` - 模板信息

### AI 统一接口

- `schemaRegistry.improveField()` - 字段改进
- `schemaRegistry.getAutocomplete()` - 自动补全
- `schemaRegistry.batchImproveSection()` - 批量改进
- `schemaRegistry.reviewResume()` - 简历评审

### 主要组件

- `ResumeCanvas` - 简历渲染容器
- `SidebarNavigator` - 两阶段侧边栏导航器
- `SectionEditor` - Schema驱动章节编辑器，支持拖拽排序和Accordion UI
- `DynamicFieldRenderer` - 通用字段渲染器
- `AutocompleteTextarea` - AI 补全输入框
- `AIReviewDialog` - AI 评审对话框

## 🔧 配置和部署

### 环境变量

```bash
GOOGLE_AI_API_KEY=your_api_key_here
```

### 构建和部署

```bash
npm run build
npm run start
```

### Firebase 部署

```bash
firebase deploy
```

## 🤝 贡献指南

### 代码规范

- 使用 TypeScript 严格模式
- 遵循Schema-First原则
- 优先扩展SchemaRegistry而非UI组件
- 编写单元测试和集成测试
- 添加适当的文档注释

### Schema扩展规范

- 新功能必须先在Schema中定义
- 保持向后兼容性
- 为AI功能添加相应的Context Builders
- 遵循命名约定

### 提交规范

- 使用语义化提交信息
- 包含相关的测试用例
- 更新相应的文档

## 📞 支持和反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看相关文档
2. 搜索已有的 Issues
3. 创建新的 Issue 或 Discussion
4. 联系维护团队

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**最后更新**: 2025年7月4日
**文档版本**: v2.1.0 - 编辑器UI/UX增强
