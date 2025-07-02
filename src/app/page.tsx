"use client";

import { useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import Header from '@/components/layout/Header';
import TemplateSelector from '@/components/resume/ui/TemplateSelector';
import ResumeCanvas from '@/components/resume/canvas/ResumeCanvas';
import SectionEditor from '@/components/resume/editor/SectionEditor';
import SectionManager from '@/components/resume/editor/SectionManager';
import SidebarNavigator from '@/components/layout/SidebarNavigator';
import AIReviewDialog from '@/components/resume/ui/AIReviewDialog';
import BatchImprovementDialog from '@/components/resume/ui/BatchImprovementDialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { useResumeStore } from '@/stores/resumeStore';
import { useHydratedStore } from '@/hooks/useHydratedStore';

export default function ResumeStudioPage() {
  // Use hydrated store to safely access state
  const isLeftPanelOpen = useHydratedStore(useResumeStore, state => state.isLeftPanelOpen);
  const editingTarget = useHydratedStore(useResumeStore, state => state.editingTarget);
  const resumeData = useHydratedStore(useResumeStore, state => state.resumeData);

  // Create ref for ResumeCanvas
  const resumeCanvasRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Set up react-to-print
  const handlePrint = useReactToPrint({
    contentRef: resumeCanvasRef,
    documentTitle: resumeData ? `${resumeData.personalDetails.fullName.replace(/\s+/g, '_')}_Resume` : 'Resume',
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

  // Get selectedTemplateId from store to watch for changes
  const selectedTemplateId = useResumeStore(state => state.selectedTemplateId);
  
  // Sync template changes to resumeData
  useEffect(() => {
    const currentResumeData = useResumeStore.getState().resumeData;

    if (selectedTemplateId && currentResumeData && currentResumeData.templateId !== selectedTemplateId) {
      useResumeStore.getState().updateResumeData(prev => ({ ...prev, templateId: selectedTemplateId }));
    }
  }, [selectedTemplateId]);

  // Use the same function for both export and print
  const handleExportPdf = handlePrint;

  // Handle loading state during hydration
  // Note: editingTarget can be null (no section being edited) - this is normal, not a loading state
  if (isLeftPanelOpen === null || resumeData === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header onExportPdf={handleExportPdf} onPrint={handlePrint} />
      <div className="flex flex-1 overflow-hidden">
        <aside className={cn(
          "bg-card border-r transition-all duration-300 ease-in-out no-print",
          isLeftPanelOpen ? "w-full md:w-[500px] lg:w-[800px]" : "w-0 md:w-12"
        )}>
          {isLeftPanelOpen ? (
            <SidebarNavigator
              childrenStructure={
                <ScrollArea className="h-full p-4">
                  <div className="grid grid-cols-[minmax(0,1fr)]">
                    <TemplateSelector />
                  </div>
                  <div className="mt-6">
                    <SectionManager />
                  </div>
                </ScrollArea>
              }
              childrenContent={
                <div className="h-full">
                  {editingTarget ? (
                    <SectionEditor key={editingTarget} />
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
               <Button variant="ghost" size="icon" onClick={() => useResumeStore.getState().setIsLeftPanelOpen(true)} className="mt-2">
                  <PanelRightOpen />
               </Button>
             </div>
          )}
        </aside>

        <main className="a4-canvas-container relative flex-grow bg-muted/20">
           {!isLeftPanelOpen && (
             <Button variant="ghost" size="icon" onClick={() => useResumeStore.getState().setIsLeftPanelOpen(true)} className="absolute top-4 left-4 z-10 md:hidden no-print">
                <PanelRightOpen />
             </Button>
           )}
           <ResumeCanvas ref={resumeCanvasRef} />
        </main>
      </div>

      <AIReviewDialog />
      <BatchImprovementDialog />

       <div className="fixed bottom-4 left-4 z-50 md:hidden no-print">
         {!isLeftPanelOpen && (
            <Button variant="secondary" size="icon" onClick={() => useResumeStore.getState().setIsLeftPanelOpen(true)}>
                <PanelRightOpen />
            </Button>
         )}
       </div>
    </div>
  );
}
