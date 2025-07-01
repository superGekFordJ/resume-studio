// src/components/resume/ui/AutocompleteTextarea.tsx
"use client";

import { CopilotTextarea } from "copilot-react-textarea";
import type { ChangeEvent } from 'react';
import { useCallback, useRef } from 'react';
import { autocompleteInput } from '@/ai/flows/autocomplete-input';
import { schemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import { cn } from "@/lib/utils";
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';

// This interface is kept largely the same to minimize changes in parent components.
interface AutocompleteTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  value: string;
  onValueChange: (value: string) => void;
  userJobTitle?: string;
  sectionType?: string; // Allow dynamic schema IDs
  currentItem?: DynamicSectionItem | { fieldName: string };
  allResumeSections?: DynamicResumeSection[];
  currentSectionId?: string | null;
  forcedSuggestion?: string | null;
  onForcedSuggestionAccepted?: () => void;
  onForcedSuggestionRejected?: () => void;
  isAutocompleteEnabledGlobally: boolean;
  itemId?: string;
}

export default function AutocompleteTextarea({
  value,
  onValueChange,
  userJobTitle,
  sectionType,
  currentItem,
  allResumeSections,
  currentSectionId,
  forcedSuggestion,
  onForcedSuggestionAccepted,
  onForcedSuggestionRejected,
  isAutocompleteEnabledGlobally,
  itemId,
  className,
  ...props
}: AutocompleteTextareaProps) {
  const resumeData = useResumeStore((state: any) => state.resumeData);
  const aiConfig = useResumeStore((state: any) => state.aiConfig);

  // useRef to solve the timing issue: When a suggestion is accepted via Tab key,
  // the component's text updates, triggering another suggestion call.
  // Standard state/props are too slow to update and block this second call.
  // A ref provides an immediate, synchronous way to flag that a suggestion
  // was just accepted, allowing us to block the subsequent redundant API call.
  const suggestionJustAccepted = useRef(false);

  const createSuggestion = useCallback(async (data: { textBeforeCursor: string; textAfterCursor: string }): Promise<string> => {
    // If a suggestion was just accepted, block this subsequent call.
    console.log("textBeforeCursor", data.textBeforeCursor, "textAfterCursor", data.textAfterCursor)
    if (suggestionJustAccepted.current) {
      suggestionJustAccepted.current = false; // Reset for the next user action.
      return "";
    }

    // Guard: Do not suggest if autocomplete is disabled, if there's a forced suggestion from AI Improve, or if there's no text.
    if (!isAutocompleteEnabledGlobally || forcedSuggestion || !data.textBeforeCursor.trim()) {
      return "";
    }
    
    // Skip autocomplete for personal details fields
    if (sectionType === 'personalDetailsField') {
      return "";
    }

    try {
      // 1. Build context using our existing SchemaRegistry
      const context = schemaRegistry.buildAIContext({
        resumeData,
        task: 'autocomplete',
        sectionId: currentSectionId || '',
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
      });

      const completion = (result.completion || "").trim();

      // After getting a completion, we perform a final check.
      // If the input text already ends with the suggestion (ignoring whitespace),
      // it's highly likely the suggestion was just accepted or is already present.
      // This prevents appending duplicate content.
      if (completion && data.textBeforeCursor.trim().endsWith(completion)) {
        return "";
      }

      // 3. Return the completion string
      return completion;
    } catch (error) {
      return ""; // Return empty string on error
    }
  }, [resumeData, currentSectionId, props.name, itemId, isAutocompleteEnabledGlobally, forcedSuggestion, sectionType]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // If there's a forced suggestion and user starts typing, reject it
    if (forcedSuggestion && newValue !== forcedSuggestion && onForcedSuggestionRejected) {
      onForcedSuggestionRejected();
    }
    
    onValueChange(newValue);
  };

  // This handler deals with two distinct scenarios for the Tab key:
  // 1. When a `forcedSuggestion` (from AI Improve) is active.
  // 2. When the user accepts a regular inline (ghost text) suggestion.

  // Scenario 1: Handle forced suggestions (e.g., from "Improve with AI")
  const handleKeyDown = (event: any) => {
    if (forcedSuggestion && event.key) {
      if (event.key === 'Tab') {
        event.preventDefault?.(); // Prevent focus change
        onValueChange(forcedSuggestion);
        if (onForcedSuggestionAccepted) {
          onForcedSuggestionAccepted();
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault?.(); // Prevent other actions
        if (onForcedSuggestionRejected) {
          onForcedSuggestionRejected();
        }
        return;
      }
    }

    // Scenario 2: Handle regular inline suggestions.
    // We set a ref flag here because it's synchronous. State updates are too slow
    // and cannot prevent the immediate re-trigger of `createSuggestion`.
    if (!forcedSuggestion && event.key === 'Tab') {
      suggestionJustAccepted.current = true;
      console.log(`[${new Date().toISOString()}] --- AutocompleteTextarea: Tab pressed for INLINE suggestion. Setting block flag.`);
    }
  };

  // The component correctly prioritizes displaying the `forcedSuggestion` from AI Improve.
  const displayValue = forcedSuggestion || value;
  const isDisplayingForcedSuggestion = !!forcedSuggestion;

  return (
    <div className="relative w-full">
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
          "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isDisplayingForcedSuggestion ? 'text-muted-foreground caret-foreground' : 'text-foreground',
          className
        )}
        // The core of the integration: hook up our AI logic
        createSuggestionFunction={createSuggestion}
        // This is a required prop. We return a rejected promise to effectively
        // disable it and prevent any further action or network requests.
        insertionOrEditingFunction={async () => { throw new Error("Insertion/Editing is not enabled."); }}
        id={props.id}
        name={props.name}
        disabled={props.disabled}
        rows={props.rows}
        cols={props.cols}
      />
      {/* The UI hint for `forcedSuggestion` is a simple "Tab" text.
          A known issue is that there is no equivalent hint for accepting regular inline suggestions.
          See: docs/FIXES_SUMMARY.md */}
      {isDisplayingForcedSuggestion && (
        <span className="absolute top-1.5 right-2 text-xs text-muted-foreground/90 opacity-70 select-none pointer-events-none">Tab</span>
      )}
    </div>
  );
}

