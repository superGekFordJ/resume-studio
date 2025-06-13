"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AIReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reviewContent: { overallQuality: string; suggestions: string } | null;
  isLoading: boolean;
}

export default function AIReviewDialog({
  isOpen,
  onClose,
  reviewContent,
  isLoading,
}: AIReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center">
            <ThumbsUp className="mr-2 h-6 w-6 text-primary" />
            AI Resume Review
          </DialogTitle>
          <DialogDescription>
            Here's an AI-powered analysis of your resume with suggestions for improvement.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-6 -mr-6">
          {isLoading && (
            <div className="space-y-4 my-4">
              <div>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
              <div>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
                <Skeleton className="h-4 w-full mt-1" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </div>
            </div>
          )}
          {!isLoading && reviewContent && (
            <div className="space-y-6 my-4 text-sm">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                  Overall Quality Assessment
                </h3>
                <p className="text-foreground/90 whitespace-pre-line">{reviewContent.overallQuality}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-accent" />
                  Actionable Suggestions
                </h3>
                <p className="text-foreground/90 whitespace-pre-line">{reviewContent.suggestions}</p>
              </div>
            </div>
          )}
          {!isLoading && !reviewContent && (
            <p className="my-4 text-muted-foreground">No review content available. Please try again.</p>
          )}
        </ScrollArea>
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    