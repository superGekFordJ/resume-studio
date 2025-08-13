'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import AutocompleteTextarea from '@/components/resume/ui/AutocompleteTextarea';
import { FocusView } from '@/components/resume/ui/FocusView';
import AISuggestionCard from '@/components/resume/ui/AISuggestionCard';
import { cn } from '@/lib/utils';
import { useResumeStore } from '@/stores/resumeStore';

interface AIFieldWrapperProps {
  uniqueFieldId: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  fieldId: string;
  sectionId: string;
  itemId?: string;
  isPersonalDetails?: boolean;
  sectionType?: string; // Now just a string for schema ID or 'personalDetailsField'
  className?: string;
  placeholder?: string;
  isAutocompleteEnabled: boolean;
  isMarkdownEnabled?: boolean;
}

function AIFieldWrapper({
  uniqueFieldId,
  label,
  value,
  onValueChange,
  fieldId,
  sectionId,
  itemId,
  isPersonalDetails = false,
  sectionType,
  className,
  placeholder,
  isAutocompleteEnabled,
  isMarkdownEnabled = false,
}: AIFieldWrapperProps) {
  const { t } = useTranslation('components');
  const { t: tSchema } = useTranslation('schemas');
  const { toast } = useToast();

  // NEW: Get dialog-based improvement state and actions from store
  const singleFieldReview = useResumeStore(
    (state) => state.singleFieldImprovementReview
  );
  const startSingleFieldImprovement = useResumeStore(
    (state) => state.startSingleFieldImprovement
  );
  const acceptSingleFieldImprovement = useResumeStore(
    (state) => state.acceptSingleFieldImprovement
  );
  const rejectSingleFieldImprovement = useResumeStore(
    (state) => state.rejectSingleFieldImprovement
  );

  // DEPRECATED: Get old AI improvement state for backward compatibility
  const aiImprovement = useResumeStore((state) => state.aiImprovement);
  const isImprovingFieldId = useResumeStore(
    (state) => state.isImprovingFieldId
  );
  const autocompleteModel = useResumeStore(
    (state) => state.aiConfig.autocompleteModel
  );

  // Local state for improvement prompt
  const [improvementPrompt, setImprovementPrompt] = React.useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Check if this field has an active AI suggestion or is being improved (DEPRECATED)
  const hasAISuggestion = aiImprovement?.uniqueFieldId === uniqueFieldId;
  const isImproving = isImprovingFieldId === uniqueFieldId;

  // Check if this field has an active suggestion card
  const hasActiveSuggestionCard =
    singleFieldReview?.uniqueFieldId === uniqueFieldId;
  const isImprovingInDialog =
    hasActiveSuggestionCard && singleFieldReview.isLoading;

  const handleImproveWithAI = async () => {
    if (!improvementPrompt.trim()) {
      toast({
        variant: 'destructive',
        title: t('AIFieldWrapper.promptEmptyTitle'),
        description: t('AIFieldWrapper.promptEmptyDescription'),
      });
      return;
    }

    // Note: We will get resumeData inside the action itself to avoid prop drilling
    await startSingleFieldImprovement({
      uniqueFieldId,
      sectionId,
      itemId,
      fieldId,
      currentValue: value,
      prompt: improvementPrompt,
      isPersonalDetails,
    });

    // Clear the prompt after triggering improvement
    setImprovementPrompt('');
  };

  // Determine which t function to use for the label
  const translatedLabel = label.startsWith('schemas:')
    ? tSchema(label)
    : t(label);

  // Extract field name from uniqueFieldId for AutocompleteTextarea
  const fieldName =
    uniqueFieldId.split('_').pop() || translatedLabel.toLowerCase();
  const layoutId = `textarea-wrapper-${uniqueFieldId}`;

  const handleFocusViewClose = (finalValue: string) => {
    onValueChange(finalValue);
    setIsFocusMode(false);
  };

  const textareaProps = {
    id: uniqueFieldId,
    name: fieldName,
    initialValue: hasAISuggestion ? aiImprovement.originalText : value,
    placeholder:
      placeholder ||
      t('AIFieldWrapper.placeholder', { label: translatedLabel }),
    sectionType: sectionType,
    isAutocompleteEnabledGlobally: isAutocompleteEnabled,
    autocompleteModel: autocompleteModel,
    sectionId: sectionId,
    itemId: itemId,
    isMarkdownEnabled: isMarkdownEnabled,
  };

  return (
    <div className="space-y-1 group relative">
      <Label htmlFor={uniqueFieldId} className="block mb-1">
        {translatedLabel}
      </Label>
      <motion.div layoutId={layoutId} layout="position">
        <AutocompleteTextarea
          id={uniqueFieldId}
          name={fieldName}
          value={hasAISuggestion ? aiImprovement.originalText : value}
          onValueChange={onValueChange}
          className={cn('min-h-[80px]', className)}
          placeholder={
            placeholder ||
            t('AIFieldWrapper.placeholder', { label: translatedLabel })
          }
          sectionType={sectionType}
          isAutocompleteEnabledGlobally={isAutocompleteEnabled}
          autocompleteModel={autocompleteModel}
          sectionId={sectionId}
          itemId={itemId}
          isMarkdownEnabled={isMarkdownEnabled}
        />
      </motion.div>
      <AnimatePresence>
        {isFocusMode && isMarkdownEnabled && (
          <FocusView
            layoutId={layoutId}
            onClose={handleFocusViewClose}
            textareaProps={{
              ...textareaProps,
              className: cn('w-full h-full text-lg', className),
            }}
          />
        )}
      </AnimatePresence>
      {isMarkdownEnabled && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-0 right-0 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsFocusMode(true)}
        >
          <Maximize className="h-4 w-4" />
        </Button>
      )}

      {/* AI Improvement UI */}
      <div className="flex items-center gap-2 mt-1">
        <Input
          type="text"
          placeholder={t('AIFieldWrapper.promptPlaceholder')}
          value={improvementPrompt}
          onChange={(e) => setImprovementPrompt(e.target.value)}
          className="text-xs flex-grow h-8"
          disabled={isImproving || hasAISuggestion || isImprovingInDialog}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleImproveWithAI}
          disabled={
            isImproving ||
            !improvementPrompt.trim() ||
            hasAISuggestion ||
            isImprovingInDialog
          }
          className="text-xs h-8 px-2 py-1"
        >
          <Sparkles size={14} className="mr-1" />
          {isImproving || isImprovingInDialog
            ? t('AIFieldWrapper.improving')
            : hasAISuggestion
              ? t('AIFieldWrapper.suggested')
              : t('AIFieldWrapper.improve')}
        </Button>
      </div>

      {/* NEW: Inline AI Suggestion Card */}
      {hasActiveSuggestionCard && (
        <AISuggestionCard
          originalValue={singleFieldReview.originalText}
          suggestedValue={singleFieldReview.improvedText}
          isLoading={singleFieldReview.isLoading}
          fieldName={translatedLabel}
          prompt={singleFieldReview.prompt}
          onAccept={acceptSingleFieldImprovement}
          onReject={rejectSingleFieldImprovement}
        />
      )}
    </div>
  );
}

export default React.memo(AIFieldWrapper);
