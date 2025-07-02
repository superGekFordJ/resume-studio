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
                      codeFoldGutterBackground: '#f8f9fa',
                      codeFoldBackground: '#f1f3f4',
                      diffViewerBackground: '#ffffff',
                      addedBackground: '#e6ffec',
                      addedColor: '#24292e',
                      removedBackground: '#ffeef0',
                      removedColor: '#24292e',
                      wordAddedBackground: '#acf2bd',
                      wordRemovedBackground: '#fdb8c0',
                    }
                  },
                  diffContainer: {
                    fontSize: '13px',
                    lineHeight: '1.5',
                  },
                  line: {
                    '&:hover': {
                      background: '#f6f8fa',
                    }
                  },
                  contentText: {
                    width: '93%', // 减去行号和+/-符号的大致宽度
                    padding: '0 10px 0 0',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
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

  const { sectionTitle, prompt, originalItems, improvedItems, isLoading } = batchReview;

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