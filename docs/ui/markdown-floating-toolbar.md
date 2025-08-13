# Markdown Floating Toolbar

本页介绍在编辑区中基于选区自动显示的 Markdown 浮动工具栏（下称“Toolbar”）的设计、使用方式与实现要点。

## 概要

- 基于 Slate 选区：当选区非折叠时显示。
- 放置策略：优先显示在所选文本“上方”，不足则翻转；自动避让边界。
- 渲染方式：基于通用 `FloatingLayer`（内部使用 Floating UI + Portal），避免被父容器裁剪（overflow、z-index）。
- 操作项：加粗、斜体、行内代码、链接、无序/有序列表（统一使用 `lucide-react` 图标）。
- 与 AI 悬浮编辑框（Cmd/Ctrl + K）互不干扰；当按下 Cmd/Ctrl+K 时，Toolbar 会自动收起。

实现位置：`src/components/resume/ui/MarkdownFloatingToolbar.tsx`，通过 `insideSlateChildren` 注入到 `src/components/resume/ui/AutocompleteTextarea.tsx`。

## 使用方式（当前实现）

当前版本为独立组件 `src/components/resume/ui/MarkdownFloatingToolbar.tsx`，并在 `AutocompleteTextarea` 中按需注入：当 `AutocompleteTextarea` 接收到 `isMarkdownEnabled=true` 时，才通过 `insideSlateChildren={<MarkdownFloatingToolbar />}` 渲染 Toolbar；否则不注入。

- 启用来源：`schema.uiProps.markdownEnabled === true`。
- 传递链路：`SectionItemEditor` → `AIFieldWrapper` → `FocusView/AutocompleteTextarea`（以 `isMarkdownEnabled` 形式下发）。

> 说明：若后续有跨模块复用需求，可再迁移至 `src/components/common/` 目录并沉淀公共样式与子组件。

## 关键实现细节

- 选区侦测：通过 `slate-react` 的 `useSlate()` 与 `useSlateSelection()` 获取编辑器与选区；当 `selection` 存在且 `!Range.isCollapsed(selection)` 时显示。
- 定位与布局：基于通用 `FloatingLayer` 与 Floating UI 定位中间件：
  - 提供虚拟参考 `virtualRef`，实现 `getBoundingClientRect()` 与 `getClientRects()`，支持多行/折行选区；
  - 开启 `withInline` 以引入 Floating UI 的 `inline()` middleware，提升跨行定位稳定性；
  - 搭配 `flip()`、`shift()`、`offset()`，自动翻转与避让；Portal 由 `FloatingPortal` 承担；
  - 内部保留“最后一次非零矩形”缓存，避免选区暂时消失时浮层跳到 (0,0)。
  
  同时引入纯文本变换模块 `src/lib/markdownTextTransforms.ts`，避免“吞标点”等问题。
- 文本替换：通过 `Transforms.delete` + `Transforms.insertText` 在原选区处替换为包裹后的 Markdown 文本；使用 `Editor.withoutNormalizing` 包裹，减少中间态扰动。
- 交互节流：对选区变化做短延时（约 120ms）展示，等价于“mouseup 后出现”，避免拖拽选择时闪烁。

## 与 AI 功能的关系

- 顶层悬浮 AI 编辑框（Copilot Suggestion Card）通过快捷键 Cmd/Ctrl + K 显示；
- 当用户按下 Cmd/Ctrl + K 时，Toolbar 在捕获阶段监听并自动收起，避免两个浮层重叠；
- 可选的“AI Modify”按钮（默认关闭）会模拟按键 Cmd/Ctrl + K（派发 `keydown/keyup` 事件），以统一触发上层 Copilot 逻辑；未直接调用任何 AI 接口，符合 UI 纯渲染原则与“禁止直接调用 AI”的约束。
  - 事件派发目标依次为：`document.activeElement`（若存在并可接收键盘事件）→ `document` → `window`，且设置 `composed: true`；这样无论监听器绑定在元素、文档或窗口层级，都能正确收到事件。
  - 为确保顺序正确，Toolbar 在捕获阶段先处理（关闭自身），再由外层 Copilot 接管显示，避免 UI 冲突。

## 可访问性（A11y）

- 每个按钮具备 `aria-label` 与 `title`；
- 后续可补充键盘导航（Tab/Shift+Tab）与聚焦样式；
- 可为按钮提供快捷键提示（例如 Ctrl/Cmd + B/I 等）。

## 已知限制与边界

详见《markdown-toolbar-issues.md》。

## 变更记录

- 2025-08-13：引入 schema 驱动的启用范围。仅当字段的 `uiProps.markdownEnabled` 为 `true` 时，`AutocompleteTextarea` 才会注入 Toolbar；非 Markdown 字段不再显示任意 Markdown UI。
- 2025-08-11：迁移到通用 `FloatingLayer`，引入 Floating UI `inline()` 中间件，虚拟参考实现 `getClientRects()`；加入选区变更轻延时展示与“最后非零 rect”缓存；当 Cmd/Ctrl+K 按下时自动收起；AI 按钮模拟 Cmd/Ctrl+K 触发 Copilot；维持 `toggleWrap` 等纯文本变换模块。
- 2025-08-09：抽取为独立组件 `src/components/resume/ui/MarkdownFloatingToolbar.tsx`；统一使用 `lucide-react` 图标；改进定位（`getClientRects` + 翻转 + 夹取 + 事件监听 + rAF）；新增纯文本变换模块 `src/lib/markdownTextTransforms.ts`；加入可选的“AI Modify”按钮（默认关闭）。
