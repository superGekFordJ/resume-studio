# Markdown Toolbar - Known Issues & TODOs

以下问题留给下一位 Agent 或未来的我们继续优化：

- [x] 选区与翻转定位改进：已使用 `Range.getClientRects()` 选择最靠上的 rect，默认“上方”显示，空间不足则翻转到“下方”，并做水平居中与视窗边界夹取；监听 `selectionchange`/`scroll`/`resize`，以 `requestAnimationFrame` 轻节流。仍需：多行极端选区与嵌套滚动容器回归验证。

- [x] 图标风格统一：已改为 `lucide-react` 图标。后续如需进一步统一样式，可新增 `src/components/ui/icons.tsx` 进行集中封装（可选）。

- [x] 文本包裹算法（首版优化）：新增 `src/lib/markdownTextTransforms.ts`，对加粗/斜体/代码包裹在尾随标点时进行外移处理；链接支持解包与 `prompt` 获取 URL。后续可补充更复杂的边界与单元测试。

- [x] 组件模块化：已抽取为独立文件 `src/components/resume/ui/MarkdownFloatingToolbar.tsx`，并通过 `insideSlateChildren` 注入。公共子组件与样式常量的进一步沉淀可在需要时进行。

- [x] “AI Modify”按钮（可选）：已加入可选按钮（默认关闭），点击时模拟 Cmd/Ctrl+K（派发 `keydown/keyup`），统一触发上层 Copilot Suggestion Card；为保持解耦，不直接调用 AI，也不依赖内部 Hook；Toolbar 在捕获阶段监听并先行关闭，避免 UI 冲突。

- [ ] A11y 与快捷键：
  - 为 Toolbar 增加键盘导航（Tab/Shift+Tab）与 `aria-pressed` 状态；
  - 按钮快捷键（Ctrl/Cmd + B/I/`）与选中状态高亮（检测是否被 Markdown 包裹）。

- [x] 定位鲁棒性（基础）：已迁移至 Floating UI，采用 `inline()` + `flip/shift/offset` 中间件、`fixed` strategy 与 Portal，并缓存 lastRect；虚拟锚点实现 `getClientRects()` 以提升多行选区定位。
- [ ] 定位鲁棒性（进一步）：针对嵌套滚动容器、极端窗口缩放与高频 `autoUpdate` 场景进行压力测试，必要时调优中间件顺序、`padding` 与更新节流。

- [x] 性能与抖动：已通过 `selectionchange`/`scroll`/`resize` + rAF 轻节流，并在隐藏/卸载时移除监听。仍需在长文档场景做压力测试。

> 注：本文件仅记录问题与方案方向，具体实现以代码注释与 PR 说明为准。
