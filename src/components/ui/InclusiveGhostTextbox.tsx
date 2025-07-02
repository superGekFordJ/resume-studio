"use client"

import * as React from "react"
import { createEditor, BaseEditor, Descendant, Text, Editor, Transforms } from "slate"
import { Slate, Editable, withReact, ReactEditor } from "slate-react"
import { withHistory } from "slate-history"
import { cn } from "@/lib/utils"
import type { CustomText } from "../ai/completions/types"

// Minimal Slate types for this component
type CustomElement = { type: 'paragraph'; children: CustomText[] }

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
  debounceTime?: number
  disabled?: boolean
  placeholder?: string
  className?: string
  onSuggestionAccepted?: (value:string) => void
  acceptSuggestionOnEnter?: boolean
  // Simplified props for single/multi-line basic use
  rows?: number
  resize?: "none" | "both" | "horizontal" | "vertical"
  onKeyDown?: (event: React.KeyboardEvent) => void
  onFocus?: (event: React.FocusEvent) => void
  onBlur?: (event: React.FocusEvent) => void
}

const basePaddingX = '0.75rem'; // Corresponds to px-3

export function InclusiveGhostTextbox({
  value,
  onValueChange,
  getSuggestion,
  debounceTime = 300,
  disabled = false,
  placeholder = "Type here...",
  className,
  onSuggestionAccepted,
  acceptSuggestionOnEnter = true,
  rows = 1, // Default to 1 for combobox-like behavior
  resize = "none",
  onKeyDown,
  onFocus,
  onBlur,
}: InclusiveGhostTextboxProps) {
  const [editor] = React.useState(() => withHistory(withReact(createEditor())))
  const [suggestion, setSuggestion] = React.useState<string>("")
  const debounceRef = React.useRef<NodeJS.Timeout>()
  const [prefixWidth, setPrefixWidth] = React.useState(0);
  const prefixRef = React.useRef<HTMLSpanElement>(null);

  const initialValue: Descendant[] = React.useMemo(() => [
    {
      type: 'paragraph',
      children: [{ text: value || "" }],
    },
  ], [])

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

    return { prefix, suffix }
  }, [suggestion, value])
  
  React.useLayoutEffect(() => {
    if (prefixRef.current) {
      setPrefixWidth(prefixRef.current.offsetWidth);
    } else if (prefixWidth !== 0) {
      setPrefixWidth(0);
    }
  }, [ghostTextInfo?.prefix, prefixWidth]);

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

  React.useEffect(() => {
    if (!getSuggestion || !value.trim()) {
      setSuggestion("")
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const newSuggestion = await getSuggestion(value)
        setSuggestion(newSuggestion || "")
      } catch (error) {
        console.error("Error fetching suggestion:", error)
        setSuggestion("")
      }
    }, debounceTime)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [value, getSuggestion, debounceTime])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    onKeyDown?.(event)
    if (disabled) return

    const isEnter = event.key === 'Enter';

    if (suggestion && suggestion !== value) {
      if (event.key === "Tab" || event.key === "ArrowRight" || (isEnter && acceptSuggestionOnEnter)) {
        if (event.key !== 'ArrowRight') event.preventDefault()
        
        onValueChange(suggestion)
        onSuggestionAccepted?.(suggestion)
        setSuggestion("")
        return
      }

      if (event.key === "Escape") {
        event.preventDefault()
        setSuggestion("")
        return
      }
    }

    if (rows === 1 && isEnter) {
      event.preventDefault()
      return
    }
  }, [editor, suggestion, value, onValueChange, onSuggestionAccepted, disabled, onKeyDown, acceptSuggestionOnEnter, rows])

  const handleChange = React.useCallback((newValue: Descendant[]) => {
    const newText = Editor.string(editor, [])
    onValueChange(newText)
  }, [editor, onValueChange])

  const resizeClass = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y",
  }[resize]

  return (
    <div className={cn("relative", className)}>
       <span
        ref={prefixRef}
        aria-hidden="true"
        className="invisible absolute -z-10 whitespace-pre text-base md:text-sm"
        style={{ left: basePaddingX, top: '0.5rem' }}
      >
        {ghostTextInfo?.prefix}
      </span>

      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <div className={cn(
          "relative w-full rounded-md border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}>
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
          
          <Editable
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={(e) => {
              if (debounceRef.current) clearTimeout(debounceRef.current)
              onBlur?.(e)
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "relative z-20 w-full bg-transparent py-2 pr-3 text-base outline-none",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "md:text-sm whitespace-pre-wrap break-words leading-6",
              resizeClass,
              ghostTextInfo && "caret-foreground"
            )}
            style={{
              minHeight: `${rows * 1.5}rem`,
              paddingLeft: prefixWidth > 0 ? `calc(${basePaddingX} + ${prefixWidth}px)` : basePaddingX,
            }}
          />
        </div>
      </Slate>
    </div>
  )
} 