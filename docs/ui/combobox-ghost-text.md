# 组件文档: Combobox & InclusiveGhostTextbox

本文档详细介绍了 `InclusiveGhostTextbox` 组件及其与 `Combobox` 的集成，这是我们实现 "AI-enhanced UI" 的核心部分。

## 1. InclusiveGhostTextbox

`InclusiveGhostTextbox` 是一个基于 Slate.js 构建的可重用 React 组件，它提供了一种独特的"包容性匹配"自动补全功能。

### 核心特性

- **包容性匹配 (Inclusive Matching)**: 与传统仅补全后缀的组件不同，它可以智能地补全光标前后的文本。例如，输入 `sql`，它可以建议 `[My]sql`，其中 `My` 是前缀补全。
- **Textarea 兼容**: 完全支持多行文本输入，包括行数 (`rows`) 和调整大小 (`resize`) 的配置。
- **框架无关**: 核心逻辑不依赖于项目的状态管理（如 Zustand），使其易于维护和未来潜在的开源发布。
- **动态建议获取**: 通过 `getSuggestion` prop 异步获取建议，可以轻松对接 AI 后端服务。
- **精细的键盘控制**:
  - `Tab` / `→` / `Enter`: 接受建议。
  - `Esc`: 取消建议。
- **精确的 UI/UX**:
  - 通过动态计算 `padding` 保证前缀补全时文本的完美对齐。
  - 内置加载状态和可配置的 `debounceTime`，以优化性能和用户体验。
  - 样式与现有的 `shadcn/ui` 组件（如 `Input`）保持一致。

### 使用方法

#### 基础用法

```tsx
import { InclusiveGhostTextbox } from '@/components/ui/InclusiveGhostTextbox';
import { useState } from 'react';

function MyComponent() {
  const [value, setValue] = useState('');

  const getAISuggestion = async (text: string): Promise<string> => {
    // 调用您的 AI 服务
    return `AI-powered suggestion for: ${text}`;
  };

  return (
    <InclusiveGhostTextbox
      value={value}
      onValueChange={setValue}
      getSuggestion={getAISuggestion}
      placeholder="Type to get an AI suggestion..."
      rows={4}
    />
  );
}
```

### Props

| Prop                      | Type                                | 默认值       | 描述                                                              |
| ------------------------- | ----------------------------------- | ------------ | ----------------------------------------------------------------- |
| `value`                   | `string`                            | -            | **必需.** 输入框的受控值。                                        |
| `onValueChange`           | `(value: string) => void`           | -            | **必需.** 输入值变化时的回调函数。                                |
| `getSuggestion`           | `(text: string) => Promise<string>` | `undefined`  | 用于异步获取建议的函数。                                          |
| `debounceTime`            | `number`                            | `300`        | 获取建议前的防抖延迟时间（毫秒）。                                |
| `acceptSuggestionOnEnter` | `boolean`                           | `true`       | 是否在按下 `Enter` 键时接受建议。在 `Combobox` 中应设为 `false`。 |
| `onSuggestionAccepted`    | `(value: string) => void`           | `undefined`  | 用户接受建议时的回调。                                            |
| `rows`                    | `number`                            | `3`          | 文本框的初始行数。                                                |
| `resize`                  | `'none' \| 'vertical' \| ...`       | `'vertical'` | 控制文本框是否以及如何调整大小。                                  |
| `className`               | `string`                            | `undefined`  | 自定义 CSS 类。                                                   |
| `...rest`                 | `HTMLAttributes`                    | -            | 其他标准 HTML 属性，如 `disabled`, `placeholder`。                |

## 2. Combobox 集成

`Combobox` 组件已升级，内部使用 `InclusiveGhostTextbox` 来提供丰富的自动补全体验。

### 行为变更

- **智能补全**: `Combobox` 现在可以根据下拉列表中的选项提供包容性的 ghost text 补全。
- **统一的键盘交互**:
  - `Tab` / `→`: 接受 ghost text 建议。
  - `Enter`: **始终**用于从下拉列表中选择当前高亮的选项，而不是接受 ghost text。这确保了与标准 `cmdk` 行为的一致性。
  - `↓` / `↑`: 在下拉列表中导航。
  - `Esc`: 关闭下拉列表或取消 ghost text。

### 使用方法

通过 `enableGhostText` prop 来控制此功能。

```tsx
import { Combobox } from '@/components/ui/combobox';

const frameworks = [
  { value: 'next.js', label: 'Next.js' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'remix', label: 'Remix' },
];

function FrameworkSelector() {
  const [value, setValue] = useState('');

  return (
    <Combobox
      options={frameworks}
      value={value}
      onValueChange={setValue}
      placeholder="Select a framework..."
      enableGhostText={true} // 启用 ghost text
    />
  );
}
```

### 实现细节

- `Combobox` 将 `acceptSuggestionOnEnter` prop 设置为 `false` 传递给 `InclusiveGhostTextbox`。
- 这使得 `Enter` 键事件可以被 `cmdk.Command` 组件捕获，用于选择列表项，从而分离了"补全"和"选择"两个操作。
- `getSuggestion` 逻辑现在与过滤后的下拉列表选项同步，确保建议的来源与用户所见的选项一致。

## 3. 核心实现思路与未来扩展

理解组件的内部工作原理有助于未来的维护和功能增强。

### 核心实现思路

该组件的实现主要依赖以下三个关键技术：

1.  **Slate.js 作为引擎**: 我们没有使用原生的 `<input>` 或 `<textarea>`，而是选择了功能强大的富文本编辑器框架 Slate.js。这为我们提供了对输入内容、光标位置和键盘事件的完全控制能力。

2.  **绝对定位的 Ghost Text 覆盖层**:
    - Ghost text (包括前缀和后缀) 并不是真实存在于输入框中，而是渲染在一个绝对定位的 `<div>` 中，该 `<div>` 覆盖在真实的 Slate 编辑器之上。
    - 当 ghost text 显示时，真实的编辑器背景被设置为透明 (`bg-transparent`)，从而让下方的 ghost text "透视"出来。

3.  **动态内边距 (Padding) 实现对齐**:
    - 这是实现前缀补全 (prefix) 对齐的关键。当存在前缀时，我们需要将用户实际输入的文本向右推移，以避免与前缀重叠。
    - 我们使用一个隐藏的、具有相同字体样式的 `<span>` 来实时测量前缀文本的实际像素宽度。
    - 然后，通过 `useLayoutEffect` 将这个宽度动态地应用为 Slate 编辑器的 `padding-left`。这确保了无论前缀内容或字体如何变化，用户的输入始终能与 ghost text 完美衔接。
