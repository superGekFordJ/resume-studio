"use client"

import * as React from "react"
import { createEditor, BaseEditor, Descendant, Text, Editor, Transforms } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { withHistory } from "slate-history"
import { cn } from "@/lib/utils"

// Extend Slate types
type CustomElement = { type: 'paragraph'; children: CustomText[] }
type CustomText = { text: string }

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor
    Element: CustomElement
    Text: CustomText
  }
}

interface InclusiveGhostTextboxProps {
  value: string
  onValueChange: (value: string) => void
  getSuggestion?: (text: string) => Promise<string>
  /**
   * Enhanced suggestion function that receives cursor context.
   * If provided, this takes precedence over `getSuggestion`.
   */
  getSuggestionWithContext?: (payload: { text: string; cursorContext: { before: string; after: string } }) => Promise<string>
  debounceTime?: number
  disabled?: boolean
  placeholder?: string
  className?: string
  onSuggestionAccepted?: (value: string) => void
  acceptSuggestionOnEnter?: boolean
  // Textarea-specific props
  rows?: number
  maxLength?: number
  resize?: "none" | "both" | "horizontal" | "vertical"
  onKeyDown?: (event: React.KeyboardEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
  // Custom indicator to display when ghost text is active
  ghostIndicator?: React.ReactNode | (() => React.ReactNode)
  /**
   * Callback that receives the latest cursor context whenever it is recomputed.
   */
  onCursorContextChange?: (ctx: { before: string; after: string }) => void
}

const basePaddingX = '0.75rem'; // Corresponds to px-3

export function InclusiveGhostTextbox({
  value,
  onValueChange,
  getSuggestion,
  getSuggestionWithContext,
  debounceTime = 300,
  disabled = false,
  placeholder = "Type here...",
  className,
  onSuggestionAccepted,
  acceptSuggestionOnEnter = true,
  rows = 3,
  maxLength,
  resize = "vertical",
  onKeyDown,
  onFocus,
  onBlur,
  ghostIndicator,
  onCursorContextChange,
}: InclusiveGhostTextboxProps) {
  const [editor] = React.useState(() => withHistory(withReact(createEditor())))
  const [suggestion, setSuggestion] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const debounceRef = React.useRef<NodeJS.Timeout>()
  const idleCallbackRef = React.useRef<number>()
  const [prefixWidth, setPrefixWidth] = React.useState(0);
  const prefixRef = React.useRef<HTMLSpanElement>(null);

  // ------------------------------
  // Cursor context computation (non-blocking with requestIdleCallback)
  // ------------------------------
  const [cursorContext, setCursorContext] = React.useState<{ before: string; after: string }>({ before: "", after: "" })

  const scheduleCursorContextUpdate = React.useCallback(() => {
    if (typeof window === 'undefined') return
    if (idleCallbackRef.current) {
      (window as any).cancelIdleCallback?.(idleCallbackRef.current)
    }

    const cb = () => {
      const sel = editor.selection
      if (!sel) return
      const before = Editor.string(editor, { anchor: Editor.start(editor, []), focus: sel.anchor })
      const after = Editor.string(editor, { anchor: sel.anchor, focus: Editor.end(editor, []) })
      const ctx = { before, after }
      setCursorContext(ctx)
      onCursorContextChange?.(ctx)
    }

    if ((window as any).requestIdleCallback) {
      idleCallbackRef.current = (window as any).requestIdleCallback(cb, { timeout: 100 })
    } else {
      idleCallbackRef.current = window.setTimeout(cb, 0)
    }
  }, [editor, onCursorContextChange])

  // Init only once. Slate ignores subsequent changes; we sync manually.
  const initialValue: Descendant[] = React.useMemo(() => [
    {
      type: 'paragraph',
      children: [{ text: value || "" }],
    },
  ], [])

  // Calculate ghost text display
  const ghostTextInfo = React.useMemo(() => {
    if (!suggestion || !value || suggestion === value) {
      return null
    }

    const suggestionLower = suggestion.toLowerCase()
    const valueLower = value.toLowerCase()
    const matchIndex = suggestionLower.indexOf(valueLower)

    if (matchIndex === -1) return null

    const prefix = suggestion.slice(0, matchIndex)
    const suffix = suggestion.slice(matchIndex + value.length)

    return {
      prefix,
      suffix,
      hasPrefix: prefix.length > 0,
      hasSuffix: suffix.length > 0,
    }
  }, [suggestion, value])
  
    // Measure prefix width for precise indentation
    React.useLayoutEffect(() => {
        if (prefixRef.current) {
            setPrefixWidth(prefixRef.current.offsetWidth);
        } else if (prefixWidth !== 0) {
            setPrefixWidth(0);
        }
    }, [ghostTextInfo?.prefix, prefixWidth]);

  // Sync external value changes to editor
  React.useEffect(() => {
    const currentText = Editor.string(editor, [])
    if (currentText !== value) {
      Editor.withoutNormalizing(editor, () => {
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        Transforms.insertText(editor, value || "")
      })
    }
  }, [value, editor])

  // Debounced suggestion fetching (supports context-aware function)
  React.useEffect(() => {
    const hasContextFn = !!getSuggestionWithContext
    if ((hasContextFn ? !getSuggestionWithContext : !getSuggestion) || !value.trim()) {
      setSuggestion("")
      return
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoading(true)
        let newSuggestion: string = ""
        if (hasContextFn && getSuggestionWithContext) {
          newSuggestion = await getSuggestionWithContext({ text: value, cursorContext })
        } else if (getSuggestion) {
          newSuggestion = await getSuggestion(value)
        }
        setSuggestion(newSuggestion || "")
      } catch (error) {
        console.error("Error fetching suggestion:", error)
        setSuggestion("")
      } finally {
        setIsLoading(false)
      }
    }, debounceTime)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [value, cursorContext, getSuggestion, getSuggestionWithContext, debounceTime])

  // Handle keyboard interactions
  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    // Call external onKeyDown first
    onKeyDown?.(event)

    if (disabled) return

    const isEnter = event.key === 'Enter';

    // ---- SUGGESTION ACCEPTANCE ----
    if (suggestion && suggestion !== value) {
      if (event.key === "Tab" || event.key === "ArrowRight" || (isEnter && acceptSuggestionOnEnter)) {
        // Prevent default for Tab, and for Enter if it's being used to accept
        if (event.key !== 'ArrowRight') event.preventDefault()

        Editor.withoutNormalizing(editor, () => {
          Transforms.select(editor, {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          })
          Transforms.insertText(editor, suggestion)
        })

        onValueChange(suggestion)
        onSuggestionAccepted?.(suggestion)
        setSuggestion("")
        return
      }

      // Reject suggestion with Escape
      if (event.key === "Escape") {
        event.preventDefault()
        setSuggestion("")
        return
      }
    }

    // ---- SINGLE-LINE NEWLINE PREVENTION ----
    if (rows === 1 && isEnter) {
      // Prevent default newline insertion; let parent handlers (e.g., cmdk) continue.
      event.preventDefault()
      return
    }
  }, [editor, suggestion, value, onValueChange, onSuggestionAccepted, disabled, onKeyDown, acceptSuggestionOnEnter, rows])

  // Handle text changes
  const handleChange = React.useCallback((newValue: Descendant[]) => {
    // Fast-path: single paragraph with single text child (most cases).
    let newText: string | undefined
    if (
      newValue.length === 1 &&
      (newValue[0] as any).children?.length === 1 &&
      typeof (newValue[0] as any).children[0].text === "string"
    ) {
      newText = (newValue[0] as any).children[0].text
    }

    if (newText === undefined) {
      // Fallback to Slate's generic serializer for complex structures.
      newText = Editor.string(editor, [])
    }

    // Check maxLength
    if (maxLength && newText.length > maxLength) {
      return
    }

    onValueChange(newText)

    // Schedule low-priority cursor context recomputation.
    scheduleCursorContextUpdate()
  }, [editor, onValueChange, maxLength, scheduleCursorContextUpdate])

  // Auto-resize: measure combined content height (user text + ghost text)
  const measureRef = React.useRef<HTMLDivElement>(null)
  const [dynamicHeight, setDynamicHeight] = React.useState<number>()

  React.useLayoutEffect(() => {
    if (!measureRef.current) return
    const scrollH = measureRef.current.scrollHeight
    if (scrollH && scrollH !== dynamicHeight) {
      setDynamicHeight(scrollH)
    }
  }, [value, suggestion, dynamicHeight])

  const resizeClass = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y",
  }[resize]

  return (
    <div className={cn("relative", className)}>
       {/* Prefix measurement span - must have same font styles as input */}
       <span
        ref={prefixRef}
        aria-hidden="true"
        className="invisible absolute -z-10 whitespace-pre text-base md:text-sm"
        style={{ left: basePaddingX, top: '0.5rem' }} // Positioned to align with input text
      >
        {ghostTextInfo?.prefix}
      </span>

      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <div className={cn(
          "relative w-full rounded-md border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}>
          {/* Ghost text overlay - absolutely positioned */}
          {ghostTextInfo && (
            <div 
              className="absolute inset-0 z-10 overflow-hidden whitespace-pre-wrap break-words px-3 py-2 text-base pointer-events-none select-none md:text-sm leading-6"
              aria-hidden="true"
            >
              <span className="text-muted-foreground/40">{ghostTextInfo.prefix}</span>
              <span className="text-transparent">{value}</span>
              <span className="text-muted-foreground/40">{ghostTextInfo.suffix}</span>
            </div>
          )}
          
          {/* Actual editor */}
          <Editable
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "relative z-20 w-full bg-transparent py-2 pr-3 text-base outline-none", // Core styles
              "placeholder:text-muted-foreground", // Placeholder
              "disabled:cursor-not-allowed disabled:opacity-50", // Disabled state
              "md:text-sm whitespace-pre-wrap break-words leading-6", // Typography
              resizeClass,
              ghostTextInfo && "caret-foreground" // Ghost text specific
            )}
            style={{
              minHeight: `${rows * 1.5}rem`,
              paddingLeft: prefixWidth > 0 ? `calc(${basePaddingX} + ${prefixWidth}px)` : basePaddingX,
              height: dynamicHeight ? `${dynamicHeight}px` : undefined,
            }}
          />

          {/* Hidden measurement div for auto-resize */}
          <div
            ref={measureRef}
            className="absolute invisible whitespace-pre-wrap break-words px-3 py-2 text-base md:text-sm leading-6"
            style={{
              whiteSpace: 'pre-wrap',
              width: '100%',
              paddingLeft: prefixWidth > 0 ? `calc(${basePaddingX} + ${prefixWidth}px)` : basePaddingX,
            }}
          >
            {ghostTextInfo ? (
              <>
                {ghostTextInfo.prefix}
                {value}
                {ghostTextInfo.suffix}
              </>
            ) : (
              value
            )}
          </div>
        </div>
        
        {isLoading && (
          <div className="absolute right-2 top-2 h-4 w-4 z-30">
            <div className="h-full w-full animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"></div>
          </div>
        )}

        {/* Custom ghost indicator at bottom-right */}
        {ghostTextInfo && ghostIndicator && (
          <div className="absolute bottom-2 right-2 z-30 pointer-events-none">
            {typeof ghostIndicator === 'function' ? ghostIndicator() : ghostIndicator}
          </div>
        )}
      </Slate>
    </div>
  )
} 