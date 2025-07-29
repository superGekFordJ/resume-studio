# AI 改进功能 UI/UX 设计文档 (v3)

本文件详细阐述了 AI 改进功能的用户体验 (UX) 设计和界面 (UI) 实现，涵盖了**单字段改进**和**章节批量改进**两种核心场景。

## 设计哲学

新版 AI 功能的 UI/UX 设计遵循三大原则：

1.  **最小化干扰 (Minimally Invasive)**: 用户的核心任务是编辑简历，AI 功能应作为辅助，而非干扰。交互应尽可能保持在当前上下文中。
2.  **清晰的可审查性 (Clear Auditability)**: 用户必须能够清晰地看到 AI 提出的每一处修改。黑盒操作会降低用户的信任感。
3.  **用户控制力 (User in Control)**: 最终决定权必须在用户手中。用户应能轻松地接受、拒绝或选择性地应用 AI 的建议。

## 核心交互模式

### 1. 单字段改进: 内联建议卡片 (`AISuggestionCard`)

为取代之前中断工作流的模态对话框，我们为单字段改进设计了**内联建议卡片**。

- **触发**: 用户在 `AIFieldWrapper` 组件中输入提示词并点击 "Improve"。
- **行为**:
  - 页面**不会**发生跳转或弹出模态框。
  - `resumeStore` 中的 `singleFieldImprovementReview` 状态被填充。
  - 一个 `AISuggestionCard` 组件会平滑地滑入到被编辑字段的正下方。
- **UI 设计**:
  - **紧凑布局**: 卡片设计紧凑，不占用过多屏幕空间。
  - **统一差异视图**: 使用 `react-diff-viewer-continued` 的**统一视图** (`splitView={false}`)，清晰地展示原文与建议文的差异，删除和增加部分有不同颜色高亮。
  - **上下文提示**: 卡片会显示用户输入的 `prompt`，提醒用户这次改进的目标。
  - **明确的操作**: 提供清晰的 "Apply" 和 "Dismiss" 按钮。

### 2. 章节批量改进: 可折叠评审对话框 (`BatchImprovementDialog`)

批量改进是一个更重的操作，需要一个专门的审查环境。我们优化了原有的对话框，使其更强大、更易用。

- **触发**: 用户在 `SectionEditor` 顶部的批量改进区域输入提示词并点击按钮。
- **行为**:
  - 弹出一个最大宽度、占据视窗高度90%的模态对话框。
  - `resumeStore` 中的 `batchImprovementReview` 状态被填充。
- **UI 设计**:
  - **手风琴布局 (`Accordion`)**:
    - 每个被修改的条目都包裹在一个可折叠的 `<AccordionItem>` 中。
    - 默认只展开前 3 个有修改的条目，避免信息过载。
  - **带复选框的触发器**:
    - 每个条目的触发器 (`AccordionTrigger`) 左侧包含一个 `Checkbox`，允许用户勾选/取消勾选该项改进。
    - 触发器标题会智能地显示条目的核心信息（如 "前端工程师 at Google"），方便用户快速定位。
  - **动态计数**: 对话框的页脚和标题部分会动态显示已选择待应用的改进数量 (e.g., `Accept Improvements (2)`)。
  - **健壮的滚动**: 对话框内容区 (`ScrollArea`) 确保在条目过多时能够流畅地垂直滚动，同时解决了横向内容溢出的问题。

### 3. AI 自动补全: 悬浮卡片与模型选择器 (`AutocompleteTextarea`, `AutocompleteModelSelector`)

为了增强自动补全的灵活性和用户控制，我们为 `AutocompleteTextarea` 集成了悬浮卡片和可选的模型选择功能。

- **触发**: 用户在支持 AI 自动补全的文本区域 (`AutocompleteTextarea`) 输入时，AI 会在后台生成建议。
- **行为**:
  - **内联幽灵文本**: 实时展示 AI 的自动补全建议作为幽灵文本。
  - **悬浮卡片**: 当用户与幽灵文本交互（如悬停）或在特定条件下，一个轻量级的悬浮卡片会出现在文本区域附近。
    - **信息展示**: 卡片可以显示当前 AI 模型的名称、建议的来源或提供快速操作。
    - **模型切换**: 悬浮卡片内部或附近会提供一个模型选择器 (`AutocompleteModelSelector`)，允许用户在不同的 AI 自动补全模型之间切换（例如，"智能模式"、"精简模式"）。
- **UI 设计**:
  - **非侵入式**: 悬浮卡片设计旨在不中断用户输入流程，仅在需要时出现。
  - **上下文相关**: 根据当前编辑字段和 AI 建议的类型，提供相关信息和操作。
  - **清晰的模型标识**: 模型选择器清晰显示当前选定的模型，并提供易于理解的选项。
  - **快捷键支持**: 继续支持 Tab 键接受建议，Esc 键取消建议。

## 组件实现

### `AISuggestionCard.tsx`

- **位置**: `src/components/resume/ui/AISuggestionCard.tsx`
- **职责**: 纯展示组件，接收 `originalValue`, `suggestedValue`, `isLoading` 等 props，并渲染内联建议。
- **交互**: 通过 `onAccept` 和 `onReject` 回调函数与 `resumeStore` 通信。

### `BatchImprovementDialog.tsx`

- **位置**: `src/components/resume/ui/BatchImprovementDialog.tsx`
- **职责**: 提供一个完整的、自包含的批量审查体验。
- **状态管理**:
  - **全局状态**: 从 `resumeStore` 订阅 `batchImprovementReview` 来获取原始数据和 AI 返回数据。
  - **本地状态**: 内部使用 `React.useState` 管理一个 `stagedItems` 数组，追踪用户通过复选框选择的待应用项目。
- **关键修复**:
  - **HTML 嵌套错误**: 通过直接使用 Radix UI 的 `AccordionPrimitive`，重构了 `AccordionTrigger` 的 DOM 结构，将 `Checkbox` 与其作为兄弟节点而非子节点，解决了 `<button>` 不能嵌套 `<button>` 的 hydration 错误。
  - **CSS 溢出**: 通过为 `DiffViewer` 的内容应用 `white-space: pre-wrap` 和 `word-break: break-word` 样式，彻底解决了长单词或链接导致的水平溢出问题。

### `AutocompleteModelSelector.tsx`

- **位置**: `src/components/resume/editor/AutocompleteModelSelector.tsx`
- **职责**: 允许用户选择用于自动补全的 AI 模型，并通常与 `resumeStore` 中的 `aiConfig` 相关联。
- **交互**: 通过调用 `resumeStore` 的 `updateAIConfig` 等 action 来更新选定的模型。

---

_最后更新: 2025-07-02_
_文档版本: v1.0.0_
_相关组件: `AISuggestionCard`, `BatchImprovementDialog`, `AIFieldWrapper`_
