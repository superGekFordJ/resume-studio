# A4 Resume Studio - 文档中心

欢迎来到 A4 Resume Studio 的文档中心！这里包含了项目的完整技术文档，帮助开发者理解和扩展这个现代化的简历构建应用。

## 📚 文档导航

### 🏗️ 架构文档
- **[项目架构](./architecture.md)** - 整体架构设计、技术栈和设计决策
- **[数据结构](./data-structures.md)** - 核心数据模型和AI接口规范
- **[简历渲染管道](./resume-rendering-pipeline.md)** - 从数据到视觉呈现的完整流程

### 🤖 AI 集成
- **[AI 集成指南](./ai-integration-guide.md)** - AI功能实现、接口和最佳实践

### 🧩 组件参考
- **[组件 API 参考](./component-api-reference.md)** - 详细的组件接口和使用方法

### 📋 项目规划
- **[项目蓝图](./blueprint.md)** - 核心功能、设计指南和技术要求

## 🚀 快速开始

### 1. 理解项目架构
首先阅读 [项目架构文档](./architecture.md) 来了解：
- 整体技术栈和框架选择
- 组件化架构设计
- 数据流和状态管理
- AI 集成模式

### 2. 掌握数据结构
查看 [数据结构文档](./data-structures.md) 来理解：
- 简历数据模型 (`ResumeData`)
- AI 接口规范和类型定义
- 数据验证和转换流程

### 3. 学习组件使用
参考 [组件 API 文档](./component-api-reference.md) 来：
- 了解各组件的 Props 和用法
- 掌握事件处理模式
- 学习最佳实践

### 4. 集成 AI 功能
通过 [AI 集成指南](./ai-integration-guide.md) 来：
- 配置 Genkit 和 Gemini API
- 实现自动补全、内容改进和简历评审
- 优化性能和错误处理

## 🎯 核心概念

### 简历数据流
```
用户输入 → ResumeData → 模板渲染 → A4 页面 → PDF 导出
     ↓
AI 处理 → 内容优化 → 数据更新 → 实时预览
```

### 组件层次
```
App
├── Header (导航和操作)
├── SidebarNavigator (两阶段侧边栏) ← 新增
│   ├── Structure View (结构视图)
│   │   ├── TemplateSelector (模板选择)
│   │   └── SectionManager (章节管理)
│   └── Content View (内容视图)
│       └── SectionEditor (内容编辑)
│           └── AutocompleteTextarea (AI 补全)
├── ResumeCanvas (简历渲染)
│   └── Template Components (模板组件)
└── AIReviewDialog (AI 评审)
```

### AI 功能架构
```
UI 组件 → Genkit Flow → Gemini API → 处理结果 → UI 更新
```

## 🛠️ 开发指南

### 添加新模板
1. 创建模板组件 (`src/components/resume/YourTemplate.tsx`)
2. 更新模板配置 (`src/types/resume.ts`)
3. 在 `ResumeCanvas` 中注册模板

### 扩展 AI 功能
1. 定义新的 Flow (`src/ai/flows/your-flow.ts`)
2. 创建对应的 UI 组件
3. 集成到主应用中

### 自定义样式
1. 使用 Tailwind CSS 工具类
2. 遵循 BEM 命名约定
3. 确保响应式和打印兼容性

## 📖 API 参考

### 核心类型
- `ResumeData` - 简历主数据结构
- `ResumeSection` - 简历章节
- `SectionItem` - 章节内容项
- `TemplateInfo` - 模板信息

### AI 接口
- `autocompleteInput()` - 自动补全
- `improveResumeSection()` - 内容改进
- `reviewResume()` - 简历评审

### 主要组件
- `ResumeCanvas` - 简历渲染容器
- `SidebarNavigator` - 两阶段侧边栏导航器 (新增)
- `SectionEditor` - 章节编辑器
- `AutocompleteTextarea` - AI 补全输入框
- `AIReviewDialog` - AI 评审对话框

## 🔧 配置和部署

### 环境变量
```bash
GOOGLE_AI_API_KEY=your_api_key_here
AI_MODEL=googleai/gemini-2.0-flash-lite
AI_MAX_TOKENS=1000
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
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试和集成测试
- 添加适当的文档注释

### 提交规范
- 使用语义化提交信息
- 包含相关的测试用例
- 更新相应的文档

### 问题报告
- 使用 GitHub Issues
- 提供详细的重现步骤
- 包含环境信息和错误日志

## 📞 支持和反馈

如果您在使用过程中遇到问题或有改进建议，请：

1. 查看相关文档
2. 搜索已有的 Issues
3. 创建新的 Issue 或 Discussion
4. 联系维护团队

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**最后更新**: 2025年6月
**文档版本**: v1.1.0 - 两阶段侧边栏重构完成 