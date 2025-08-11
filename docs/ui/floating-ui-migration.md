# Floating UI 迁移与规范

本文记录从引入 Floating UI 到各类悬浮层（Combobox、HoverCard、Markdown 工具条等）的统一迁移、规范与经验，确保后续开发一致、稳定、可维护。

## 背景与目标

- __动机__：Radix Popover/Portal 在复杂容器中存在裁剪、z-index、边界避让不足的问题；多行选区定位不稳定；下拉/工具条等存在错位与回流抖动。
- __目标__：统一采用 Floating UI 进行定位与边界避让；沉淀通用容器 `FloatingLayer`；形成可复用的用法模式与 A11y 规范；避免业务逻辑下沉至 UI。

## 范围

- __通用容器__：`src/components/ui/floating/FloatingLayer.tsx`
- __优先迁移__：Combobox 下拉、HoverCard 悬浮卡片、Markdown Floating Toolbar
- __后续可迁移__：其他弹出菜单、提示、浮层类组件

## 相关文档

- **[FloatingLayer 组件 API](./floating-layer.md)** — 通用容器的属性、行为与示例（Combobox、Toolbar、HoverCard）
- **[Markdown 浮动工具栏](./markdown-floating-toolbar.md)** — 选区工具条的定位、快捷键联动与实现要点
- **[Combobox Ghost Text](./combobox-ghost-text.md)** — 下拉与包容性 ghost text 的联动与键盘行为

## 依赖

- `@floating-ui/react`

## 架构约束与规范

- __UI 纯渲染__：所有悬浮层组件只负责展示与事件派发；禁止直接调用 AI 或写入业务状态。
- __Schema 驱动__：任何交互/行为均由上层 Schema 或服务驱动；UI 内禁止基于 section/field 的硬编码分支。
- __键盘桥接而非直调__：如需联动 Copilot（Cmd/Ctrl+K），通过模拟快捷键事件桥接，避免 UI 组件越权。
- __定位策略__：优先 `strategy="fixed"`；只在 `open` 时启用 `autoUpdate`；必要时设置 `offset/flip/shift` 与 `padding`。
- __选区稳定性__：选区变动后短延时再显示；保留 lastRect 以避免 (0,0) 闪跳；对选区影响的命令延后一帧执行。
- __统一样式__：边框/背景/阴影尽量由 `FloatingLayer` 容器统一提供，子内容避免重复描边导致“套娃”。
- __A11y__：按语义设置 `role`；仅在需要键盘循环时开启 `FloatingFocusManager`，避免焦点陷阱干扰输入。

## 核心组件：FloatingLayer

- __文件__：`src/components/ui/floating/FloatingLayer.tsx`
- __作用__：封装 Portal、自动更新、翻转/避让、同宽、关闭策略、可选焦点管理、虚拟锚点、inline 中间件。
- __关键特性__：
  - Portal 到 `body`，避免被父容器裁剪。
  - `autoUpdate` 仅在 `open` 为真时启用，降低成本。
  - 中间件链：`inline?(可选)` → `offset` → `flip` → `shift` → `size(matchWidth 可选)`。
  - 支持 DOM `anchorRef` 与虚拟 `virtualRef`（用于选区类 UI）。
  - 关闭策略：outsidePress、Esc；可关闭焦点管理以保持输入流畅（如 Combobox）。

### Props（摘要）

见 `docs/ui/floating-layer.md` 全量 API。常用：

- `open`/`onOpenChange`
- `anchorRef` 或 `virtualRef`
- `placement`、`offset`、`strategy`
- `matchWidth`、`withInline`、`withFocusManager`
- `closeOnOutsidePress`、`closeOnEsc`

## 迁移模式

- __Combobox__（下拉列表）：
  - 使用 `anchorRef` 绑定输入框；`matchWidth=true`；`withFocusManager=false`；`closeOnOutsidePress=true`。
  - 注意：键入滚动时的 autoUpdate，避免过度 reflow；只在展开时启用。

- __HoverCard__（信息卡/选项卡）：
  - 使用 `anchorRef`；按需 `offset`、`flip`、`shift`；根据交互决定是否 `withFocusManager`。

- __Markdown Floating Toolbar__（选区工具条）：
  - 使用 `virtualRef`：实现 `getBoundingClientRect()` 与 `getClientRects()`。
  - 开启 `withInline` 以引入 `inline()` 中间件，优化多行/折行选区定位。
  - 保留“最后非零矩形”缓存，避免选区消失瞬间跳到 (0,0)。

## 选区与键盘

- __选区稳定显示__：对选区变化做短延时（~120ms）后显示，等价“mouseup 后出现”，避免拖拽中闪烁。
- __操作延后执行__：格式化/替换等对选区有影响的命令使用 `setTimeout(fn, 0)` 延后一帧，规避与编辑器内部状态竞争。
- __快捷键联动（Toolbar）__：
  - 捕获阶段监听 `Ctrl/Cmd+K`，先关闭工具条，避免与 Copilot Suggestion Card 重叠。
  - AI 按钮不直接调用 AI，改为模拟 `Ctrl/Cmd+K`（派发 `keydown/keyup`），统一触发上层逻辑，符合 UI 纯渲染约束。

## A11y

- 使用合理 `role`（如 `toolbar`、`listbox`、`menu`）。
- 仅在必要时开启 `FloatingFocusManager`，避免焦点陷阱影响输入体验。
- 外部点击与 Esc 关闭应可配置。

## 性能与样式

- `strategy` 推荐 `fixed`，减少滚动耦合。
- 中间件 padding 设为 8，兼顾边缘避让与稳定性。
- 统一容器样式由 `FloatingLayer` 外壳提供，避免子组件重复边框/阴影造成视觉“套娃”。

## 已知边界

- 选区虚拟锚点需提供 `getClientRects()` 才能充分发挥 `inline()` 优势。
- 某些嵌套滚动容器下，如滚动监听较密集，需评估 `autoUpdate` 带来的成本。

## 回归清单（建议）

- __定位__：翻转、避让、滚动、拖拽、窗口缩放。
- __交互__：外部点击关闭、Esc 关闭、键盘导航（如上下箭头）。
- __A11y__：焦点可达、ARIA role 准确、读屏兼容。
- __性能__：展开/收起时布局波动与卡顿。

## 故障排查（Troubleshooting）

- __工具条跑到 (0,0)__：
  - 选区瞬时消失导致 `getBoundingClientRect()` 返回 0；请缓存 lastRect，并在 0 时回退到 lastRect。
  - 启用 `withInline` 并实现 `getClientRects()`，多行/折行定位更稳。

- __下拉被裁剪/遮挡__：
  - 确认通过 `FloatingPortal` 渲染到 `body`；父容器的 `overflow/transform` 不会再影响。
  - 推荐 `strategy="fixed"`，并在需要时启用 `matchWidth`。

- __抖动/闪烁__：
  - 仅在 `open` 时启用 `autoUpdate`（`FloatingLayer` 已内建）。
  - 对会影响选区的命令（如替换/包裹）用 `setTimeout(fn, 0)` 延后一帧执行。

- __与 Copilot 冲突__（Cmd/Ctrl+K 后错位或被遮挡）：
  - 在捕获阶段监听快捷键，先关闭 Toolbar，再让 Copilot 弹层出现。
  - “AI Modify” 按钮通过派发键盘事件模拟快捷键，而非直接调用 AI。

- __滚动容器嵌套导致定位偏移__：
  - 优先 `strategy="fixed"`；必要时检查祖先元素上的 `transform` 与 `will-change`。
  - 调整中间件 `offset/flip/shift` 的 `padding`，避免贴边抖动。

- __性能压力__：
  - 大文档/高频滚动场景，观察 `autoUpdate` 的代价；按需降低刷新频次或在关闭时彻底移除监听。

## 新组件接入检查清单（Checklist）

- [ ] 是否使用了 `FloatingLayer`（而非直接手写 Portal/定位）
- [ ] 是否选择了合适的锚点类型：`anchorRef`（DOM）或 `virtualRef`（选区/自定义）
- [ ] 是否配置了必要的中间件：`withInline`（多行选区）、`offset/flip/shift`、`matchWidth`
- [ ] 是否仅在展开时启用自动更新（组件内置，确认无额外副作用）
- [ ] 是否设置了合理的关闭策略：`closeOnOutsidePress`、`closeOnEsc`
- [ ] 是否遵守架构约束：无业务逻辑下沉、无直接 AI 调用、必要时采用快捷键桥接
- [ ] 是否具备基本 A11y：语义 `role`、可达的键盘导航
- [ ] 是否通过回归清单的定位/交互/性能验证

## 变更记录

- 2025-08-11：
  - 引入 `@floating-ui/react`，并沉淀通用组件 `FloatingLayer`。
  - Combobox、HoverCard 优先迁移至 `FloatingLayer`（规则化中间件与关闭策略）。
  - Markdown Floating Toolbar：虚拟锚点 + `inline()`，短延时展示、lastRect 缓存、Ctrl/Cmd+K 联动与 AI 按钮快捷键模拟。
  - 更新相关文档与使用指南。
