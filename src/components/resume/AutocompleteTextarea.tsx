// src/components/resume/AutocompleteTextarea.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { autocompleteInput, AutocompleteInputInput } from '@/ai/flows/autocomplete-input';
import { Loader2 } from 'lucide-react';
import { SectionType, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry, ResumeSection } from '@/types/resume';
import { DynamicResumeSection, AIContextPayload, StructuredAIContext } from '@/types/schema';
import { schemaRegistry } from '@/lib/schemaRegistry';

// Union type to support both legacy and dynamic sections
type AllSectionTypes = ResumeSection | DynamicResumeSection;

interface AutocompleteTextareaProps extends Omit<React.ComponentProps<'textarea'>, 'onChange' | 'value'> {
  value: string; 
  onValueChange: (value: string) => void;
  debounceDelay?: number;
  userJobTitle?: string;
  sectionType?: SectionType | 'personalDetailsField' | string; // Allow dynamic schema IDs
  currentItem?: SectionItem | { fieldName: string } | { data: Record<string, any> }; // Support dynamic items
  allResumeSections?: AllSectionTypes[];
  currentSectionId?: string | null;
  forcedSuggestion: string | null; 
  onForcedSuggestionAccepted?: () => void;
  onForcedSuggestionRejected?: () => void;
  isAutocompleteEnabledGlobally: boolean; 
  itemId?: string; // The ID of the current item being edited
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
  itemId,
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

  // Helper function to extract itemId from the component's id prop (if it's a uniqueFieldId)
  const extractItemIdFromUniqueFieldId = useCallback((uniqueFieldId: string): string | undefined => {
    if (!uniqueFieldId || uniqueFieldId.startsWith('personal_')) {
      return undefined;
    }
    
    const parts = uniqueFieldId.split('_');
    if (parts.length < 3) {
      return undefined;
    }
    
    // Remove field name and section type, rejoin the rest as itemId
    const fieldName = parts.pop();
    const sectionType = parts.pop();
    const itemId = parts.join('_').replace(/-/g, '_'); // Restore original itemId
    
    return itemId === 'no-item' ? undefined : itemId;
  }, []);

  // NEW: Centralized context building using SchemaRegistry
  const buildStructuredContext = useCallback((): StructuredAIContext | null => {
    if (!sectionType || !currentSectionId || !allResumeSections || sectionType === 'personalDetailsField') {
      return null;
    }

    const fieldId = props.name;
    if (!fieldId) {
      return null;
    }

    // Try to get itemId from props, or extract from the component's id
    let resolvedItemId = itemId;
    if (!resolvedItemId && props.id) {
      resolvedItemId = extractItemIdFromUniqueFieldId(props.id);
    }

    // Build resume data structure for SchemaRegistry
    const resumeData = {
      personalDetails: {
        jobTitle: userJobTitle || '',
      },
      sections: allResumeSections,
    };

    const payload: AIContextPayload = {
      resumeData,
      task: 'autocomplete',
      sectionId: currentSectionId,
      fieldId,
      itemId: resolvedItemId, // Optional - for list sections
    };

    try {
      return schemaRegistry.buildAIContext(payload);
    } catch (error) {
      console.warn('Failed to build structured context:', error);
      return null;
    }
  }, [sectionType, currentSectionId, allResumeSections, userJobTitle, props.name, props.id, itemId, extractItemIdFromUniqueFieldId]);

  // LEGACY: Keep existing context building methods for backward compatibility
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

      // Check if this is a dynamic section or legacy section
      if ('schemaId' in sec) {
        // Dynamic section
        const dynamicSec = sec as DynamicResumeSection;
        contextStr += `Other Section: ${dynamicSec.title} (Dynamic Schema: ${dynamicSec.schemaId})\n`;
        if (dynamicSec.items && dynamicSec.items.length > 0) {
          // Show all items for dynamic sections, not just the first one
          dynamicSec.items.forEach((item: any, index: number) => {
            if (item && item.data) {
              switch (dynamicSec.schemaId) {
                case 'advanced-skills':
                  contextStr += `  Skills Category ${index + 1}: ${item.data.category || 'N/A'} - ${Array.isArray(item.data.skills) ? item.data.skills.join(', ') : item.data.skills || 'N/A'}\n`;
                  break;
                case 'projects':
                  // Don't truncate description for better context
                  contextStr += `  Project ${index + 1}: ${item.data.name || 'Unnamed'} - ${item.data.description || 'No description'}\n`;
                  if (item.data.technologies && Array.isArray(item.data.technologies)) {
                    contextStr += `    Technologies: ${item.data.technologies.join(', ')}\n`;
                  }
                  break;
                default:
                  // Generic dynamic section preview - show more fields
                  const preview = Object.entries(item.data).slice(0, 3).map(([key, value]) => {
                    if (typeof value === 'string' && value.length > 100) {
                      return `${key}: ${value.substring(0, 100)}...`;
                    }
                    return `${key}: ${value}`;
                  }).join(', ');
                  contextStr += `  Item ${index + 1}: ${preview}\n`;
                  break;
              }
            }
          });
        }
      } else {
        // Legacy section
        const legacySec = sec as ResumeSection;
        contextStr += `Other Section: ${legacySec.title} (Type: ${legacySec.type})\n`;
        if (legacySec.type === 'summary' && legacySec.items.length > 0) {
           const content = (legacySec.items[0] as CustomTextEntry).content;
           if (content) contextStr += `  Content: ${content.substring(0, 200)}...\n`;
        } else if (legacySec.type === 'experience' && legacySec.items.length > 0) {
          const expPreview = legacySec.items.slice(0,2).map((e: any) => `${(e as ExperienceEntry).jobTitle} at ${(e as ExperienceEntry).company}: ${(e as ExperienceEntry).description.substring(0,150)}...`).join('; ');
          if (expPreview) contextStr += `  Recent Experience: ${expPreview}\n`;
        } else if (legacySec.type === 'education' && legacySec.items.length > 0) {
          const eduPreview = legacySec.items.slice(0,2).map((e: any) => `${(e as EducationEntry).degree} at ${(e as EducationEntry).institution}`).join('; ');
          if (eduPreview) contextStr += `  Recent Education: ${eduPreview}\n`;
        } else if (legacySec.type === 'skills' && legacySec.items.length > 0) {
          const skillNames = legacySec.items.slice(0, 8).map((s: any) => (s as SkillEntry).name).join(', ');
          if (skillNames) contextStr += `  Skills: ${skillNames}\n`;
        } else if (legacySec.type === 'customText' && legacySec.items.length > 0 && !legacySec.isList) {
           const content = (legacySec.items[0] as CustomTextEntry).content;
           if (content) contextStr += `  "${legacySec.title}" Content: ${content.substring(0, 200)}...\n`;
        }
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
    
    if (text.trim().length < 0 && sectionType !== 'summary' && sectionType !== 'customText') { 
      setAiSuggestion(null);
      return;
    }

    setIsLoading(true);
    try {
      const currentItemContext = buildCurrentItemContext();
      const otherSectionsSummary = buildOtherSectionsContext();

      // Enhanced input for dynamic sections
      const input: AutocompleteInputInput = {
        inputText: text,
        userJobTitle,
        sectionType: sectionType,
        currentItemContext,
        otherSectionsContext: otherSectionsSummary,
        // Add enhanced context for dynamic sections
        fieldId: props.name, // Use the field name as fieldId if available
        currentItemData: currentItem && typeof currentItem === 'object' && 'data' in currentItem 
          ? (currentItem as any).data 
          : currentItem,
        allResumeData: allResumeSections ? {
          sections: allResumeSections,
          personalDetails: userJobTitle ? { jobTitle: userJobTitle } : {}, // Include available personal details
        } : undefined,
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
  }, [userJobTitle, sectionType, buildCurrentItemContext, buildOtherSectionsContext, forcedSuggestion, isAutocompleteEnabledGlobally, currentItem, allResumeSections, props.name]);


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
              padding: 'inherit',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              color: 'transparent',
              pointerEvents: 'none',
              display: 'inline-block',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              boxSizing: 'border-box',
              lineHeight: 'inherit', // Explicitly inherit line-height
              borderColor: 'transparent', // Ensure no border from overlay itself
              // Match textarea's specific padding from ShadCN Textarea if possible
              // Default is px-3 py-2. Use 'inherit' for padding if parent div has it.
              // This needs to be dynamic based on actual textarea style
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

