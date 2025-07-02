"use client"

import * as React from "react"
import {
  createEditor,
  Editor,
  Transforms,
  Descendant,
  Text as SlateText,
  Element,
  Range,
} from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { withHistory } from "slate-history"
import { cn } from "@/lib/utils"
import type { CustomText, ParagraphElement } from "./types"

// ------------------------------
// Props
// ------------------------------
export interface AICompletionsTextareaProps {
  value: string
  onValueChange: (value: string) => void
  /** Simple suggestion function */
  getSuggestion?: (text: string) => Promise<string>
  /** Context-aware suggestion function.  Takes precedence over getSuggestion if provided. */
  getSuggestionWithContext?: (
    payload: {
      text: string
      cursorContext: { before: string; after: string }
    }
  ) => Promise<string>
  debounceTime?: number
  disabled?: boolean
  placeholder?: string
  className?: string
  rows?: number
  maxLength?: number
  resize?: "none" | "both" | "horizontal" | "vertical"
  onKeyDown?: (event: React.KeyboardEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
  // Lifecycle hooks for orchestration
  onSuggestionFetch?: () => void
  onSuggestionReceived?: (suggestion: string) => void
  onSuggestionError?: (error: unknown) => void
}

// ------------------------------
// Helper predicates
// ------------------------------
const isGhostText = (n: unknown): n is CustomText =>
  SlateText.isText(n as any) && "ghost" in (n as CustomText) && !!(n as CustomText).ghost

// ------------------------------
// Component
// ------------------------------
export function AICompletionsTextarea({
  value,
  onValueChange,
  getSuggestion,
  getSuggestionWithContext,
  debounceTime = 300,
  disabled = false,
  placeholder = "Type here…",
  className,
  rows = 3,
  maxLength,
  resize = "vertical",
  onKeyDown,
  onFocus,
  onBlur,
  onSuggestionFetch,
  onSuggestionReceived,
  onSuggestionError,
}: AICompletionsTextareaProps) {
  // Initialise Slate editor
  const [editor] = React.useState(() => withHistory(withReact(createEditor())) as ReactEditor)

  // Flag to avoid recursive onChange loops when performing programmatic
  // transformations (e.g., inserting/clearing ghost nodes).
  const isProgrammaticChange = React.useRef(false)

  // Suggestion loading state (for spinner / parent orchestration)
  const [isLoading, setIsLoading] = React.useState(false)

  // A separate state to hold the string content for measurement.
  // This avoids calling Editor.string() directly in the render path.
  const [measuredValue, setMeasuredValue] = React.useState(value || "")

  // Track focus state to control suggestion fetching.
  const [isFocused, setIsFocused] = React.useState(false)

  // Debounce timer for suggestion fetch
  const debounceRef = React.useRef<NodeJS.Timeout>()

  // For contextual suggestions we need quick access to before/after text.
  const [cursorContext, setCursorContext] = React.useState<{
    before: string
    after: string
  }>({ before: "", after: "" })

  // ------------------------------
  // Slate initial value (single empty paragraph)
  // ------------------------------
  const initialValue: Descendant[] = React.useMemo(
    () => [
      {
        type: "paragraph",
        children: [{ text: "" } as CustomText],
      } as ParagraphElement,
    ],
    [] // Static initial value - we'll sync the actual value in useEffect
  )

  // ------------------------------
  // Utility – scan editor for ghost nodes
  // ------------------------------
  const hasGhostNodes = React.useCallback((): boolean => {
    for (const _ of Editor.nodes(editor, { at: [], match: isGhostText })) {
      return true
    }
    return false
  }, [editor])

  // ------------------------------
  // Transform helpers
  // ------------------------------
  const clearGhostNodes = React.useCallback(() => {
    isProgrammaticChange.current = true
    Transforms.removeNodes(editor, {
      at: [],
      match: (n, p) => !Editor.isEditor(n) && SlateText.isText(n) && !!n.ghost,
    })

    // Ensure the editor remains valid after removal
    const [firstParagraph] = Editor.nodes(editor, {
      at: [0],
      match: (n, p) => Element.isElement(n) && n.type === "paragraph",
    })

    if (firstParagraph) {
      const [pNode, pPath] = firstParagraph
      if (Element.isElement(pNode) && pNode.children.length === 0) {
        Transforms.insertNodes(editor, { text: "" }, { at: pPath.concat(0) })
      }
    }
    
    isProgrammaticChange.current = false
  }, [editor])

  const acceptGhostNodes = React.useCallback(() => {
    isProgrammaticChange.current = true
    Transforms.setNodes<CustomText>(
      editor,
      { ghost: undefined },
      {
        at: [],
        match: (n, p) => !Editor.isEditor(n) && SlateText.isText(n) && !!n.ghost,
      }
    )
    isProgrammaticChange.current = false
  }, [editor])

  const insertGhostSuggestion = React.useCallback(
    (suggestionText: string) => {
      if (!editor.selection) return
      if (!suggestionText) return

      // First clear any existing ghost nodes so we don't stack suggestions.
      clearGhostNodes()

      isProgrammaticChange.current = true
      const ghostNode: CustomText = {
        text: suggestionText,
        ghost: true,
      }
      // Insert immediately at current selection (which is where the user is typing)
      Transforms.insertNodes(editor, ghostNode, { at: editor.selection })
      isProgrammaticChange.current = false
    },
    [editor, clearGhostNodes]
  )

  // ------------------------------
  // External value → editor synchronisation
  // ------------------------------
  React.useEffect(() => {
    if (isProgrammaticChange.current) return
    
    const current = Editor.string(editor, [])
    if (current !== value) {
      isProgrammaticChange.current = true
      
      // Ensure we have a valid selection, or create one
      if (!editor.selection) {
        Transforms.select(editor, Editor.start(editor, []))
      }
      
      // Replace all content with new value
      Transforms.select(editor, {
        anchor: Editor.start(editor, []),
        focus: Editor.end(editor, []),
      })
      
      // Always ensure we have at least empty text
      Transforms.insertText(editor, value || "")
      
      isProgrammaticChange.current = false
    }
  }, [value, editor])

  // ------------------------------
  // Cursor context computation (cheap, synchronous)
  // ------------------------------
  const updateCursorContext = React.useCallback(() => {
    const sel = editor.selection
    if (!sel) return
    
    try {
      const before = Editor.string(editor, {
        anchor: Editor.start(editor, []),
        focus: sel.anchor,
      })
      const after = Editor.string(editor, {
        anchor: sel.anchor,
        focus: Editor.end(editor, []),
      })
      setCursorContext({ before, after })
    } catch (error) {
      // Silently handle cases where editor doesn't have valid text nodes yet
      console.warn("Failed to update cursor context:", error)
      setCursorContext({ before: "", after: "" })
    }
  }, [editor])

  // ------------------------------
  // Suggestion fetching (debounced)
  // ------------------------------
  React.useEffect(() => {
    if (!isFocused || hasGhostNodes()) {
      return
    }

    if (
      !(getSuggestion || getSuggestionWithContext) ||
      !value.trim() ||
      disabled
    ) {
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    // Do not fetch suggestions if the current selection is a range (i.e., user has selected text).
    const sel = editor.selection;
    if (sel && !Range.isCollapsed(sel)) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        onSuggestionFetch?.()
        setIsLoading(true)
        const suggestion = getSuggestionWithContext
          ? await getSuggestionWithContext({
              text: value,
              cursorContext,
            })
          : await (getSuggestion?.(value) ?? "")

        const sanitized = suggestion ?? ""
        if (sanitized && !hasGhostNodes()) {
          insertGhostSuggestion(sanitized)
        }
        onSuggestionReceived?.(sanitized)
      } catch (err) {
        console.error("Suggestion fetch error", err)
        onSuggestionError?.(err)
      } finally {
        setIsLoading(false)
      }
    }, debounceTime)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    value,
    cursorContext,
    getSuggestion,
    getSuggestionWithContext,
    debounceTime,
    disabled,
    insertGhostSuggestion,
    onSuggestionFetch,
    onSuggestionReceived,
    onSuggestionError,
    hasGhostNodes,
    isFocused,
  ])

  // ------------------------------
  // Handlers
  // ------------------------------
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      onKeyDown?.(event)
      if (disabled) return

      const ghostActive = hasGhostNodes()

      if (ghostActive) {
        if (
          event.key === "Tab" ||
          event.key === "ArrowRight" ||
          event.key === "Enter"
        ) {
          // Accept suggestion
          event.preventDefault();
          const prevSel = editor.selection ? { ...editor.selection } : null;
          acceptGhostNodes();

          // After accepting suggestion, move cursor to just after the text we inserted.
          // Simplest heuristic: move to end of editor; this covers common case of typing at end.
          Transforms.select(editor, Editor.end(editor, []));

          // Update external value after mutation
          const newText = Editor.string(editor, []);
          onValueChange(newText);
          setMeasuredValue(newText);
          return;
        }

        if (event.key === "Escape") {
          event.preventDefault()
          clearGhostNodes()
          return
        }

        // Handle Backspace and Delete as dismissal actions
        if (event.key === "Backspace" || event.key === "Delete") {
          clearGhostNodes()
          // Do not preventDefault, allow the key's default action to proceed
        }
      }

      // If user starts typing while ghost is visible, clear it implicitly.
      if (
        !event.metaKey &&
        !event.ctrlKey &&
        event.key.length === 1 &&
        ghostActive
      ) {
        clearGhostNodes()
      }

      // Disallow newline when rows === 1 (single-line behaviour)
      if (rows === 1 && event.key === "Enter") {
        event.preventDefault()
      }
    },
    [
      onKeyDown,
      disabled,
      hasGhostNodes,
      clearGhostNodes,
      acceptGhostNodes,
      rows,
      editor,
      onValueChange,
    ]
  )

  const handleChange = React.useCallback(
    (val: Descendant[]) => {
      // If the change is just a cursor move and ghosts are visible, clear them.
      const isJustSelection = editor.operations.every(
        (op) => op.type === "set_selection"
      )
      if (isJustSelection && hasGhostNodes()) {
        clearGhostNodes()
      }

      const newText = Editor.string(editor, [])
      setMeasuredValue(newText)

      if (isProgrammaticChange.current) return

      if (maxLength && newText.length > maxLength) {
        return
      }
      onValueChange(newText)
      updateCursorContext()
    },
    [
      editor,
      onValueChange,
      maxLength,
      updateCursorContext,
      hasGhostNodes,
      clearGhostNodes,
    ]
  )

  // ------------------------------
  // Leaf renderer (styles ghost nodes)
  // ------------------------------
  const renderLeaf = React.useCallback(
    ({ attributes, children, leaf }: any) => {
      const isGhost = isGhostText(leaf)
      return (
        <span
          {...attributes}
          className={cn(isGhost && "opacity-50 italic")}
          contentEditable={isGhost ? false : undefined}
          style={isGhost ? { userSelect: "none" } : undefined}
        >
          {children}
        </span>
      )
    },
    []
  )

  // ------------------------------
  // Dynamic height (auto-resize)
  // ------------------------------
  const measureRef = React.useRef<HTMLDivElement>(null)
  const [dynamicHeight, setDynamicHeight] = React.useState<number>()

  React.useLayoutEffect(() => {
    if (!measureRef.current) return
    const h = measureRef.current.scrollHeight
    if (h && h !== dynamicHeight) setDynamicHeight(h)
  })

  const resizeClass =
    {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x",
      vertical: "resize-y",
    }[resize] || ""

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className={cn("relative", className)}>
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <div
          className={cn(
            "relative w-full rounded-md border border-input bg-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          )}
        >
          <Editable
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            disabled={disabled}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              setIsFocused(true)
              updateCursorContext()
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              if (debounceRef.current) clearTimeout(debounceRef.current)
              if (hasGhostNodes()) {
                clearGhostNodes()
              }
              onBlur?.(e)
            }}
            className={cn(
              "relative z-20 w-full bg-transparent py-2 px-3 text-base outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm whitespace-pre-wrap break-words leading-6",
              resizeClass
            )}
            style={{
              minHeight: `${rows * 1.5}rem`,
              height: dynamicHeight ? `${dynamicHeight}px` : undefined,
            }}
          />
          {/* Hidden measurement div for auto-resize */}
          <div
            ref={measureRef}
            className="invisible absolute whitespace-pre-wrap break-words px-3 py-2 text-base md:text-sm leading-6"
          >
            {measuredValue || "\u200b"}
          </div>
        </div>
        {isLoading && (
          <div className="absolute right-2 top-2 h-4 w-4 z-30">
            <div className="h-full w-full animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          </div>
        )}
      </Slate>
    </div>
  )
} 