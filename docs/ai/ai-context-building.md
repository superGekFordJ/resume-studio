# AI Context Building: A Deep Dive (V3)

This document provides a detailed explanation of the AI context building mechanism in Resume Studio, updated to reflect the two-layer caching system and placeholder enhancements.

## Core Principles

1.  **Centralized Logic**: `SchemaRegistry` is the single source of truth for all context building. UI components delegate this task entirely to the registry.
2.  **Schema-Driven**: The structure and content of the context are determined by the `SectionSchema` and `FieldSchema` definitions, specifically the `aiHints` and `aiContext` properties.
3.  **Efficiency**: A two-layer caching system is implemented to minimize redundant computations and reduce AI interaction latency.
4.  **Clarity for AI**: Context is formatted to be concise and machine-readable (`key: value`), and placeholders are used to clearly indicate the user's active editing focus.

## Two-Layer Caching System

To optimize performance, especially when a user is actively typing, we employ two levels of LRU (Least Recently Used) caching.

### Layer 1: `otherSectionsContextCache` (Coarse-grained)

- **Purpose**: Caches the entire generated string for all resume sections _except_ the one currently being edited.
- **Cache Key**: A stable hash of all resume data, excluding the currently focused section (`stableHash(resumeData - currentSection)`).
- **Behavior**:
  - **Cache Hit**: Occurs when the user types or makes changes _within the same section_. Since other sections haven't changed, their combined context can be reused instantly.
  - **Cache Miss**: Occurs when the user **switches editing focus** to a different section (e.g., from 'Summary' to 'Experience'). The definition of "other sections" changes, so this cache must be invalidated and rebuilt.

### Layer 2: `builderCache` (Fine-grained)

- **Purpose**: Caches the output of every individual `ContextBuilderFunction`. This is the workhorse of our caching strategy.
- **Cache Key**: A combination of the builder's unique ID and a stable hash of its input data (`${builderId}:${stableHash(data)}`).
- **Behavior**:
  - When the Layer 1 cache misses (due to a section switch), it triggers a rebuild of the `otherSectionsContext`.
  - During the rebuild, the system calls numerous small builders (e.g., `experience-summary`, `projects-summary`).
  - Since the data for these individual, unchanged sections remains the same, their `stableHash` will be identical to previous calls.
  - This results in a **cache hit** at Layer 2 for each of these builders, preventing costly re-computation. The system only computes context for the truly new parts.

This two-layer system ensures that while the overall context is always fresh, its constituent parts are aggressively cached and reused.

## Placeholder for Active Editing

To provide the LLM with a clear signal about the user's focus, we use a placeholder token.

- **Injection**: When `buildAIContext` is called with an active `inputText`, it replaces the value of the field being edited with a special constant, `SchemaRegistry.CURRENTLY_EDITING_TOKEN` (`'[[CURRENTLY_EDITING]]'`).
- **Rendering**: The individual `ContextBuilderFunction` in `defaultContextBuilders.ts` is responsible for detecting this token. When found, it renders a user-friendly marker, `[*currently being modified*]`, in its place.
- **Benefit**: This prevents leaking incomplete, low-quality user input to the AI and explicitly tells the model which field to focus its improvements on, while still using the surrounding fields for context.

## Debugging the Cache

To observe the caching mechanism in action, you can enable console logs by setting an environment variable.

1.  Create or open the `.env.local` file in the project root.
2.  Add the following line:
    ```
    NEXT_PUBLIC_DEBUG_CACHE=true
    ```
3.  Restart your development server.

You will now see green `[Cache Hit]` and red `[Cache Miss]` messages in your browser's developer console during AI operations, clearly indicating the behavior of both caching layers.
