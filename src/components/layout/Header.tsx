import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Sparkles, Printer, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useResumeStore } from '@/stores/resumeStore';
import { reviewResume } from '@/ai/flows/review-resume';
import { schemaRegistry } from '@/lib/schemaRegistry';
import { useToast } from '@/hooks/use-toast';

interface HeaderProps {
  onExportPdf: () => void;
  onPrint?: () => void;
}

export default function Header({ onExportPdf, onPrint }: HeaderProps) {
  const { toast } = useToast();
  const resumeData = useResumeStore(state => state.resumeData);
  const setIsReviewDialogOpen = useResumeStore(state => state.setIsReviewDialogOpen);
  const setReviewContent = useResumeStore(state => state.setReviewContent);
  const setIsReviewLoading = useResumeStore(state => state.setIsReviewLoading);

  const handleReviewResume = async () => {
    setIsReviewLoading(true);
    setReviewContent(null);
    setIsReviewDialogOpen(true);
    try {
      const resumeText = schemaRegistry.stringifyResumeForReview(resumeData);
      const result = await reviewResume({ resumeText });
      setReviewContent(result);
    } catch (error) {
      console.error("AI Review error:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to get AI review." });
      setReviewContent({ overallQuality: "Error fetching review.", suggestions: "Please try again." });
    } finally {
      setIsReviewLoading(false);
    }
  };

  return (
    <header className="bg-card border-b sticky top-0 z-40 no-print">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-foreground">
            A4 Resume Studio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReviewResume}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Review
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExportPdf()}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </DropdownMenuItem>
              {onPrint && (
                <DropdownMenuItem onClick={() => onPrint()}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Resume
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

    