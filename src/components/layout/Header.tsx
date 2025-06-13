import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, Sparkles } from "lucide-react";

interface HeaderProps {
  onReviewResume: () => void;
  onExportPdf: () => void; // Placeholder for PDF export functionality
}

export default function Header({ onReviewResume, onExportPdf }: HeaderProps) {
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
          <Button variant="outline" size="sm" onClick={onReviewResume}>
            <Sparkles className="mr-2 h-4 w-4" />
            AI Review
          </Button>
          <Button variant="default" size="sm" onClick={onExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
    </header>
  );
}

    