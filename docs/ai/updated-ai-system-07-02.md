## AI 改进系统 v3 架构 (Updated 2025-07-02)

### 概述

AI 改进系统经过全面重构，从 v2 的模态对话框模式升级为 v3 的双模式交互系统：

1. **单字段改进**: 使用内联建议卡片 (`AISuggestionCard`)
2. **批量改进**: 使用可折叠评审对话框 (`BatchImprovementDialog`)

### 核心设计原则

- **非侵入式**: 用户工作流程不被打断
- **上下文清晰**: 改进建议与原始内容紧邻显示
- **用户可控**: 精细的接受/拒绝控制，支持部分应用
- **数据稳定**: 使用 JSON String Wrapper 模式确保 AI Flow 的可靠性

### 关键组件架构

#### 1. AISuggestionCard (单字段改进)

```typescript
interface AISuggestionCardProps {
  review: SingleFieldImprovementReview;
  onAccept: () => void;
  onReject: () => void;
}
```

- **位置**: 渲染在被改进字段的正下方
- **布局**: 使用统一差异视图 (`unified diff`)
- **交互**: Accept/Dismiss 按钮，简洁高效
- **状态**: 直接从 `resumeStore.singleFieldImprovementReview` 订阅

#### 2. BatchImprovementDialog (批量改进)

```typescript
interface BatchImprovementDialogProps {
  review: BatchImprovementReview;
  onAccept: (selectedItems: Array<{ id: string; data: any }>) => void;
  onReject: () => void;
}
```

- **布局**: 全屏模态对话框 + 手风琴 (`Accordion`) 折叠布局
- **选择机制**: 每个改进项前的复选框，支持部分选择
- **差异显示**: 每个折叠项内使用统一差异视图
- **批量操作**: 动态显示已选择项目数量

#### 3. AIFieldWrapper (触发器)

- **集成两种模式**: 根据上下文决定触发单字段或批量改进
- **状态监听**: 订阅相应的 store 状态切片
- **条件渲染**: 根据 review 状态决定是否显示建议卡片

### 数据流架构

```
用户交互 → AIFieldWrapper → Store Action → AI Flow → Store Update → UI 响应
```

#### 单字段改进流程

1. 用户在 `AIFieldWrapper` 输入提示，点击 "Improve"
2. 调用 `startSingleFieldImprovement` store action
3. Store 设置 `singleFieldImprovementReview.isLoading = true`
4. 调用 `improveSectionField` AI Flow
5. Flow 返回结果，更新 `singleFieldImprovementReview` 状态
6. `AISuggestionCard` 自动渲染在字段下方

#### 批量改进流程

1. 用户在 `SectionEditor` 输入提示，点击 "批量改进"
2. 调用 `startBatchImprovement` store action
3. Store 设置 `batchImprovementReview.isLoading = true`
4. 调用 `batchImproveSection` AI Flow (使用 JSON String Wrapper)
5. Flow 返回结果，更新 `batchImprovementReview` 状态
6. `BatchImprovementDialog` 自动打开并显示可选择的改进项

### JSON String Wrapper 模式集成

批量改进功能使用 JSON String Wrapper 模式解决 AI 平台的动态 Schema 限制：

```typescript
// Output Schema (简单包装器)
const BatchImproveSectionOutputWrapperSchema = z.object({
  improvedSectionJson: z.string(),
  improvementSummary: z.string(),
});

// Flow 内部解析和验证
const parsed = JSON.parse(result.improvedSectionJson);
const validated = AIBridgedSectionSchema.parse(parsed);
```

### 技术优势

- **稳定性**: JSON String Wrapper 消除了 `400 Bad Request` 错误
- **性能**: 内联卡片避免了模态框的渲染开销
- **可维护性**: 清晰的组件职责分离
- **用户体验**: 非侵入式交互，精细控制能力

### 已移除组件

- `SingleFieldImproveDialog.tsx`: 已完全移除并由 `AISuggestionCard` 替代
- 相关的强制建议机制从 `AutocompleteTextarea` 中移除
