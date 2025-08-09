# Markdown Floating Toolbar

本页介绍在编辑区中基于选区自动显示的 Markdown 浮动工具栏（下称“Toolbar”）的设计、使用方式与实现要点。

## 概要

- 基于 Slate 选区：当选区非折叠时显示。
- 放置策略：始终显示在所选文本“上方”，尽量避免遮挡内容。
- 渲染方式：使用 `createPortal` 将浮层渲染到 `document.body`，避免被父容器裁剪（overflow、z-index 等问题）。
- 操作项：加粗、斜体、行内代码、链接、无序/有序列表（以 Markdown 语法包裹选中文本）。
 - 操作项：加粗、斜体、行内代码、链接、无序/有序列表（以 Markdown 语法包裹选中文本）；图标使用 `lucide-react` 统一。
- 与 AI 悬浮编辑框（Cmd/Ctrl + K）互不干扰，后者仍由快捷键触发。

实现位置：`src/components/resume/ui/MarkdownFloatingToolbar.tsx`，通过 `insideSlateChildren` 注入到 `src/components/resume/ui/AutocompleteTextarea.tsx`。

## 使用方式（当前实现）

当前版本为独立组件 `src/components/resume/ui/MarkdownFloatingToolbar.tsx`，并在 `AutocompleteTextarea` 中通过 `insideSlateChildren={<MarkdownFloatingToolbar />}` 注入，无需额外配置即可生效。

> 说明：若后续有跨模块复用需求，可再迁移至 `src/components/common/` 目录并沉淀公共样式与子组件。

## 关键实现细节

- 选区侦测：通过 `slate-react` 的 `useSlate()` 与 `useSlateSelection()` 获取编辑器与选区；当 `selection` 存在且 `!Range.isCollapsed(selection)` 时显示。
- 定位与布局：基于原生 `Selection` 与 `Range` 进行测量与定位：
  - 优先使用 `range.getClientRects()`，选择最靠上的 `rect` 作为锚点；
  - 默认显示在选区“上方”，若上方空间不足则翻转到“下方”；
  - 以选区中心水平居中，左右做视窗边界夹取；
  - 监听 `selectionchange`、`scroll`、`resize`，用 `requestAnimationFrame` 进行轻节流重算；
  - 通过 `createPortal(..., document.body)` 保证不被父容器裁剪。
  
  同时引入纯文本变换模块 `src/lib/markdownTextTransforms.ts`，避免“吞标点”等问题。
- 文本替换：通过 `Transforms.delete` + `Transforms.insertText` 在原选区处替换为包裹后的 Markdown 文本。

## 与 AI 功能的关系

- 顶层悬浮 AI 编辑框（Hovering Editor/Prompt Box）仍通过快捷键 Cmd/Ctrl + K 显示；
- Toolbar 与其互不干扰：Toolbar 根据选区出现；AI 悬浮框根据快捷键出现；
- 已预留可选的“AI Modify”按钮（默认关闭），点击时会派发 `resume:openHoveringEditor` 自定义事件；如需联动，可在上层监听该事件后打开 Hovering Editor（或在核心包内增加 Event Bridge）。

## 可访问性（A11y）

- 每个按钮具备 `aria-label` 与 `title`；
- 后续可补充键盘导航（Tab/Shift+Tab）与聚焦样式；
- 可为按钮提供快捷键提示（例如 Ctrl/Cmd + B/I 等）。

## 已知限制与边界

详见《markdown-toolbar-issues.md》。

## 变更记录

- 2025-08-09：抽取为独立组件 `src/components/resume/ui/MarkdownFloatingToolbar.tsx`；统一使用 `lucide-react` 图标；改进定位（`getClientRects` + 翻转 + 夹取 + 事件监听 + rAF）；新增纯文本变换模块 `src/lib/markdownTextTransforms.ts`；加入可选的“AI Modify”按钮（默认关闭）。
