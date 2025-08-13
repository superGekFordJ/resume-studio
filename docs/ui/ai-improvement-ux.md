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

## 高级功能演进：字段级批量审查

为了进一步增强用户控制力，我们对 `BatchImprovementDialog` 进行了功能升级，允许用户对单个条目（Item）内的每个字段（Field）进行独立的接受或拒绝操作。

### 1. 实现思路

该功能的实现严格遵循了项目既有的架构模式，即“全局状态驱动数据，本地状态处理UI交互”。

- **深化组件能力**: 不引入新组件，而是改造 `BatchImprovementDialog` 内部的 `ItemDiff` 子组件，使其能够遍历条目内的所有字段，并为每个字段提供独立的差异视图和复选框。
- **调整本地状态**: `BatchImprovementDialog` 的本地状态 `stagedItems` 的数据结构从 `Array` 升级为 `Map<string, Record<string, any>>`，其中 `key` 是条目ID (`itemId`)，`value` 是一个对象，包含了该条目下所有被用户勾选的字段及其新值 (`{fieldId: newValue, ...}`）。
- **更新Store Action**: 修改 `resumeStore` 中的 `acceptBatchImprovement` action，使其能够处理“部分更新”的逻辑。当接收到提交的数据时，它会使用 `Object.assign` 或对象扩展运算符（`...`）将修改的字段合并到原始数据中，而不是替换整个 `data` 对象。

### 2. 深度剖析：解决Accordion内容溢出布局问题

在实现字段级审查功能后，出现了一个顽固的布局bug：`Accordion` 的内容会撑破对话框的最大宽度。以下是该问题的根本原因及最终解决方案。

#### 结论（真正根因）

问题的根源**不是** `width: 93%` 的样式，也**不是** `ScrollArea` 组件，而是来自 Accordion 内容内部的“**不可压缩宽度**”。

- **长Token问题**: `react-diff-viewer-continued` 组件在处理无空格的长串内容（如中文、URL、长单词、Markdown内联代码等）时，会产生一个超长的、不可断开的Token。

- **Radix尺寸测量**: 当这些长Token无法在容器内正常换行时，Radix UI的 `Accordion` 组件在测量内容尺寸时，会得到一个非常大的“固有宽度”（intrinsic width）。这个值会被写入CSS变量（例如 `--radix-collapsible-content-width`），导致 `Accordion.Content` 认为自身需要很宽，从而撑破其父容器设定的 `max-width` 限制。

- **Transition放大问题**: 如果在 `Accordion.Content` 上应用了 `transition-all`，`width` 属性的变化也会被包含在过渡动画中，这有时会从视觉上放大内容“撑破”容器的效果。

总结：当Accordion内部存在“不可分割”的长行文本时，Radix的测量机制会导致其“内容固有宽度”变得非常大。如果外层容器没有明确声明“我可以收缩”或“我的宽度就是100%”，内容就会将手风琴项撑大，其计算出的宽度（`--radix-collapsible-content-width`）会远超父容器的限制。

#### 最终解决方案：强制断行 + 允许容器收缩（避免宽度过渡）

在多次尝试微调宽度和样式失败后，最终的解决方案是对内容断行与容器收缩做出明确约束，并避免宽度参与过渡：

- **强制长内容可断行（关键）**：在 `ItemDiff` 的 `DiffViewer` 中，为 `styles.contentText` 增加 `overflowWrap: 'anywhere'`，并保持 `wordBreak: 'break-word'` 与 `whiteSpace: 'pre-wrap'`，确保无空格长串、中文、URL、长单词都能断行。

- **让容器“愿意收缩”、且不超过父宽**：
  - 在 `AccordionPrimitive.Root`、`AccordionPrimitive.Content` 的内层容器，以及 Diff 外层包裹层上补充 `min-w-0 w-full max-w-full`。
  - 可选：在 Diff 外层包裹层添加 `[contain:inline-size]`，隔离内部固有宽度的影响。

- **避免宽度参与过渡**：从 `AccordionPrimitive.Content` 移除 `transition-all`，仅保留 `data-[state=*]:animate-accordion-*` 的高度动画，避免 `width` 过渡放大视觉上的“撑破”问题。

关键改动示例：

- `AccordionPrimitive.Content`：去除 `transition-all`；其内层 `div` 增加 `min-w-0`。
- `AccordionPrimitive.Root`：增加 `min-w-0`。
- Diff 包裹层：增加 `min-w-0 w-full max-w-full [contain:inline-size]`。
- `DiffViewer.styles.contentText`：增加 `overflowWrap: 'anywhere'`（与 `wordBreak: 'break-word'`、`whiteSpace: 'pre-wrap'` 配合）。


_最后更新: 2025-08-13_
_文档版本: v1.1.1_
_相关组件: `AISuggestionCard`, `BatchImprovementDialog`, `AIFieldWrapper`_
