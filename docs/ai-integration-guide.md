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

### 3. 标准化的数据流

```
1. UI Component
   - Captures user action (e.g., text input, button click).
   - Creates a simple `AIContextPayload`.
   - Calls `schemaRegistry.buildAIContext(payload)`.

2. SchemaRegistry
   - Receives the payload.
   - Finds the correct `SectionSchema` and `FieldSchema`.
   - Uses the `contextBuilders` defined in the schema to generate a `StructuredAIContext` object.

3. AI Flow
   - Receives the `StructuredAIContext` object.
   - Uses the structured data in its prompt template.
   - Executes the AI task.

4. UI Component
   - Receives the result from the AI Flow.
   - Updates the UI.
```

## AI 功能详解

### 1. 自动补全 (Autocomplete) & 内容改进 (Improvement)

这两个功能遵循完全相同的数据流。

#### 实现位置
- **Flows**:
  - `src/ai/flows/autocomplete-input.ts`
  - `src/ai/flows/improve-resume-section.ts`
- **UI 集成**:
  - `src/components/resume/AutocompleteTextarea.tsx`
  - `src/components/resume/SectionEditor.tsx`

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

#### UI 调用示例

```typescript
// In SectionEditor.tsx (for Improve) or AutocompleteTextarea.tsx (for Autocomplete)

// 1. Create the payload
const payload: AIContextPayload = {
  resumeData,
  task: 'improve', // or 'autocomplete'
  sectionId,
  itemId,
  fieldId,
};

// 2. Build the structured context
const context = schemaRegistry.buildAIContext(payload);

// 3. Call the AI Flow with the context
const result = await improveResumeSection({
  resumeSection: textToImprove,
  prompt: aiPrompt,
  context: context, // Pass the entire context object
  sectionType: sectionType, // Optional: pass for UI logic if needed
});
```
这种方法消除了在 UI 组件中手动构建字符串的需要，使代码更清洁、更易于维护。

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