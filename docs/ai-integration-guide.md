# A4 Resume Studio - AI 集成指南

## AI 功能概述

A4 Resume Studio 集成了四个核心 AI 功能，基于 Google Genkit 和 Gemini API 实现：

1. **自动补全 (Autocomplete)** - 智能文本补全建议
2. **内容改进 (Content Improvement)** - AI 驱动的文本优化
3. **批量改进 (Batch Improvement)** - 针对特定章节的批量内容优化
4. **简历评审 (Resume Review)** - 全面的简历质量分析

## 全局 AI 配置与上下文 (Updated 2025-06-23)

### AIManager - 智能 AI 提供商管理

应用现在使用 `AIManager` 单例来管理 AI 提供商实例：

```typescript
// src/ai/AIManager.ts
class AIManager {
  // 缓存的 Genkit 实例，只在配置改变时重新创建
  private activeInstance: ReturnType<typeof genkit> | null = null;
  private activeConfig: AIConfig | null = null;
  
  public getGenkit(config: AIConfig): ReturnType<typeof genkit> {
    // 深度比较配置，如果相同则返回缓存的实例
    if (this.activeInstance && _.isEqual(this.activeConfig, config)) {
      return this.activeInstance;
    }
    // 否则创建新实例
  }
}
```

### 全局上下文增强

用户现在可以通过设置面板提供全局上下文信息：

- **targetJobInfo**: 目标职位信息
- **userBio**: 专业背景描述

这些信息会自动注入到所有 AI 操作中，提供更个性化的建议。

### API Key 管理优先级

系统使用智能的 API Key 管理策略：

1. **用户界面提供的 Key**（最高优先级）
   - 通过设置面板输入
   - 仅存储在内存中，刷新页面后需要重新输入
   
2. **开发环境变量**（仅在开发模式下）
   - `GOOGLE_API_KEY` 或 `GOOGLE_GENAI_API_KEY`
   - 从 `.env.local` 文件读取
   
3. **默认认证**（最低优先级）
   - 使用 Genkit 的默认认证机制

```typescript
// 在 AIManager 中的实现
let apiKeyToUse = config.apiKey;
if (!apiKeyToUse && process.env.NODE_ENV === 'development') {
  if (config.provider === 'google') {
    apiKeyToUse = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  }
}
```

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

### 4. 标准化的数据流 (Enhanced with Global Context)

```
1. UI Component
   - 捕获用户操作（如点击"改进"按钮）
   - 派发 Store Action（如 startAIImprovement）
   - 传递必要的参数（sectionId, fieldId, uniqueFieldId 等）

2. Zustand Store Action
   - 接收参数并设置加载状态
   - 从 state 获取 aiConfig（包含 targetJobInfo 和 userBio）
   - 调用 schemaRegistry.buildAIContext(payload + aiConfig)
   - 调用相应的 AI Flow
   - 处理结果并更新状态

3. SchemaRegistry
   - 接收 payload 和 aiConfig
   - 找到正确的 SectionSchema 和 FieldSchema
   - 使用 schema 中定义的 contextBuilders 生成 StructuredAIContext
   - 注入全局上下文字段（targetJobInfo, userBio）

4. AI Flow
   - 接收增强的 StructuredAIContext（包含全局上下文）
   - 在 prompt 模板中使用结构化数据和全局上下文
   - 执行 AI 任务
   - 返回结果给 Store Action

5. UI Component
   - 订阅 Store 中的相关状态（如 aiImprovement）
   - 根据状态更新 UI（如显示 AI 建议）
```

## AI 功能详解

### 1. 自动补全 (Autocomplete) - 热路径优化

自动补全功能是性能最敏感的AI交互，因此它采用了一种特殊的、优化的**"热路径"**数据流。

#### 实现位置
- **Flow**: `src/ai/flows/autocomplete-input.ts`
- **UI 集成**: `src/components/resume/ui/AutocompleteTextarea.tsx`

#### `AutocompleteTextarea.tsx` 实现说明

`AutocompleteTextarea.tsx` 组件已被完全重构，以使用 `copilot-react-kit` 库，提供了更优越的、光标感知的内联自动补全体验。

关键实现细节：

-   **适配器模式**: 该组件作为 `copilot-react-kit` 的一个"智能包装器"或适配器。它保持了一个与旧组件几乎完全相同的 props 接口，确保了与调用方（如 `AIFieldWrapper.tsx`）的向后兼容性。
-   **"热路径"调用**: 为了将延迟降至最低，该组件**不通过Zustand Store**来发起AI调用。相反，它的 `createSuggestion` 函数会：
    1.  同步地从 `SchemaRegistry` 请求构建AI上下文。
    2.  直接 `await` 调用 `autocompleteInput` 这个Genkit Flow。
    3.  将返回的建议直接用于UI渲染。
-   **防抖机制**: 组件利用 `copilot-react-kit` 原生的 `debounceTime` prop 来控制 AI 建议的请求频率，防止了不必要的 API 调用。
-   **竞态条件处理**: 使用一个基于 `useRef` 的标志 (`suggestionJustAccepted`) 来解决一个关键的时序问题。当用户使用 `Tab` 键接受一个内联建议时，该标志会被立即设置。这可以防止组件因文本变化而触发冗余的、二次的 API 调用。
-   **双重建议系统**: 组件无缝地处理两种类型的建议：
    1.  **内联自动补全**: 由组件的 `createSuggestionFunction` 提供的标准"幽灵文本"。
    2.  **强制建议**: 从 Zustand store 通过 `forcedSuggestion` prop 传递下来的 AI *改进*建议。组件会正确地优先显示强制建议，并通过一个专用的 `onKeyDown` 处理器来处理它们的接受 (`Tab`) 和拒绝 (`Escape`) 操作。

关于此组件当前的局限性和未来的改进，请参阅 `docs/FIXES_SUMMARY.md` 文档。

### 2. 内容改进 (Content Improvement) - 冷路径标准流程

内容改进功能遵循标准的**"冷路径"**数据流，所有交互都由 Zustand store 协调。

#### 实现位置
- **Flow**: `src/ai/flows/improve-resume-section.ts`
- **Store**: `src/stores/resumeStore.ts` (在 `startAIImprovement` action 中)
- **UI**: `src/components/resume/editor/AIFieldWrapper.tsx`

#### 输入参数 (Zod Schema in Flow)

`improve-resume-section` Flow 的输入 Schema 接收一个统一的 `context` 对象。

```typescript
// in improve-resume-section.ts
const InputSchema = z.object({
  // ... other fields like prompt
  
  context: z.object({
    currentItemContext: z.string(), // The specific context for the item being edited.
    otherSectionsContext: z.string(), // A summary of all other sections.
    userJobTitle: z.string().optional(), // The user's target job title.
  }).describe('Structured context from SchemaRegistry'),
  
  // Optional field for backward compatibility or UI hints
  sectionType: z.string().optional(), 
});
```

#### Store Action 调用示例

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

### 3. 简历评审 (Resume Review)

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

## 2025-06-30 重大更新：Dotprompt 全面迁移与 Schema 注册

> 这一节记录了 **2025-06-30** 合并的重大重构：
>
> * 全部 Genkit Flow 迁移到 **Dotprompt** 文件格式。
> * 所有 Zod Schema 通过 `ai.defineSchema()` **显式注册**。
> * Flow 代码全部使用 **`ai.prompt<Input, Output>()` 泛型**，端到端类型安全。
> * 引入 **自定义助手 buildDataUri** 解决多模态 Data-URI 拼接问题。

### 1. `src/ai/prompts/` 目录

所有 prompt 现在位于 `src/ai/prompts/`。每个文件都遵循统一的 YAML Front-matter：

```yaml
---
# (可选) 指定模型；省略则使用 genkit.ts 中的默认模型
aodel: googleai/gemini-2.5-flash
# (可选) 模型配置
aonfig:
  temperature: 0.7
# 输入/输出 schema 使用 **已注册名称**
input:
  schema: MyInputSchema
output:
  schema: MyOutputSchema
---
```

*表体* 为 Handlebars 模板，完全脱离 TypeScript 代码。

### 2. `src/ai/prompts/schemas.ts`

所有 Zod schema 皆通过 `ai.defineSchema()` 注册，例如：

```ts
export const MyInputSchema = ai.defineSchema(
  'MyInputSchema',
  z.object({ foo: z.string() })
);
```

这样在 `.prompt` 中只需写：

```yaml
input:
  schema: MyInputSchema
```

Genkit 会自动解析并提供静态类型。

### 3. Flow 调用约定

```ts
const prompt = ai.prompt<typeof MyInputSchema, typeof MyOutputSchema>('myPrompt');
const { output } = await prompt(input);
```

不再硬编码模型字符串，也不再 `definePrompt()`。

### 4. 自定义助手 `buildDataUri`

多模态场景需把 `contentType` 与 `base64` 拼成 Data-URI。已在 `src/ai/genkit.ts` 注册全局助手：

```ts
ai.defineHelper('buildDataUri', (ct, b64) => `data:${ct};base64,${b64}`);
```

在 `.prompt` 使用子表达式：

```hbs
{{media url=(buildDataUri contentType imageBase64)}}
```

### 5. Windows ↔︎ Unix 换行

所有 `.prompt` 文件需使用 **LF** 行尾，避免 `\r` 被解析进 schema 名称导致 *Schema not found* 错误。

---