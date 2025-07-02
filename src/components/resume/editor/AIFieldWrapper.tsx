"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import AutocompleteTextarea from '@/components/resume/ui/AutocompleteTextarea';
import AISuggestionCard from '@/components/resume/ui/AISuggestionCard';
import { cn } from "@/lib/utils";
import { useResumeStore } from '@/stores/resumeStore';
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';

interface AIFieldWrapperProps {
  uniqueFieldId: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  fieldId: string;
  sectionId: string;
  itemId?: string;
  isPersonalDetails?: boolean;
  userJobTitle?: string;
  sectionType?: string; // Now just a string for schema ID or 'personalDetailsField'
  currentItem?: DynamicSectionItem | { fieldName: string };
  allResumeSections?: DynamicResumeSection[];
  currentSectionId?: string | null;
  className?: string;
  placeholder?: string;
  isAutocompleteEnabled: boolean;
}

export default function AIFieldWrapper({
  uniqueFieldId,
  label,
  value,
  onValueChange,
  fieldId,
  sectionId,
  itemId,
  isPersonalDetails = false,
  userJobTitle,
  sectionType,
  currentItem,
  allResumeSections,
  currentSectionId,
  className,
  placeholder,
  isAutocompleteEnabled,
}: AIFieldWrapperProps) {
  const { toast } = useToast();
  
  // NEW: Get dialog-based improvement state and actions from store
  const singleFieldReview = useResumeStore(state => state.singleFieldImprovementReview);
  const startSingleFieldImprovement = useResumeStore(state => state.startSingleFieldImprovement);
  const acceptSingleFieldImprovement = useResumeStore(state => state.acceptSingleFieldImprovement);
  const rejectSingleFieldImprovement = useResumeStore(state => state.rejectSingleFieldImprovement);
  
  // DEPRECATED: Get old AI improvement state for backward compatibility
  const aiImprovement = useResumeStore(state => state.aiImprovement);
  const isImprovingFieldId = useResumeStore(state => state.isImprovingFieldId);
  const acceptAIImprovement = useResumeStore(state => state.acceptAIImprovement);
  const rejectAIImprovement = useResumeStore(state => state.rejectAIImprovement);
  
  // Local state for improvement prompt
  const [improvementPrompt, setImprovementPrompt] = React.useState('');
  
  // Check if this field has an active AI suggestion or is being improved (DEPRECATED)
  const hasAISuggestion = aiImprovement?.uniqueFieldId === uniqueFieldId;
  const isImproving = isImprovingFieldId === uniqueFieldId;
  const forcedSuggestion = hasAISuggestion ? aiImprovement.suggestion : null;
  
  // Check if this field has an active suggestion card
  const hasActiveSuggestionCard = singleFieldReview?.uniqueFieldId === uniqueFieldId;
  const isImprovingInDialog = hasActiveSuggestionCard && singleFieldReview.isLoading;
  
  const handleImproveWithAI = async () => {
    if (!improvementPrompt.trim()) {
      toast({ variant: "destructive", title: "AI Prompt Empty", description: "Please provide a prompt for the AI." });
      return;
    }
    
    await startSingleFieldImprovement({
      uniqueFieldId,
      sectionId,
      itemId,
      fieldId,
      currentValue: value,
      prompt: improvementPrompt,
      isPersonalDetails
    });
    
    // Clear the prompt after triggering improvement
    setImprovementPrompt('');
  };
  
  // Extract field name from uniqueFieldId for AutocompleteTextarea
  const fieldName = uniqueFieldId.split('_').pop() || label.toLowerCase();
  
  return (
    <div className="space-y-1">
      <Label htmlFor={uniqueFieldId} className="block mb-1">{label}</Label>
      <AutocompleteTextarea
        id={uniqueFieldId}
        name={fieldName}
        value={hasAISuggestion ? aiImprovement.originalText : value}
        onValueChange={onValueChange}
        className={cn("min-h-[80px]", className)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}...`}
        userJobTitle={userJobTitle}
        sectionType={sectionType}
        currentItem={currentItem}
        allResumeSections={allResumeSections}
        currentSectionId={currentSectionId}
        forcedSuggestion={forcedSuggestion}
        onForcedSuggestionAccepted={acceptAIImprovement}
        onForcedSuggestionRejected={rejectAIImprovement}
        isAutocompleteEnabledGlobally={isAutocompleteEnabled}
        itemId={itemId}
      />
      
      {/* AI Improvement UI */}
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="text"
          placeholder="AI Prompt (e.g., make it more concise)"
          value={improvementPrompt}
          onChange={(e) => setImprovementPrompt(e.target.value)}
          className="text-xs flex-grow h-8"
          disabled={isImproving || hasAISuggestion || isImprovingInDialog}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleImproveWithAI}
          disabled={isImproving || !improvementPrompt.trim() || hasAISuggestion || isImprovingInDialog}
          className="text-xs h-8 px-2 py-1"
        >
          <Sparkles size={14} className="mr-1" />
          {isImproving || isImprovingInDialog ? 'Improving...' : (hasAISuggestion ? 'Suggested' : 'Improve')}
        </Button>
      </div>
      
      {/* NEW: Inline AI Suggestion Card */}
      {hasActiveSuggestionCard && (
        <AISuggestionCard
          originalValue={singleFieldReview.originalText}
          suggestedValue={singleFieldReview.improvedText}
          isLoading={singleFieldReview.isLoading}
          fieldName={label}
          prompt={singleFieldReview.prompt}
          onAccept={acceptSingleFieldImprovement}
          onReject={rejectSingleFieldImprovement}
        />
      )}
    </div>
  );
} 