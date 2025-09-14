# Streaming Flows: 实现与集成指南

本指南说明如何在 Resume Studio 中实现和集成基于 Genkit 的流式输出（Streaming）AI Flow，并在前端无缝消费。

## 目录

- 背景与目标
- 端到端架构
- Flow 实现（服务端）
- Prompt 设计规范
- 前端集成（客户端）
- 取消/错误处理
- Schema 与类型
- 常见问题

## 背景与目标

在编辑体验中，用户希望“边生成边看到结果”。传统一次性返回的 AI 调用不能满足这一点。我们采用 Genkit Flow 的 `streamSchema` 功能，结合 `@genkit-ai/next` 提供的 `appRoute/streamFlow`，实现端到端的低耦合流式输出方案。

## 端到端架构

- Flow：`ai.defineFlow({... streamSchema })` 开启流式输出，通过 `sendChunk()` 发送字符串增量。
- API Route：`@genkit-ai/next` 的 `appRoute()` 一行封装，自动暴露 Flow 为 Next 路由。
- Client：`@genkit-ai/next/client` 的 `streamFlow()` 返回 `AsyncGenerator<string>`，前端将其适配为 `ReadableStream<string>` 以驱动 UI。
- 上下文：流式任务遵循“字段中心”最小上下文，仅传 `currentItemContext` 与全局上下文（`userJobTitle/userJobInfo/userBio`）。

## Flow 实现（服务端）

文件：`src/ai/flows/generate-or-improve-text-stream.ts`

要点：
- `streamSchema: z.string()` 代表每个 chunk 为纯字符串。
- Flow 内部通过 `ai.prompt('...').stream(input)` 获取 `{ stream, response }`。
- `for await (const chunk of stream)` 中使用 `sendChunk(chunk.text)` 逐条下发。
- 保留 `outputSchema` 的完整最终结果（如 `{ finalText }`），客户端可忽略。

API 路由：`src/app/api/ai/generate-or-improve/stream/route.ts`

```ts
import { appRoute } from '@genkit-ai/next';
import { generateOrImproveTextStreamFlow } from '@/ai/flows/generate-or-improve-text-stream';

export const POST = appRoute(generateOrImproveTextStreamFlow);
```

### AutocompleteTextarea 变化说明（2025-09）

文件：`src/components/resume/ui/AutocompleteTextarea.tsx`

- 功能演进：
  - 新增 `createInsertionOrEditing()` 的流式调用路径，改为使用 `@genkit-ai/next/client` 的 `streamFlow()`，避免客户端打包服务端代码。
  - 将 `AsyncGenerator<string>` 适配为 `ReadableStream<string>`，以对接 `CopilotTextarea` 的流式渲染。
  - 保持与现有 `createSuggestion()`（autocomplete 热路径）并存，二者互不干扰。

- 守卫与体验：
  - 移除对“全局自动补全开关”的阻断；该开关仅用于 autocomplete，不影响本流式编辑。
  - 对 `personalDetailsField` 提供温和 toast 提示并禁用 AI 编辑，避免对个人敏感信息的非预期修改。

- 上下文与任务：
  - 通过 `schemaRegistry.buildAIContext({ task: 'improve', ... })` 构建上下文，复用既有 builders 与缓存策略。
  - 仅传字段中心最小上下文与全局信息（`currentItemContext`, `userJobTitle`, `userJobInfo`, `userBio`）。
  - 透明传递三段文本：`textBeforeCursor` / `textToImprove?` / `textAfterCursor`。

- 取消与错误：
  - 通过 `AbortSignal` 停止消费 `AsyncGenerator`；异常在客户端被吞掉，服务端记录日志。

### 迁移提示（与旧实现对比）

- 旧：手动 `fetch` 自定义 streaming 端点并手动解码字节流。
- 新：使用 `appRoute(flow)` + `streamFlow({ url, input })`，减少样板代码，提升稳定性与类型一致性。

<!-- Prompt 相关约定已移除：本文件仅聚焦于 Flow 与客户端集成。-->

## 前端集成（客户端）

示例：`src/components/resume/ui/AutocompleteTextarea.tsx`

- 通过 `schemaRegistry.buildAIContext({ task: 'improve', ... })` 构建上下文
- 适配 `streamFlow()` 结果为 `ReadableStream<string>`，供 `CopilotTextarea` 消费
- 个人信息字段（personal details）展示柔和 toast，并跳过 AI 调用

核心片段：

```tsx
const result = streamFlow({
  url: '/api/ai/generate-or-improve/stream',
  input: payload,
});

const gen = result.stream as AsyncGenerator<string>;
return new ReadableStream<string>({
  start(controller) {
    let cancelled = false;
    (async () => {
      try {
        for await (const chunk of gen) {
          if (cancelled) break;
          if (chunk) controller.enqueue(chunk);
        }
      } finally {
        controller.close();
      }
    })();

    abortSignal?.addEventListener('abort', () => {
      cancelled = true;
    }, { once: true });
  },
});
```

## 取消/错误处理

- 取消：前端用 `AbortSignal`/布尔标志停止消费 `AsyncGenerator`。
- 错误：
  - 服务端：捕获并记录（不要泄露敏感信息）
  - 客户端：吞掉流消费异常，避免 UI 崩溃；必要时展示 toast

## Schema 与类型

- `streamSchema: z.string()` 表示 chunk 为文本
- `GenerateOrImproveTextInputSchema`：仅包含必要上下文与光标/替换范围
- `GenerateOrImproveTextOutputSchema`：提供最终拼接文本字段（如 `finalText`），客户端可选用

## 常见问题

- 为什么还要 `outputSchema`？
  - 便于日志、对账或回退策略；流式 UI 可以只消费 chunk。
- 是否需要其他上下文（如其他章节）？
  - 该流式场景以“字段中心”为主，保持最小上下文即可（延迟更小，结果更稳定）。
- 是否可以更换模型或 provider？
  - Flow/Prompt 已解耦，保持规范即可自由替换。
