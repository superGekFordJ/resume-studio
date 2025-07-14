"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, X, Sparkles } from "lucide-react";
import { useResumeStore } from '@/stores/resumeStore';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { DiffMethod } from 'react-diff-viewer-continued';
import type { DynamicSectionItem } from '@/types/schema';
import { cn } from "@/lib/utils";

// Dynamically import DiffViewer to avoid SSR issues
const DiffViewer = dynamic(() => import('react-diff-viewer-continued'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center p-4">
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
});

interface ItemDiffProps {
  original: DynamicSectionItem;
  improved: Record<string, any>;
  index: number;
  isChecked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ItemDiff({ original, improved, index, isChecked, onCheckedChange }: ItemDiffProps) {
  const schemaRegistry = SchemaRegistry.getInstance();
  const sectionSchema = schemaRegistry.getSectionSchema(original.schemaId);
  
  if (!sectionSchema) {
    return <div>Schema not found for {original.schemaId}</div>;
  }

  // Convert item data to readable format for comparison
  const formatItem = (itemData: Record<string, any>) => {
    const lines: string[] = [];
    
    for (const field of sectionSchema.fields) {
      const value = itemData[field.id];
      if (value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          lines.push(`${field.label}: ${value.join(', ')}`);
        } else {
          lines.push(`${field.label}: ${value}`);
        }
      }
    }
    
    return lines.join('\n');
  };

  const originalText = formatItem(original.data);
  const improvedText = formatItem(improved);

  // Skip if both texts are the same
  if (originalText === improvedText) {
    return null;
  }

  // Generate a summary title for the accordion item
  const getItemTitle = () => {
    const titleField = sectionSchema.fields.find(f => 
      f.id === 'jobTitle' || f.id === 'title' || f.id === 'degree' || f.id === 'name'
    );
    const subtitleField = sectionSchema.fields.find(f => 
      f.id === 'company' || f.id === 'organization' || f.id === 'institution' || f.id === 'category'
    );
    
    const titleValue = original.data?.[titleField?.id || ''];
    const subtitleValue = original.data?.[subtitleField?.id || ''];
    
    if (titleValue && subtitleValue) {
      return `${titleValue} at ${subtitleValue}`;
    } else if (titleValue) {
      return titleValue;
    } else {
      return `Item ${index + 1}`;
    }
  };

  return (
    <AccordionPrimitive.Item value={`item-${index}`} className="border rounded-lg mb-2 bg-white data-[state=open]:shadow-md">
      <AccordionPrimitive.Header className="flex w-full items-center">
        <div className="pl-4">
          <Checkbox
            checked={isChecked}
            onCheckedChange={onCheckedChange}
            aria-label={`Select item ${index + 1}`}
          />
        </div>
        <AccordionPrimitive.Trigger
          className={cn(
            "flex flex-1 items-center justify-between p-4 font-medium transition-all hover:no-underline [&[data-state=open]>div>svg]:rotate-180"
          )}
        >
          <span className="text-sm font-medium text-left">{getItemTitle()}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Modified</span>
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      >
        <div className="w-[60rem] px-4 pb-4">
          <div className="rounded overflow-hidden border border-gray-200">
              <DiffViewer
                oldValue={originalText}
                newValue={improvedText}
                splitView={false}
                hideLineNumbers={true}
                showDiffOnly={false}
                compareMethod={DiffMethod.WORDS}
                useDarkTheme={false}
                styles={{
                  variables: {
                    light: {
                      diffViewerBackground: '#fafbfc',
                      diffViewerColor: '#2d3748',
                      
                      // AI Suggestions - Brand Orange (what we recommend)
                      addedBackground: '#fff7ed', // Very light orange
                      addedColor: '#1e293b', // Darker for better contrast
                      wordAddedBackground: '#fb923c', // Soft orange for AI suggestions
                      
                      // Original Text - Sky Blue (current state)
                      removedBackground: '#f0f9ff', // Very light sky blue
                      removedColor: '#64748b', // Subtle slate gray
                      wordRemovedBackground: '#0ea5e9', // Sky blue for user's original text
                
                      // Structure - Invisible integration
                      gutterBackground: 'transparent', // Completely seamless
                      gutterBackgroundDark: 'transparent',
                      gutterColor: 'transparent', // Hide line numbers entirely
                      addedGutterBackground: 'transparent',
                      removedGutterBackground: 'transparent',
                
                      // Interactive states - Sophisticated hover
                      highlightBackground: '#fff7ed', // Warm cream on hover
                      highlightGutterBackground: 'transparent',
                
                      // Clean minimalism
                      codeFoldGutterBackground: 'transparent',
                      codeFoldBackground: '#f8fafc',
                      emptyLineBackground: '#fafbfc',
                      codeFoldContentColor: '#3F51B5',
                      diffViewerTitleBackground: 'transparent',
                      diffViewerTitleColor: '#1e293b',
                      diffViewerTitleBorderColor: 'transparent',
                    }
                  },
                  diffContainer: {
                    fontSize: '14px',
                    lineHeight: '1.7', // More spacious for readability
                    fontFamily: 'Inter, sans-serif', // Match our brand fonts
                  },
                  line: {
                    padding: '8px 16px', // More generous padding
                    borderRadius: '6px', // Subtle rounding
                    margin: '2px 0', // Slight separation between lines
                    '&:hover': {
                      backgroundColor: '#f1f5f9',
                      transition: 'background-color 0.15s ease',
                    }
                  },
                  contentText: {
                    width: '93%',
                    padding: '0 16px 0 0',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'Inter, sans-serif',
                  },
                  wordAdded: {
                    color: '#ffffff', // White text on orange background
                    fontWeight: '600', // Slightly bolder for AI suggestions
                    borderRadius: '4px',
                    padding: '2px 6px',
                  },
                  wordRemoved: {
                    color: '#ffffff', // White text on blue background  
                    fontWeight: '500',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    textDecoration: 'line-through',
                  },
                }}
              />
          </div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export default function BatchImprovementDialog() {
  const batchReview = useResumeStore(state => state.batchImprovementReview);
  const acceptBatchImprovement = useResumeStore(state => state.acceptBatchImprovement);
  const rejectBatchImprovement = useResumeStore(state => state.rejectBatchImprovement);

  const isOpen = !!batchReview;

  const getChangedItems = React.useCallback(() => {
    if (!batchReview) return [];
    const { originalItems, improvedItems } = batchReview;

    if (originalItems.length !== improvedItems.length) {
      console.warn(
        'Batch improvement returned a different number of items than the original.',
        {
          originalCount: originalItems.length,
          improvedCount: improvedItems.length,
        }
      );
      // Return empty array to prevent crash
      return [];
    }

    return improvedItems.map((improvedData, index) => ({
        id: originalItems[index].id,
        data: improvedData
    })).filter((_, index) => 
        JSON.stringify(originalItems[index].data) !== JSON.stringify(improvedItems[index])
    );
  }, [batchReview]);

  const [stagedItems, setStagedItems] = React.useState<Array<{id: string, data: any}>>([]);

  React.useEffect(() => {
    if (batchReview) {
      setStagedItems(getChangedItems());
    }
  }, [batchReview, getChangedItems]);
  
  if (!batchReview) return null;

  const { sectionTitle, prompt, originalItems, improvedItems, isLoading, improvementSummary } = batchReview;

  const handleToggleStagedItem = (item: {id: string, data: any}, isChecked: boolean) => {
    setStagedItems(prev => 
      isChecked ? [...prev, item] : prev.filter(staged => staged.id !== item.id)
    );
  };
  
  const handleAccept = () => {
    acceptBatchImprovement(stagedItems);
  };

  const handleReject = () => {
    rejectBatchImprovement();
  };

  const changedItemsCount = getChangedItems().length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        rejectBatchImprovement();
      }
    }}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Batch AI Improvement Review
          </DialogTitle>
          <DialogDescription>
            Reviewing AI improvements for <span className="font-semibold">{sectionTitle}</span> section
            {prompt && <span className="block text-sm mt-1 font-mono bg-muted px-2 py-1 rounded">
              Prompt: "{prompt}"
            </span>}
          </DialogDescription>
          {improvementSummary && (
            <div className="flex items-start gap-2 p-3 mt-2 text-sm text-blue-800 rounded-lg bg-blue-50 border border-blue-200">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="flex-grow"><span className="font-semibold">AI Summary:</span> {improvementSummary}</p>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                <p className="text-sm text-muted-foreground">AI is improving your section...</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              {changedItemsCount === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No improvements to show</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-3">
                    Select the improvements to apply. {stagedItems.length} of {changedItemsCount} changes selected.
                  </div>
                  <AccordionPrimitive.Root type="multiple" className="w-full" defaultValue={
                    getChangedItems().slice(0, 3).map(item => `item-${originalItems.findIndex(orig => orig.id === item.id)}`)
                  }>
                    {originalItems.map((originalItem, index) => {
                      const improvedItemData = improvedItems[index];
                      if (!improvedItemData || JSON.stringify(originalItem.data) === JSON.stringify(improvedItemData)) return null;
                      
                      const improvedItemWithId = { id: originalItem.id, data: improvedItemData };

                      return (
                        <ItemDiff
                          key={originalItem.id}
                          original={originalItem}
                          improved={improvedItemData}
                          index={index}
                          isChecked={stagedItems.some(staged => staged.id === originalItem.id)}
                          onCheckedChange={(checked) => handleToggleStagedItem(improvedItemWithId, checked)}
                        />
                      );
                    })}
                  </AccordionPrimitive.Root>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleReject}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-1" />
            Reject Changes
          </Button>
          <Button 
            onClick={handleAccept}
            disabled={isLoading || stagedItems.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Check className="h-4 w-4 mr-1" />
            Accept Improvements ({stagedItems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 