
// src/components/resume/AutocompleteTextarea.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import type { TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { autocompleteInput, AutocompleteInputInput } from '@/ai/flows/autocomplete-input';
import { Loader2 } from 'lucide-react';
import type { SectionType, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry, ResumeSection as ResumeSectionType } from '@/types/resume';

interface AutocompleteTextareaProps extends Omit<TextareaProps, 'onChange' | 'value'> {
  value: string; 
  onValueChange: (value: string) => void;
  debounceDelay?: number;
  userJobTitle?: string;
  sectionType?: SectionType | 'personalDetailsField';
  currentItem?: SectionItem | { fieldName: string };
  allResumeSections?: ResumeSectionType[];
  currentSectionId?: string | null;
  forcedSuggestion: string | null; 
  onForcedSuggestionAccepted?: () => void;
  onForcedSuggestionRejected?: () => void;
  isAutocompleteEnabledGlobally: boolean; 
}

export default function AutocompleteTextarea({
  value, 
  onValueChange,
  debounceDelay = 1000, 
  className,
  placeholder,
  userJobTitle,
  sectionType,
  currentItem,
  allResumeSections,
  currentSectionId,
  forcedSuggestion,
  onForcedSuggestionAccepted,
  onForcedSuggestionRejected,
  isAutocompleteEnabledGlobally,
  ...props
}: AutocompleteTextareaProps) {
  const [inputValue, setInputValue] = useState(value); 
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDisplayingForcedSuggestion = !!forcedSuggestion;
  const isDisplayingInternalSuggestion = !!aiSuggestion && !forcedSuggestion;

  useEffect(() => {
    if (forcedSuggestion) {
      setInputValue(forcedSuggestion);
      setAiSuggestion(null); 
    } else {
      setInputValue(value);
    }
  }, [value, forcedSuggestion]);


  const buildCurrentItemContext = useCallback((): string | undefined => {
    if (!sectionType) return undefined;

    if (sectionType === 'personalDetailsField' && currentItem && 'fieldName' in currentItem) {
        return `Field: ${(currentItem as { fieldName: string }).fieldName}`;
    }
    if (!currentItem || !('id' in currentItem)) return undefined;
    
    const fieldName = props.name || 'content'; // Default to 'content' or use the field name from props if available

    switch (sectionType) {
      case 'experience':
        const exp = currentItem as ExperienceEntry;
        return `Job: ${exp.jobTitle || 'Untitled Job'} at ${exp.company || 'Unnamed Company'}. Current content of field being edited ('${fieldName}'): ${exp[fieldName as keyof ExperienceEntry]?.toString().substring(0,100) || ''}...`;
      case 'education':
        const edu = currentItem as EducationEntry;
        return `Degree: ${edu.degree || 'Untitled Degree'} from ${edu.institution || 'Unnamed Institution'}. Current content of field being edited ('${fieldName}'): ${edu[fieldName as keyof EducationEntry]?.toString().substring(0,100) || ''}...`;
      case 'skills':
        const skill = currentItem as SkillEntry;
        return `Skill: ${skill.name || 'Unnamed Skill'}. Current content of field being edited ('${fieldName}'): ${skill[fieldName as keyof SkillEntry]?.toString().substring(0,100) || ''}...`;
      case 'summary':
      case 'customText':
        const custom = currentItem as CustomTextEntry;
        return `Current content of field being edited ('${fieldName}'): ${custom[fieldName as keyof CustomTextEntry]?.toString().substring(0,150) || ''}...`;
      default:
        return undefined;
    }
  }, [sectionType, currentItem, props.name]);

  const buildOtherSectionsContext = useCallback((): string | undefined => {
    if (!allResumeSections || allResumeSections.length === 0) return undefined;
    
    let contextStr = "";
    allResumeSections.forEach(sec => {
      if (sec.id === currentSectionId) return; 
      if (!sec.visible) return;

      contextStr += `Other Section: ${sec.title} (Type: ${sec.type})\n`;
      if (sec.type === 'summary' && sec.items.length > 0) {
         const content = (sec.items[0] as CustomTextEntry).content;
         if (content) contextStr += `  Content: ${content.substring(0, 100)}...\n`;
      } else if (sec.type === 'experience' && sec.items.length > 0) {
        const expPreview = sec.items.slice(0,1).map(e => `${(e as ExperienceEntry).jobTitle} at ${(e as ExperienceEntry).company}: ${(e as ExperienceEntry).description.substring(0,50)}...`).join('; ');
        if (expPreview) contextStr += `  Recent Experience: ${expPreview}...\n`;
      } else if (sec.type === 'education' && sec.items.length > 0) {
        const eduPreview = sec.items.slice(0,1).map(e => `${(e as EducationEntry).degree} at ${(e as EducationEntry).institution}`).join('; ');
        if (eduPreview) contextStr += `  Recent Education: ${eduPreview}...\n`;
      } else if (sec.type === 'skills' && sec.items.length > 0) {
        const skillNames = sec.items.slice(0, 5).map(s => (s as SkillEntry).name).join(', ');
        if (skillNames) contextStr += `  Skills: ${skillNames}...\n`;
      } else if (sec.type === 'customText' && sec.items.length > 0 && !sec.isList) {
         const content = (sec.items[0] as CustomTextEntry).content;
         if (content) contextStr += `  "${sec.title}" Content: ${content.substring(0, 100)}...\n`;
      }
    });
    return contextStr.trim() ? contextStr : undefined;
  }, [allResumeSections, currentSectionId]);


  const fetchAISuggestion = useCallback(async (text: string) => {
    if (forcedSuggestion) return; 
    if (!isAutocompleteEnabledGlobally || sectionType === 'personalDetailsField') {
      setAiSuggestion(null);
      return;
    }
    
    if (text.trim().length < 1 && sectionType !== 'summary' && sectionType !== 'customText') { 
      setAiSuggestion(null);
      return;
    }

    setIsLoading(true);
    try {
      const currentItemContext = buildCurrentItemContext();
      const otherSectionsSummary = buildOtherSectionsContext();

      const input: AutocompleteInputInput = {
        inputText: text,
        userJobTitle,
        sectionType: sectionType,
        currentItemContext,
        otherSectionsContext: otherSectionsSummary,
      };
      const result = await autocompleteInput(input);

      if (result.completion && result.completion.trim().length > 0) {
        const currentEnd = text.substring(text.length - result.completion.length);
        if (result.completion.toLowerCase() !== currentEnd.toLowerCase() &&
            result.completion.toLowerCase() !== text.toLowerCase() &&
            (text + result.completion).length > text.length ) {
             setAiSuggestion(result.completion);
        } else {
            setAiSuggestion(null);
        }
      } else {
        setAiSuggestion(null);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
      setAiSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [userJobTitle, sectionType, buildCurrentItemContext, buildOtherSectionsContext, forcedSuggestion, isAutocompleteEnabledGlobally]);


  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValueFromTyping = event.target.value;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (forcedSuggestion) {
      setInputValue(newValueFromTyping); 
      onValueChange(newValueFromTyping); 
      if (onForcedSuggestionRejected) {
        onForcedSuggestionRejected(); 
      }
      if (isAutocompleteEnabledGlobally && sectionType !== 'personalDetailsField' && newValueFromTyping.trim()) {
        debounceTimeoutRef.current = setTimeout(() => {
          fetchAISuggestion(newValueFromTyping);
        }, debounceDelay);
      }
    } else {
      setInputValue(newValueFromTyping);
      onValueChange(newValueFromTyping);
      setAiSuggestion(null); 

      if (isAutocompleteEnabledGlobally && sectionType !== 'personalDetailsField' && newValueFromTyping.trim()) {
        debounceTimeoutRef.current = setTimeout(() => {
            fetchAISuggestion(newValueFromTyping);
        }, debounceDelay);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      if (isDisplayingForcedSuggestion && forcedSuggestion && onForcedSuggestionAccepted) {
        event.preventDefault();
        onValueChange(forcedSuggestion); 
        onForcedSuggestionAccepted(); 
        setTimeout(() => {
            textareaRef.current?.focus();
            if (textareaRef.current) textareaRef.current.setSelectionRange(forcedSuggestion.length, forcedSuggestion.length);
        }, 0);
      } else if (isDisplayingInternalSuggestion && aiSuggestion) {
        event.preventDefault();
        const newText = value + aiSuggestion; 
        setInputValue(newText); 
        onValueChange(newText); 
        setAiSuggestion(null); 
         setTimeout(() => {
            textareaRef.current?.focus();
            if (textareaRef.current) textareaRef.current.setSelectionRange(newText.length, newText.length);
        }, 0);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (isDisplayingForcedSuggestion && onForcedSuggestionRejected) {
        onForcedSuggestionRejected(); 
      } else {
        setAiSuggestion(null); 
      }
    }
  };

  const textForInternalSuggestionOverlay = value; 
  const suggestionForInternalOverlay = aiSuggestion;

  const showTabHint = !isLoading && (isDisplayingInternalSuggestion || isDisplayingForcedSuggestion);

  return (
    <div className="relative w-full">
      <Textarea
        ref={textareaRef}
        value={inputValue} 
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "pr-8", 
          className, 
          isDisplayingForcedSuggestion ? 'text-muted-foreground caret-foreground' : 'text-foreground'
        )}
        placeholder={isDisplayingForcedSuggestion ? '' : placeholder} 
        style={{
          paddingRight: showTabHint || (isLoading && !forcedSuggestion) ? '2rem' : undefined
        }}
        {...props}
      />
      {isDisplayingInternalSuggestion && suggestionForInternalOverlay && (
         <div
            style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                paddingTop: textareaRef.current?.style.paddingTop || '8px', // Match textarea padding
                paddingRight: textareaRef.current?.style.paddingRight || '12px',
                paddingBottom: textareaRef.current?.style.paddingBottom || '8px',
                paddingLeft: textareaRef.current?.style.paddingLeft || '12px',
                pointerEvents: 'none',
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                boxSizing: 'border-box',
                fontFamily: 'inherit', // Inherit font family
                fontSize: 'inherit',   // Inherit font size
                lineHeight: 'inherit', // Inherit line height
                borderColor: 'transparent',
                wordBreak: 'break-word',
            }}
            className={cn(
              "absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap border border-transparent",
              // Removed explicit font size, rely on inheritance or Textarea's base
              "leading-relaxed" // Keep leading-relaxed for consistency if it helps
            )}
            aria-hidden="true"
          >
            <span className="opacity-0">{textForInternalSuggestionOverlay}</span> 
            <span className="text-muted-foreground/70">{suggestionForInternalOverlay}</span>
        </div>
      )}
      {isLoading && !forcedSuggestion && (
        <Loader2 className="absolute top-2 right-2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      {showTabHint && (
        <span className="absolute top-1.5 right-2 text-xs text-muted-foreground/90 opacity-70 select-none pointer-events-none">Tab</span>
      )}
    </div>
  );
}

