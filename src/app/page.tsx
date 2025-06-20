"use client";

import { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { ResumeData } from '@/types/resume';
import { initialResumeData } from '@/types/resume';
import Header from '@/components/layout/Header';
import TemplateSelector from '@/components/resume/ui/TemplateSelector';
import ResumeCanvas from '@/components/resume/canvas/ResumeCanvas';
import SectionEditor from '@/components/resume/editor/SectionEditor';
import SectionManager from '@/components/resume/editor/SectionManager';
import SidebarNavigator from '@/components/layout/SidebarNavigator';
import AIReviewDialog from '@/components/resume/ui/AIReviewDialog';
import { reviewResume, ReviewResumeOutput } from '@/ai/flows/review-resume';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { schemaRegistry } from '@/lib/schemaRegistry';

export default function ResumeStudioPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialResumeData.templateId);
  
  const [editingTarget, setEditingTarget] = useState<string | null>(null); // null, 'personalDetails', or sectionId

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState<ReviewResumeOutput | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true);

  // Create ref for ResumeCanvas
  const resumeCanvasRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Set up react-to-print
  const handlePrint = useReactToPrint({
    contentRef: resumeCanvasRef,
    documentTitle: `${resumeData.personalDetails.fullName.replace(/\s+/g, '_')}_Resume`,
    bodyClass: "font-body antialiased",
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
    `,
    onAfterPrint: () => {
      toast({ 
        title: "PDF Export Complete", 
        description: "Your resume has been prepared for printing or saving as PDF." 
      });
    },
    onPrintError: (error, errorLocation) => {
      console.error('Print error:', error, 'at', errorLocation);
      toast({ 
        variant: "destructive", 
        title: "Print Failed", 
        description: "Failed to print resume. Please try again." 
      });
    }
  });

  useEffect(() => {
    setResumeData(prev => ({ ...prev, templateId: selectedTemplateId }));
  }, [selectedTemplateId]);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleUpdateResumeData = (updatedData: ResumeData) => {
    setResumeData(updatedData);
  };

  const handleEditSection = (targetId: string | 'personalDetails') => {
    setEditingTarget(targetId);
  };
  
  const handleCloseEditor = () => {
    setEditingTarget(null);
  };

  const handleBackToStructure = () => {
    setEditingTarget(null);
  };

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

  // Use the same function for both export and print
  const handleExportPdf = handlePrint;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header onReviewResume={handleReviewResume} onExportPdf={handleExportPdf} onPrint={handlePrint} />
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out no-print",
          isLeftPanelOpen ? "w-full md:w-[500px] lg:w-[800px]" : "w-0 md:w-12"
        )}>
          {isLeftPanelOpen ? (
            <SidebarNavigator
              isEditing={editingTarget !== null}
              onBack={handleBackToStructure}
              childrenStructure={
                <ScrollArea className="h-full p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)]">
                    <TemplateSelector
                      selectedTemplateId={selectedTemplateId}
                      onSelectTemplate={handleSelectTemplate}
                    />
                  </div>
                  <div className="mt-6">
                    <SectionManager 
                      resumeData={resumeData} 
                      onUpdateResumeData={handleUpdateResumeData}
                      onEditSection={handleEditSection}
                    />
                  </div>
                </ScrollArea>
              }
              childrenContent={
                <div className="h-full">
                  {editingTarget ? (
                    <SectionEditor
                      key={editingTarget} 
                      resumeData={resumeData}
                      targetToEdit={editingTarget} 
                      onUpdateResumeData={handleUpdateResumeData}
                      onCloseEditor={handleCloseEditor}
                      onBack={handleBackToStructure}
                      isAutocompleteEnabled={isAutocompleteEnabled}
                      onToggleAutocomplete={setIsAutocompleteEnabled}
                    />
                  ) : (
                    <div className="p-4">
                      <p className="text-muted-foreground">No section selected for editing.</p>
                    </div>
                  )}
                </div>
              }
            />
          ) : (
             <div className="hidden md:flex flex-col items-center p-2">
               <Button variant="ghost" size="icon" onClick={() => setIsLeftPanelOpen(true)} className="mt-2">
                  <PanelRightOpen />
               </Button>
             </div>
          )}
        </aside>

        <main className="a4-canvas-container relative flex-grow bg-muted/20">
           {!isLeftPanelOpen && (
             <Button variant="ghost" size="icon" onClick={() => setIsLeftPanelOpen(true)} className="absolute top-4 left-4 z-10 md:hidden no-print">
                <PanelRightOpen />
             </Button>
           )}
           <ResumeCanvas ref={resumeCanvasRef} resumeData={resumeData} />
        </main>
      </div>

      <AIReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        reviewContent={reviewContent}
        isLoading={isReviewLoading}
      />

       <div className="fixed bottom-4 left-4 z-50 md:hidden no-print">
         {!isLeftPanelOpen && (
            <Button variant="secondary" size="icon" onClick={() => setIsLeftPanelOpen(true)}>
                <PanelRightOpen />
            </Button>
         )}
       </div>
    </div>
  );
}
