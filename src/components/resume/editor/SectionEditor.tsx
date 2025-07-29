// src/components/resume/SectionEditor.tsx
'use client';

import type { ChangeEvent } from 'react';
import { useEffect } from 'react';
import { PersonalDetails } from '@/types/resume';
import type { DynamicResumeSection } from '@/types/schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { PlusCircle, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { useResumeStore } from '@/stores/resumeStore';
import PersonalDetailsEditor from './PersonalDetailsEditor';
import SectionItemEditor from './SectionItemEditor';
import { BatchImprovementPromptPopover } from '../ui/BatchImprovementPromptPopover';
import { Wand2 } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Accordion } from '@/components/ui/accordion';
import AutocompleteModelSelector from './AutocompleteModelSelector';
import { Portal as HoverCardPortal } from '@radix-ui/react-hover-card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export default function SectionEditor() {
  const { toast } = useToast();
  const schemaRegistry = SchemaRegistry.getInstance();

  // Get state and actions from store
  const resumeData = useResumeStore((state) => state.resumeData);
  const editingTarget = useResumeStore((state) => state.editingTarget);
  const isAutocompleteEnabled = useResumeStore(
    (state) => state.isAutocompleteEnabled
  );
  const toggleAutocomplete = useResumeStore(
    (state) => state.toggleAutocomplete
  );
  const startBatchImprovement = useResumeStore(
    (state) => state.startBatchImprovement
  );
  const batchReview = useResumeStore((state) => state.batchImprovementReview);
  const generateCoverLetter = useResumeStore(
    (state) => state.generateCoverLetter
  );
  const isGeneratingCoverLetter = useResumeStore(
    (state) => state.isGeneratingCoverLetter
  );

  // Get data manipulation actions from store
  const updateSectionTitle = useResumeStore(
    (state) => state.updateSectionTitle
  );
  const addSectionItem = useResumeStore((state) => state.addSectionItem);
  const removeSectionItem = useResumeStore((state) => state.removeSectionItem);
  const reorderSectionItems = useResumeStore(
    (state) => state.reorderSectionItems
  );

  // Derive the current editing data from store state
  const currentEditingData = (() => {
    if (editingTarget === 'personalDetails') {
      return resumeData.personalDetails;
    } else if (editingTarget) {
      return resumeData.sections.find((s) => s.id === editingTarget);
    }
    return null;
  })();

  // Auto-create item for single type sections if they don't have one
  useEffect(() => {
    if (currentEditingData && 'schemaId' in currentEditingData) {
      const section = currentEditingData as DynamicResumeSection;
      const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
      if (sectionSchema?.type === 'single' && section.items.length === 0) {
        // Auto-create an item for single type sections
        addSectionItem(section.id);
      }
    }
  }, [currentEditingData, addSectionItem, schemaRegistry]);

  const handleSectionTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (currentEditingData && 'id' in currentEditingData) {
      updateSectionTitle({
        sectionId: currentEditingData.id,
        newTitle: e.target.value,
      });
    }
  };

  const handleAddItem = () => {
    if (currentEditingData && 'id' in currentEditingData) {
      addSectionItem(currentEditingData.id);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    if (currentEditingData && 'id' in currentEditingData) {
      removeSectionItem({
        sectionId: currentEditingData.id,
        itemId,
      });
    }
  };

  const handleStartBatchImprove = async (prompt: string) => {
    if (!currentEditingData || !('id' in currentEditingData)) return;

    const section = currentEditingData as DynamicResumeSection;
    await startBatchImprovement(section.id, prompt);
    // No need to manage dialog state here anymore
  };

  const handleGenerateCoverLetter = async () => {
    try {
      const generationSummary = await generateCoverLetter();
      if (generationSummary) {
        toast({
          variant: 'ai',
          title: 'Cover Letter Generated',
          description: (
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>{generationSummary}</p>
            </div>
          ),
        });
      } else {
        toast({
          title: 'Cover Letter Generated',
          description: 'Your cover letter has been generated successfully.',
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'Failed to generate cover letter. Please try again.',
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !currentEditingData || !('id' in currentEditingData)) return;

    const section = currentEditingData as DynamicResumeSection;
    const activeIndex = section.items.findIndex(
      (item) => item.id === active.id
    );
    const overIndex = section.items.findIndex((item) => item.id === over.id);

    if (activeIndex !== overIndex) {
      reorderSectionItems({
        sectionId: section.id,
        fromIndex: activeIndex,
        toIndex: overIndex,
      });
    }
  };

  if (!currentEditingData) {
    return (
      <Card className="sticky top-[calc(theme(spacing.16)+1rem)] h-fit no-print">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Edit Section</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select an item from the left panel or resume to edit.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isCurrentlyEditingPersonalDetails = editingTarget === 'personalDetails';

  const renderSectionForm = () => {
    if (!currentEditingData || !('title' in currentEditingData)) return null;

    const section = currentEditingData as DynamicResumeSection;
    const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);

    if (!sectionSchema) {
      return <div>Schema not found for {section.schemaId}</div>;
    }

    return (
      <>
        <div>
          <Label htmlFor="sectionTitle">Section Title</Label>
          <Input
            id="sectionTitle"
            value={section.title}
            onChange={handleSectionTitleChange}
          />
        </div>

        {/* Render items for list sections with drag-and-drop */}
        {sectionSchema.type === 'list' && section.items.length > 0 && (
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={section.items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <Accordion type="single" collapsible className="w-full">
                {section.items.map((item, index) => (
                  <SectionItemEditor
                    key={item.id}
                    item={item}
                    section={section}
                    index={index}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))}
              </Accordion>
            </SortableContext>
          </DndContext>
        )}

        {/* Render single item for single sections (no drag-and-drop needed) */}
        {sectionSchema.type === 'single' && section.items.length > 0 && (
          <SectionItemEditor
            item={section.items[0]}
            section={section}
            index={0}
            onRemove={() => {}} // Single items shouldn't be removable
          />
        )}

        {/* Add item button for list sections */}
        {sectionSchema.type === 'list' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="mt-2"
          >
            <PlusCircle size={16} className="mr-2" /> Add Item
          </Button>
        )}

        {/* Cover Letter Generation UI */}
        {section.schemaId === 'cover-letter' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">
                  AI Cover Letter Generator
                </h3>
              </div>
              <p className="text-xs text-blue-700">
                Generate a personalized cover letter based on your resume
                content and target job information.
              </p>
              <Button
                onClick={handleGenerateCoverLetter}
                variant="default"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isGeneratingCoverLetter}
              >
                <Sparkles size={14} className="mr-2" />
                {isGeneratingCoverLetter
                  ? 'Generating...'
                  : 'Generate Cover Letter'}
              </Button>
            </div>
          </div>
        )}
      </>
    );
  };

  const editorTitle = isCurrentlyEditingPersonalDetails
    ? 'Personal Details'
    : currentEditingData && 'title' in currentEditingData
      ? currentEditingData.title
      : 'Edit Section';

  const canBatchImprove =
    currentEditingData &&
    'schemaId' in currentEditingData &&
    schemaRegistry.getSectionSchema(
      (currentEditingData as DynamicResumeSection).schemaId
    )?.aiContext?.batchImprovementSupported;

  return (
    <div className="flex flex-col h-full no-print">
      {/* Header with title and controls */}
      <div className="flex flex-row items-center justify-between py-3 px-4 border-b bg-background flex-shrink-0">
        <h2 className="font-headline text-lg font-semibold text-[#3F51B5]">
          {editorTitle}
        </h2>
        <div className="flex items-center space-x-4">
          {editingTarget !== 'personalDetails' && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Switch
                    id="autocomplete-toggle-nav"
                    className="autocomplete-toggle-switch data-[state=checked]:bg-[#FF9800]"
                    checked={isAutocompleteEnabled}
                    onCheckedChange={toggleAutocomplete}
                    aria-label="Toggle Autocomplete"
                  />
                  <Label
                    htmlFor="autocomplete-toggle-nav"
                    className="text-xs cursor-pointer"
                  >
                    AI Autocomplete
                  </Label>
                </div>
              </HoverCardTrigger>
              <HoverCardPortal>
                <HoverCardContent className="w-72">
                  <div className="flex justify-between items-center space-x-4">
                    <span className="text-xs font-medium">
                      Completion&nbsp;Mode
                    </span>
                    <AutocompleteModelSelector className="w-[220px]" />
                  </div>
                </HoverCardContent>
              </HoverCardPortal>
            </HoverCard>
          )}
          {editingTarget !== 'personalDetails' &&
            canBatchImprove &&
            currentEditingData &&
            'title' in currentEditingData && (
              <BatchImprovementPromptPopover
                onSubmit={handleStartBatchImprove}
                isLoading={batchReview?.isLoading ?? false}
                sectionTitle={currentEditingData.title}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-[#FF9800] hover:text-white hover:border-[#FF9800] focus:bg-[#FF9800] focus:text-white focus:border-[#FF9800]"
                >
                  <Wand2 size={16} className="mr-2" />
                  Batch Improve
                </Button>
              </BatchImprovementPromptPopover>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4 bg-muted/20">
        {isCurrentlyEditingPersonalDetails ? (
          <PersonalDetailsEditor
            personalDetails={currentEditingData as PersonalDetails}
          />
        ) : (
          renderSectionForm()
        )}
      </div>

      {/* No more dialog component needed here */}
    </div>
  );
}
