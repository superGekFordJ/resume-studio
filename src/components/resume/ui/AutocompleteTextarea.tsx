// src/components/resume/ui/AutocompleteTextarea.tsx
'use client';

import React from 'react';
import { CopilotTextarea } from 'copilot-react-textarea';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useCallback, useRef } from 'react';
import { autocompleteInput } from '@/ai/flows/autocomplete-input';
import { schemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import type { AutocompleteModel } from '@/stores/types';
import { cn } from '@/lib/utils';
import MarkdownFloatingToolbar from './MarkdownFloatingToolbar';
import { toast } from '@/hooks/use-toast';
import { streamFlow } from '@genkit-ai/next/client';
import type { GenerateOrImproveTextStreamFlowType } from '@/ai/flows/generate-or-improve-text-stream';

// Interface updated to remove large, unnecessary data props.
interface AutocompleteTextareaProps
  extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  sectionType?: string; // Allow dynamic schema IDs
  isAutocompleteEnabledGlobally: boolean;
  autocompleteModel: AutocompleteModel;
  sectionId: string;
  itemId?: string;
  isFocusMode?: boolean;
  isMarkdownEnabled?: boolean;
}

export default React.memo(function AutocompleteTextarea({
  value,
  onValueChange,
  sectionType,
  isAutocompleteEnabledGlobally,
  autocompleteModel,
  sectionId,
  itemId,
  className,
  isFocusMode,
  isMarkdownEnabled = false,
  ...props
}: AutocompleteTextareaProps) {
  // useRef to solve the timing issue: When a suggestion is accepted via Tab key,
  // the component's text updates, triggering another suggestion call.
  // Standard state/props are too slow to update and block this second call.
  // A ref provides an immediate, synchronous way to flag that a suggestion
  // was just accepted, allowing us to block the subsequent redundant API call.
  const suggestionJustAccepted = useRef(false);

  const createSuggestion = useCallback(
    async (data: {
      textBeforeCursor: string;
      textAfterCursor: string;
    }): Promise<string> => {
      // If a suggestion was just accepted, block this subsequent call.
      if (suggestionJustAccepted.current) {
        suggestionJustAccepted.current = false; // Reset for the next user action.
        return '';
      }

      // Guard: Do not suggest if autocomplete is disabled or if there's no text.
      if (!isAutocompleteEnabledGlobally || !data.textBeforeCursor.trim()) {
        return '';
      }

      // Skip autocomplete for personal details fields
      if (sectionType === 'personalDetailsField') {
        return '';
      }

      try {
        // NEW: Get fresh data from the store inside the callback, preventing re-renders.
        const { resumeData, aiConfig } = useResumeStore.getState();

        // 1. Build context using our existing SchemaRegistry
        const context = schemaRegistry.buildAIContext({
          resumeData,
          task: 'autocomplete',
          sectionId: sectionId,
          fieldId: props.name || '',
          itemId: itemId,
          aiConfig: aiConfig,
          inputText: data.textBeforeCursor,
          textAfterCursor: data.textAfterCursor,
        });

        // 2. Call our existing Genkit flow
        const result = await autocompleteInput({
          inputText: data.textBeforeCursor,
          textAfterCursor: data.textAfterCursor,
          context: context,
          sectionType: sectionType,
          autocompleteModel: autocompleteModel,
        });

        const completion = (result.completion || '').trim();

        // After getting a completion, we perform a final check.
        // If the input text already ends with the suggestion (ignoring whitespace),
        // it's highly likely the suggestion was just accepted or is already present.
        // This prevents appending duplicate content.
        if (completion && data.textBeforeCursor.trim().endsWith(completion)) {
          return '';
        }

        // 3. Return the completion string
        return completion;
      } catch {
        return ''; // Return empty string on error
      }
    },
    [
      sectionId,
      props.name,
      itemId,
      isAutocompleteEnabledGlobally,
      sectionType,
      autocompleteModel,
    ]
  );

  const createInsertionOrEditing = async (
    data: {
      textBeforeCursor: string;
      textAfterCursor: string;
      selectedText: string;
    },
    prompt: string,
    abortSignal?: AbortSignal
  ): Promise<ReadableStream<string>> => {
    // Guard: For personal details we don't have rich context; show a soft toast and no-op stream.
    if (sectionType === 'personalDetailsField') {
      toast({
        title: 'AI edit not optimal for Personal Details',
        description:
          'This field usually contains private information. AI editing is disabled here to avoid unintended changes.',
      });
      return new ReadableStream<string>({
        start(controller) {
          controller.close();
        },
      });
    }

    try {
      const { resumeData, aiConfig } = useResumeStore.getState();

      // Build AI context for 'improve' task (builder-aligned)
      const context = schemaRegistry.buildAIContext({
        resumeData,
        task: 'improve',
        sectionId: sectionId,
        fieldId: props.name || '',
        itemId: itemId,
        aiConfig: aiConfig,
        inputText: data.selectedText || data.textBeforeCursor,
        textAfterCursor: data.textAfterCursor,
      });

      // Use only the minimal field-centric context for this task
      const slimContext = {
        currentItemContext: context.currentItemContext,
        userJobTitle: context.userJobTitle,
        userJobInfo: context.userJobInfo,
        userBio: context.userBio,
      };

      // Do not import server types at runtime to keep client bundle lean.
      const payload = {
        prompt,
        context: slimContext,
        textToImprove: data.selectedText || undefined,
        textBeforeCursor: data.textBeforeCursor,
        textAfterCursor: data.textAfterCursor,
        sectionType: sectionType || '',
      } as const;

      // Use official Next client helper to stream from our flow route
      const result = streamFlow<GenerateOrImproveTextStreamFlowType>({
        url: '/api/ai/generate-or-improve/stream',
        input: payload,
      });

      const gen = result.stream as AsyncGenerator<string>;

      // Adapt AsyncGenerator<string> to a ReadableStream<string>
      return new ReadableStream<string>({
        start(controller) {
          let cancelled = false;
          const pump = async () => {
            try {
              for await (const chunk of gen) {
                if (cancelled) break;
                if (chunk) controller.enqueue(chunk);
              }
            } catch {
              // Swallow to avoid UI crashes; errors are logged server-side
            } finally {
              controller.close();
            }
          };
          pump();

          const onAbort = () => {
            cancelled = true;
          };
          abortSignal?.addEventListener('abort', onAbort, { once: true });
        },
      });
    } catch (err) {
      console.error('[AutocompleteTextarea] insertionOrEditing error:', err);
      return new ReadableStream<string>({
        start(controller) {
          controller.close();
        },
      });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
  };

  // SIMPLIFIED: Only handle regular inline (ghost text) suggestions
  const handleKeyDown = (
    event:
      | Partial<KeyboardEvent<HTMLTextAreaElement>>
      | KeyboardEvent<HTMLDivElement>
  ) => {
    // Handle regular inline suggestions with Tab key
    if (event.key === 'Tab') {
      suggestionJustAccepted.current = true;
      console.log(
        `[${new Date().toISOString()}] --- AutocompleteTextarea: Tab pressed for INLINE suggestion. Setting block flag.`
      );
    }
  };

  // UPDATED: No longer display forcedSuggestion - use dialog-based approach instead
  const displayValue = value; // Always use the actual value
  const isDisplayingForcedSuggestion = false; // Never display forced suggestions in textarea

  return (
    <div className="relative w-full h-full">
      <CopilotTextarea
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        debounceTime={500}
        disableWhenEmpty={false}
        placeholder={isDisplayingForcedSuggestion ? '' : props.placeholder}
        textareaPurpose="resume-field"
        // Pass through our standard shadcn/ui textarea styles
        className={cn(
          'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          isDisplayingForcedSuggestion
            ? 'text-muted-foreground caret-foreground'
            : 'text-foreground',
          isFocusMode && 'h-full w-full overflow-y-auto',
          className
        )}
        // The core of the integration: hook up our AI logic
        createSuggestionFunction={createSuggestion}
        // This is a required prop. We return a rejected promise to effectively
        // disable it and prevent any further action or network requests.
        insertionOrEditingFunction={createInsertionOrEditing}
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        rows={props.rows}
        cols={props.cols}
        insideSlateChildren={
          isMarkdownEnabled ? (
            <MarkdownFloatingToolbar enableAIModifyButton />
          ) : undefined
        }
      />
      {/* REMOVED: forcedSuggestion UI hint - now using dialog-based approach */}
    </div>
  );
});
