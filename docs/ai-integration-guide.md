# A4 Resume Studio - AI 集成指南

## AI 功能概述

A4 Resume Studio 集成了四个核心 AI 功能，基于 Google Genkit 和 Gemini API 实现：

1. **自动补全 (Autocomplete)** - 智能文本补全建议
2. **内容改进 (Content Improvement)** - AI 驱动的文本优化
3. **批量改进 (Batch Improvement)** - 针对特定章节的批量内容优化
4. **简历评审 (Resume Review)** - 全面的简历质量分析

## 核心架构：Schema 驱动的 AI 交互

所有 AI 功能都遵循一个统一的、由 `SchemaRegistry` 驱动的架构。

### 1. `SchemaRegistry`：AI 交互的控制中心

- **职责**: `SchemaRegistry` (`src/lib/schemaRegistry.ts`) 负责集中管理所有与 AI 交互相关的逻辑。
- **核心方法**:
  - `buildAIContext(payload: AIContextPayload)`: 这是最核心的方法。UI 组件不再自己构建上下文，而是调用此方法来获取一个结构化的上下文对象。
  - `stringifyResumeForReview(resumeData: any)`: 此方法负责将整个简历数据序列化为适合 AI 评审的字符串。

### 2. "无知"的 UI 组件

- UI 组件（如 `SectionEditor.tsx`, `AutocompleteTextarea.tsx`）被重构为"无知"的（Dumb）组件。
- 它们只负责捕获用户意图（例如，用户点击了"Improve"按钮）并调用 `SchemaRegistry` 的方法，而**不包含任何 `if/switch` 或手动构建上下文的逻辑**。

### 3. Zustand Store 作为 AI 交互的中介 (Updated 2025-06-23)

- **重要更新**: 随着 `SectionEditor` 的重构，所有 AI 交互现在通过 `resumeStore` 进行协调。
- UI 组件不再直接调用 AI 服务，而是派发 Store Actions（如 `startAIImprovement`）。
- Store Actions 负责调用 `SchemaRegistry` 构建上下文，执行 AI 调用，并更新状态。
- UI 组件只需订阅相关状态（如 `aiImprovement`）并进行渲染。

### 4. 标准化的数据流

```
1. UI Component
   - 捕获用户操作（如点击"改进"按钮）
   - 派发 Store Action（如 startAIImprovement）
   - 传递必要的参数（sectionId, fieldId, uniqueFieldId 等）

2. Zustand Store Action
   - 接收参数并设置加载状态
   - 调用 schemaRegistry.buildAIContext(payload)
   - 调用相应的 AI Flow
   - 处理结果并更新状态

3. SchemaRegistry
   - 接收 payload
   - 找到正确的 SectionSchema 和 FieldSchema
   - 使用 schema 中定义的 contextBuilders 生成 StructuredAIContext

4. AI Flow
   - 接收 StructuredAIContext
   - 在 prompt 模板中使用结构化数据
   - 执行 AI 任务
   - 返回结果给 Store Action

5. UI Component
   - 订阅 Store 中的相关状态（如 aiImprovement）
   - 根据状态更新 UI（如显示 AI 建议）
```

## AI 功能详解

### 1. 自动补全 (Autocomplete) & 内容改进 (Improvement)

这两个功能遵循完全相同的数据流。

#### 实现位置
- **Flows**:
  - `src/ai/flows/autocomplete-input.ts`
  - `src/ai/flows/improve-resume-section.ts`
- **UI 集成**:
  - `src/components/resume/ui/AutocompleteTextarea.tsx`
  - `src/stores/resumeStore.ts`（新增）

#### 输入参数 (Zod Schema in Flow)

两个 Flow 的输入 Schema 都被重构为接收一个统一的 `context` 对象。

```typescript
// in autocomplete-input.ts / improve-resume-section.ts
const InputSchema = z.object({
  // ... other fields like inputText or prompt
  
  context: z.object({
    currentItemContext: z.string(), // The specific context for the item being edited.
    otherSectionsContext: z.string(), // A summary of all other sections.
    userJobTitle: z.string().optional(), // The user's target job title.
  }).describe('Structured context from SchemaRegistry'),
  
  // Optional field for backward compatibility or UI hints
  sectionType: z.string().optional(), 
});
```

#### Store Action 调用示例（新增）

```typescript
// In resumeStore.ts

startAIImprovement: async (payload) => {
  const { sectionId, itemId, fieldId, currentValue, uniqueFieldId, isPersonalDetails } = payload;
  
  // 设置加载状态
  set({ isImprovingFieldId: uniqueFieldId });
  
  try {
    const state = get();
    const schemaRegistry = SchemaRegistry.getInstance();
    
    // 构建 AI 上下文
    const contextPayload: AIContextPayload = {
      resumeData: state.resumeData,
      task: 'improve',
      sectionId,
      fieldId,
      itemId,
    };
    
    const context = schemaRegistry.buildAIContext(contextPayload);
    
    // 调用 AI Flow
    const { improveResumeSection } = await import('@/ai/flows/improve-resume-section');
    const result = await improveResumeSection({
      resumeSection: currentValue,
      prompt: state.aiPrompt,
      context: context,
      sectionType: isPersonalDetails ? 'personalDetailsField' : undefined
    });
    
    // 更新状态
    set({
      aiImprovement: {
        uniqueFieldId,
        suggestion: result.improvedResumeSection,
        originalText: currentValue
      },
      isImprovingFieldId: null
    });
  } catch (error) {
    console.error("AI improvement error:", error);
    set({ isImprovingFieldId: null });
  }
}
```

#### UI 组件调用示例（新增）

```typescript
// In a UI component (e.g., AIFieldWrapper.tsx)

const handleImproveWithAI = () => {
  if (!aiPrompt.trim()) {
    toast({ variant: "destructive", title: "AI Prompt Empty", description: "Please provide a prompt for the AI." });
    return;
  }
  
  // 设置 AI 提示
  setAIPrompt(aiPrompt);
  
  // 派发 Store Action
  startAIImprovement({
    sectionId: currentSectionId,
    itemId: itemId,
    fieldId: fieldId,
    currentValue: value,
    uniqueFieldId: id,
    isPersonalDetails: sectionType === 'personalDetailsField'
  });
};
```

### 2. 简历评审 (Resume Review)

#### 实现位置
- **Flow**: `src/ai/flows/review-resume.ts`
- **UI 集成**: `src/app/page.tsx` (via `AIReviewDialog.tsx`)

#### 核心特性
- **全面分析**: 评估简历的整体质量和结构。
- **统一序列化**: 使用 `schemaRegistry.stringifyResumeForReview` 来生成一致的、可供 AI 分析的简历文本。

#### 数据转换

旧的、在 `page.tsx` 中手动拼接字符串的 `stringifyResumeForReview` 函数已被**完全移除**。

```typescript
// In page.tsx

const handleReviewResume = async () => {
  setIsReviewLoading(true);
  // ...
  try {
    // The ONLY line needed to prepare the data for the review flow.
    const resumeText = schemaRegistry.stringifyResumeForReview(resumeData);
    
    const result = await reviewResume({ resumeText });
    setReviewContent(result);
  } catch (error) {
    // ... error handling
  } finally {
    setIsReviewLoading(false);
  }
};
```

`schemaRegistry.stringifyResumeForReview` 方法会遍历所有可见的章节，使用每个章节 `SectionSchema` 中定义的 `sectionSummaryBuilder` 来创建该章节的文本表示，最终将它们拼接成一个完整的简历字符串。这确保了即使添加了新的动态章节，评审功能也无需任何代码更改即可正确工作。

### 3. 批量改进 (Batch Improvement)（即将集成）

批量改进功能允许用户一次性改进整个章节的内容，而不是逐个字段改进。

#### 实现位置
- **Flow**: `src/ai/flows/batch-improve-section.ts`（已实现）
- **UI 集成**: 尚未集成，将在下一阶段开发

#### 计划的 Store Action（预览）

```typescript
// 计划添加到 resumeStore.ts 中

batchImproveSection: async (payload: { 
  sectionId: string, 
  improvementGoals: string[] 
}) => {
  const { sectionId, improvementGoals } = payload;
  const state = get();
  const section = state.resumeData.sections.find(s => s.id === sectionId);
  
  if (!section) return;
  
  set({ isBatchImproving: sectionId });
  
  try {
    const schemaRegistry = SchemaRegistry.getInstance();
    
    // 获取章节数据
    const sectionData = 'schemaId' in section 
      ? { ...section }
      : { ...section };
      
    // 构建上下文
    const otherSectionsContext = schemaRegistry.stringifyResumeForReview(state.resumeData, [sectionId]);
    
    // 调用批量改进 Flow
    const { batchImproveSection } = await import('@/ai/flows/batch-improve-section');
    const result = await batchImproveSection({
      sectionData: sectionData,
      sectionType: 'schemaId' in section ? section.schemaId : section.type,
      improvementGoals,
      userJobTitle: state.resumeData.personalDetails.jobTitle,
      otherSectionsContext
    });
    
    // 更新状态
    set({
      batchImprovement: {
        sectionId,
        improvedData: result.improvedSectionData,
        summary: result.improvementSummary,
        changes: result.fieldChanges
      },
      isBatchImproving: null
    });
  } catch (error) {
    console.error("Batch improvement error:", error);
    set({ isBatchImproving: null });
  }
}
```

## 扩展指南：如何添加新章节的 AI 支持

得益于新架构，为新章节添加 AI 支持变得极其简单。假设我们要添加一个新的 "Certifications" 章节。

**第 1 步: 定义 `SectionSchema`**

在 `schemaRegistry.ts` 中，为 "Certifications" 创建一个新的 Schema。

```typescript
// In schemaRegistry.ts, inside initializeDefaultSchemas()
const CERTIFICATIONS_SCHEMA: SectionSchema = {
  id: 'certifications',
  name: 'Certifications',
  type: 'list',
  fields: [
    { id: 'name', type: 'text', label: 'Certification Name', aiHints: { contextBuilders: { improve: 'certification-name', autocomplete: 'certification-name' }}},
    { id: 'issuer', type: 'text', label: 'Issuing Organization', aiHints: { contextBuilders: { improve: 'certification-issuer', autocomplete: 'certification-issuer' }}},
    { id: 'date', type: 'date', label: 'Date Obtained' },
  ],
  aiContext: {
    sectionSummaryBuilder: 'certifications-section-summary', // For review & other sections context
    itemSummaryBuilder: 'certification-item-summary',     // For this item's context
  },
  // ... uiConfig
};
this.registerSectionSchema(CERTIFICATIONS_SCHEMA);
```

**第 2 步: 添加 `ContextBuilderFunction`s**

在 `schemaRegistry.ts` 的 `initializeContextBuilders()` 方法中，为上面定义的 builder ID 添加实现。

```typescript
// In initializeContextBuilders()

// For a single field (e.g., the name)
this.registerContextBuilder('certification-name', (data, allData) => {
  return `Certification: ${data.name} from ${data.issuer}`;
});

// For a single item summary
this.registerContextBuilder('certification-item-summary', (itemData, allData) => {
  return `- ${itemData.name} by ${itemData.issuer} (${itemData.date})`;
});

// For the whole section summary
this.registerContextBuilder('certifications-section-summary', (sectionData, allData) => {
  const itemsSummary = sectionData.items.map(item => this.buildContext('certification-item-summary', item.data, allData)).join('\n');
  return `## Certifications\n${itemsSummary}`;
});
```

**完成！**

完成以上两步后，当用户在 UI 中添加 "Certifications" 章节后：
- **Autocomplete** 和 **Improve** 功能将**自动**为 `name` 和 `issuer` 字段工作。
- **Review** 功能将**自动**包含 "Certifications" 章节的摘要。

无需对 `SectionEditor.tsx`, `AutocompleteTextarea.tsx`, 或任何 AI Flow 文件进行任何修改。这就是 Schema 驱动架构的强大之处。 