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
import { ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useResumeStore } from '@/stores/resumeStore';

interface AIReviewDialogProps {
  // No props needed anymore
}

export default function AIReviewDialog({}: AIReviewDialogProps) {
  const isOpen = useResumeStore(state => state.isReviewDialogOpen);
  const reviewContent = useResumeStore(state => state.reviewContent);
  const isLoading = useResumeStore(state => state.isReviewLoading);
  const setIsReviewDialogOpen = useResumeStore(state => state.setIsReviewDialogOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsReviewDialogOpen}>
      <DialogContent className="sm:max-w-lg md:max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 flex-shrink-0">
          <DialogTitle className="font-headline text-2xl flex items-center">
            <ThumbsUp className="mr-2 h-6 w-6 text-primary" />
            AI Resume Review
          </DialogTitle>
          <DialogDescription>
            Here's an AI-powered analysis of your resume with suggestions for improvement.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          <div className="py-4">
            {isLoading && (
              <div className="space-y-4">
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
              <div className="space-y-6 text-sm">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                    Overall Quality Assessment
                  </h3>
                  <div className="text-foreground space-y-2 [&>p]:leading-relaxed [&>ul]:ml-6 [&>ul]:list-disc [&>ul]:space-y-1 [&>ol]:ml-6 [&>ol]:list-decimal [&>ol]:space-y-1 [&>blockquote]:border-l-2 [&>blockquote]:pl-4 [&>blockquote]:italic [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded-md [&>pre]:overflow-x-auto [&>code]:bg-muted [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reviewContent.overallQuality}
                    </ReactMarkdown>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-accent" />
                    Actionable Suggestions
                  </h3>
                  <div className="text-foreground space-y-2 [&>p]:leading-relaxed [&>ul]:ml-6 [&>ul]:list-disc [&>ul]:space-y-1 [&>ol]:ml-6 [&>ol]:list-decimal [&>ol]:space-y-1 [&>blockquote]:border-l-2 [&>blockquote]:pl-4 [&>blockquote]:italic [&>pre]:bg-muted [&>pre]:p-3 [&>pre]:rounded-md [&>pre]:overflow-x-auto [&>code]:bg-muted [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reviewContent.suggestions}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !reviewContent && (
              <p className="text-muted-foreground">No review content available. Please try again.</p>
            )}
          </div>
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
          <Button onClick={() => setIsReviewDialogOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    