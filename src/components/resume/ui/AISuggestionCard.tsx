'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiffMethod } from 'react-diff-viewer-continued';

// Dynamically import DiffViewer to avoid SSR issues
const DiffViewer = dynamic(() => import('react-diff-viewer-continued'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-2">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  ),
});

interface AISuggestionCardProps {
  originalValue: string;
  suggestedValue: string;
  isLoading?: boolean;
  fieldName?: string;
  prompt?: string;
  onAccept: () => void;
  onReject: () => void;
  className?: string;
}

export default function AISuggestionCard({
  originalValue,
  suggestedValue,
  isLoading = false,
  fieldName,
  prompt,
  onAccept,
  onReject,
  className,
}: AISuggestionCardProps) {
  const hasChanges = originalValue !== suggestedValue;

  return (
    <Card
      className={cn(
        'mt-2 border-blue-200 bg-blue-50/50 shadow-sm animate-in slide-in-from-top-2 duration-200',
        className
      )}
    >
      {isLoading ? (
        <CardContent className="py-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-700">
              AI is improving your {fieldName || 'field'}...
            </span>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                AI Suggestion
              </span>
              {prompt && (
                <Badge variant="secondary" className="text-xs">
                  {prompt}
                </Badge>
              )}
            </div>

            {hasChanges ? (
              <div className="w-full rounded overflow-hidden border border-gray-200 bg-white">
                <DiffViewer
                  oldValue={originalValue}
                  newValue={suggestedValue}
                  splitView={false}
                  hideLineNumbers={true}
                  showDiffOnly={false}
                  compareMethod={DiffMethod.WORDS}
                  useDarkTheme={false}
                  styles={{
                    variables: {
                      light: {
                        codeFoldGutterBackground: 'transparent',
                        codeFoldBackground: '#f8fafc',
                        diffViewerBackground: '#fafbfc',
                        diffViewerColor: '#2d3748',

                        // AI Suggestions - Brand Orange (what we recommend)
                        addedBackground: '#fff7ed',
                        addedColor: '#1e293b',
                        wordAddedBackground: '#fb923c',

                        // Original Text - Sky Blue (current state)
                        removedBackground: '#f0f9ff',
                        removedColor: '#64748b',
                        wordRemovedBackground: '#0ea5e9',

                        // Structure - Clean integration
                        gutterBackground: 'transparent',
                        gutterColor: 'transparent',
                        addedGutterBackground: 'transparent',
                        removedGutterBackground: 'transparent',
                        highlightBackground: '#fff7ed',
                        emptyLineBackground: '#fafbfc',
                        diffViewerTitleBackground: 'transparent',
                        diffViewerTitleColor: '#1e293b',
                        diffViewerTitleBorderColor: 'transparent',
                      },
                    },
                    diffContainer: {
                      fontSize: '14px',
                      lineHeight: '1.7',
                      width: '100%',
                    },
                    line: {
                      padding: '6px 12px',
                      borderRadius: '4px',
                      margin: '1px 0',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        transition: 'background-color 0.15s ease',
                      },
                    },
                    contentText: {
                      width: '70%', // 减去行号和+/-符号的大致宽度
                      padding: '0 12px 0 0',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Inter, sans-serif',
                    },
                    wordAdded: {
                      color: '#ffffff',
                      fontWeight: '600',
                      borderRadius: '4px',
                      padding: '2px 6px',
                    },
                    wordRemoved: {
                      color: '#ffffff',
                      fontWeight: '500',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      textDecoration: 'line-through',
                    },
                    marker: {
                      width: '5px',
                      padding: '2px 2px',
                      textAlign: 'center',
                    },
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-3 text-sm text-muted-foreground bg-white rounded border border-gray-200">
                No changes suggested - your content looks great!
              </div>
            )}
          </CardContent>

          <CardFooter className="p-3 pt-0 gap-2">
            <Button
              size="sm"
              variant="default"
              onClick={onAccept}
              disabled={!hasChanges}
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <Check className="h-3 w-3 mr-1" />
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onReject}
              className="text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
