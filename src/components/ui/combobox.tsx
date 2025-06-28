"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { InclusiveGhostTextbox } from "@/components/ui/InclusiveGhostTextbox"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  allowCustomValue?: boolean
  className?: string
  disabled?: boolean
  // Ghost text specific props
  enableGhostText?: boolean
  debounceTime?: number
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Type to search or select...",
  searchPlaceholder = "Type to search...",
  emptyText = "No option found.",
  allowCustomValue = true,
  className,
  disabled = false,
  enableGhostText = true,
  debounceTime = 300,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  // Sync external value ↔ internal input
  React.useEffect(() => {
    setInputValue(value || "")
  }, [value])

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /**
   * Pre-process lowercase caches once per `options` list.
   * This avoids repeated `toLowerCase()` calls in every keystroke.
   */
  const lowerOptions = React.useMemo(() => {
    return options.map(opt => ({
      ...opt,
      valueLower: opt.value.toLowerCase(),
      labelLower: opt.label.toLowerCase(),
    }))
  }, [options])

  // Filter options based on inputValue (case-insensitive search over cached lowercase).
  const filteredOptions = React.useMemo(() => {
    const q = inputValue.trim().toLowerCase()
    if (!q) return lowerOptions
    return lowerOptions.filter(opt =>
      opt.labelLower.includes(q) || opt.valueLower.includes(q)
    )
  }, [lowerOptions, inputValue])

  /**
   * Build ghost text suggestion for InclusiveGhostTextbox.
   *
   * Design principles (see docs/ui/combobox-ghost-text.md):
   * 1. The suggestion should always mirror the item that <cmdk> will highlight first.
   *    – <cmdk> highlights the first element in the (already) filtered list, so we simply
   *      take the first element of `filteredOptions` for consistency.
   * 2. Never show a suggestion when the current input already exactly matches **any** option.
   *    – This prevents the "re-trigger after selection" bug reported by the user where
   *      typing/selecting "Languages" still suggests "Programming Languages".
   * 3. Only generate suggestions when `enableGhostText` is true and the input is non-empty.
   */
  const getSuggestion = React.useCallback(async (text: string): Promise<string> => {
    if (!enableGhostText) return ""

    const trimmed = text.trim()
    if (!trimmed) return ""

    const textLower = trimmed.toLowerCase()

    // 2️ Early-exit when an exact match exists.
    const hasExactMatch = lowerOptions.some(opt =>
      opt.valueLower === textLower || opt.labelLower === textLower
    )
    if (hasExactMatch) return ""

    // 1️ Use the first element from the filtered list as suggestion (mirrors cmdk highlight).
    const firstMatch = filteredOptions[0]
    if (!firstMatch) return ""

    return firstMatch.value
  }, [enableGhostText, lowerOptions, filteredOptions])

  const handleSelect = (optionValue: string) => {
    setInputValue(optionValue)
    onValueChange(optionValue)
    setOpen(false)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Only handle Escape key to close the dropdown
    if (event.key === "Escape") {
      setOpen(false)
      return
    }

    // Prevent newline insertion; Command (cmdk) will still handle Enter selection.
    if (event.key === "Enter") {
      event.preventDefault()
    }
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange(newValue)
    if (!open) setOpen(true)
  }

  const handleSuggestionAccepted = (acceptedValue: string) => {
    handleSelect(acceptedValue)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <InclusiveGhostTextbox
        value={inputValue}
        onValueChange={handleInputChange}
        getSuggestion={enableGhostText ? getSuggestion : undefined}
        debounceTime={debounceTime}
        onKeyDown={handleKeyDown}
        onFocus={() => setOpen(true)}
        onSuggestionAccepted={handleSuggestionAccepted}
        acceptSuggestionOnEnter={false} // Let cmdk handle Enter key
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        resize="none"
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
      >
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 z-50 rounded-md border bg-popover shadow-md">
          <Command>
            <CommandList>
              {filteredOptions.length === 0 ? (
                <CommandEmpty>
                  {allowCustomValue && inputValue.trim() ? (
                    <div className="p-2">
                      <div className="text-sm text-muted-foreground mb-2">{emptyText}</div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => handleSelect(inputValue.trim())}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Use "{inputValue.trim()}"
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 text-sm text-muted-foreground">{emptyText}</div>
                  )}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          inputValue === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
} 