# Header AI Hub — 设计与集成指南

本文档阐述 Header 中央的 AI 中枢入口（AI Hub Button）的布局、动效、无障碍要求、悬浮菜单交互与集成方式。适用于前端实现者与产品设计者，作为架构文档的延伸与落地细节。建议结合《项目架构文档》中“AI 助手”“UI/UX 增强”章节一同阅读。

## 目标与原则

- 单一入口：将 AI 能力（如 Review、Agent）统一入口，长期可扩展。
- 视觉强调：在 Header 中央提供无文字、仅图标的炫彩按钮，与整体风格区分但不喧宾夺主。
- 可达性与性能：动效可关闭（尊重系统偏好），默认轻量 CSS 动画，无重依赖。
- 解耦与扩展：按钮（入口）、悬浮菜单（操作）、业务触发（Store/Flow）分离，彼此可演进。

---

## 布局（Layout）

采用“三列网格”保证绝对居中：

- 左列：品牌区（Logo + 产品名）
- 中列：AI Hub Button（自适应宽度，居中对齐）
- 右列：实用操作（Versions、Settings、Export 等）

实现要点：
- 使用 CSS Grid，如 `grid-cols-[1fr_auto_1fr]`：
  - 第一列与第三列使用 `1fr` 占比，自动平衡左右空间
  - 中间列 `auto` 由按钮内容决定
- 各列对齐方式：
  - 左列 `justify-self-start`
  - 中列 `justify-self-center`
  - 右列 `justify-self-end`

这样即使左右控件数目或宽度变化，中间按钮仍保持视觉绝对居中。

---

## AI Hub Button（按钮形态）

- 无文字，仅图标（默认使用 Sparkles，可替换为品牌专属 SVG）
- 背景：多色渐变（conic-gradient），营造现代 AI 的“能量感”
- 光效：柔光（box-shadow）+ 轻微缩放（scale）交互反馈
- 焦点：键盘聚焦时显示 ring 边框，便于键盘导航
- 属性：
  - `aria-label="AI Assistant"`（或对应本地化文案）
  - 支持 `busy`（忙碌）状态，用于长耗时 AI 操作时显示“呼吸式”辉光

推荐样式语义（示例）：
- 基类：`.aihub-btn`（背景渐变 + 基础阴影）
- 常态动画：`.aihub-glow`（轻微色相漂移，低强度）
- 忙碌动画：`.aihub-pulse`（呼吸式辉光，box-shadow 动画）
- 悬停交互：`:hover` 时轻微放大与外圈光晕增强

无障碍与用户偏好：
- 在 `prefers-reduced-motion: reduce` 时停用关键帧动画，仅保留静态渐变与轻微对比，避免眩晕感。

---

## 悬浮菜单（Hover Menu）

目的：在不增加 Header 右侧按键密度的前提下，为 AI 入口提供二级操作菜单，当前包含：
- Review（现有功能，打开对话框审阅）
- Agent（预留，未来接入对话式 Agent 面板/抽屉）

交互设计：
- 鼠标悬停 AI 按钮短延迟后（建议 120–180ms）显示菜单，降低误触发
- 鼠标移入菜单区域时，菜单保持可见，离开容器一定延迟后隐藏（建议 250–350ms）
- 菜单显示使用 `opacity + translateY` 过渡，带轻微模糊（backdrop-blur）与阴影增强层级

行为约束：
- 悬停菜单出现后，按钮本身的“灵动”动效可减弱或停止（避免注意力分散）
- 键盘可访问：按钮可 Enter/Space 打开菜单，菜单项可通过方向键导航；Esc 关闭

---

## 动效（Motion）与可配置

推荐变量（示例）：
- `--ai-hue-duration`: 色相漂移动画时长（如 6s）
- `--ai-pulse-duration`: 呼吸辉光时长（如 2400ms）
- `--ai-glow-alpha`: 光晕强度（如 0.22，在暗色主题略高）
- `--ai-hover-scale`: 悬停缩放比例（如 1.03）
- `--ai-active-scale`: 按下缩放比例（如 0.97）

推荐关键帧（示例语义）：
- `aihubHue`：0% ~ 100% `filter: hue-rotate(0deg -> 16deg)`，低频低强度
- `aihubPulse`：0%/100% 透明，50% 放大光晕 `box-shadow: 0 0 20px 8px hsla(...)`

调优建议：
- 如果视觉不够明显，可提高 `--ai-glow-alpha` 或扩大 `aihubPulse` 的光晕尺寸（如 `0 0 24px 10px`）
- 在 hover 时增添短周期轻微 hue-rotate，以体现“灵动感”，但要受 reduced-motion 限制

---

## 集成（Integration）

推荐拆分组件与职责：
- `AIHubButton`（入口）：
  - 仅负责视觉与基本交互（点击/hover），通过 props 接收 `onClick` 与 `busy`
  - 可复用在其他布局（如欢迎页、侧栏）
- `AIHubHoverMenu`（悬浮菜单）：
  - 仅负责内容与出现/隐藏的动画
  - 由父容器控制可见性，提供 `onReviewClick`、`onAgentClick` 回调
- Header 容器：
  - 使用局部状态管理菜单显示延迟与隐藏延迟
  - 负责把 Review 与 Agent 的入口与业务动作（Store/Flow）对接
  - 不直接处理 AI 上下文构建/服务端调用（遵守依赖倒置：UI 只触发，不承载业务）

与业务的对接（示例语义）：
- Review：点击菜单项触发 store action（设置 loading、打开 `AIReviewDialog`、运行 review flow）
- Agent：点击菜单项打开 Agent 抽屉（未来对接消息流、上下文构建器等）

---

## 无障碍（Accessibility）

- 所有交互元素需具备语义与可读标签：
  - 按钮：`aria-label`、键盘焦点 ring
  - 菜单：键盘导航、Esc 关闭
- `prefers-reduced-motion`：
  - 关闭关键帧动画，仅保留少量对比变化
- 对比度与色彩：
  - 渐变与光晕在浅色/深色模式下自动适配，避免刺眼或过暗

---

## 性能（Performance）

- 首选 CSS 动画与阴影，不引入重型动画库
- 避免持续高频动画（尤其 hover 时），减轻主线程压力
- 动画属性尽量使用 `transform/opacity`，阴影应控制强度与频率
- 悬浮菜单使用轻量过渡（200–350ms），不要复杂布局重算

---

## 变更记录（Changelog）

- 2025-08-07
  - 引入 Header 三列布局，AI Hub Button 居中
  - 新增 `AIHubButton`（icon-only，渐变 + glow）
  - 新增 `AIHubHoverMenu`（延迟出现、可保持可见）
  - 增强全局动效变量与关键帧（hue、pulse），支持 reduced-motion
  - Review 与 Agent 的职责边界明确（Review 已接入，Agent 预留）

---

## 与架构文档的关联

- 架构文档的“AI 助手（AI Assistant）”与“UI/UX 增强”章节已加入本页链接与简要向导，说明 Header 三列布局、AI 中枢入口、悬浮菜单交互与动效准则。
- 数据流与 AI 交互部分保持不变：UI 不直接构建上下文/调用模型，而是触发 store/flow；`SchemaRegistry` 仍作为上下文构建的单一入口。

---
