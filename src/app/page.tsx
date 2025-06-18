"use client";

import { useState, useEffect } from 'react';
import type { ResumeData } from '@/types/resume';
import { initialResumeData } from '@/types/resume';
import Header from '@/components/layout/Header';
import TemplateSelector from '@/components/resume/TemplateSelector';
import ResumeCanvas from '@/components/resume/ResumeCanvas';
import SectionEditor from '@/components/resume/SectionEditor';
import SectionManager from '@/components/resume/SectionManager';
import SidebarNavigator from '@/components/layout/SidebarNavigator';
import AIReviewDialog from '@/components/resume/AIReviewDialog';
import { reviewResume, ReviewResumeOutput } from '@/ai/flows/review-resume';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";

export default function ResumeStudioPage() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialResumeData.templateId);
  
  const [editingTarget, setEditingTarget] = useState<string | null>(null); // null, 'personalDetails', or sectionId

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState<ReviewResumeOutput | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(true);


  const { toast } = useToast();

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

  const stringifyResumeForReview = (data: ResumeData): string => {
    let content = `Resume for ${data.personalDetails.fullName} (${data.personalDetails.jobTitle})\n\nContact: ${data.personalDetails.email} | ${data.personalDetails.phone} | ${data.personalDetails.address}\nLinks: LinkedIn: ${data.personalDetails.linkedin || 'N/A'}, GitHub: ${data.personalDetails.github || 'N/A'}, Portfolio: ${data.personalDetails.portfolio || 'N/A'}\n\n`;
    
    data.sections.forEach(section => {
      if (section.visible) {
        content += `--- ${section.title.toUpperCase()} ---\n`;
        
        // Check if this is a dynamic section (has schemaId) or legacy section (has type)
        if ('schemaId' in section) {
          // Dynamic section
          const dynamicSection = section as any; // DynamicResumeSection
          content += `[Dynamic Section - Schema: ${dynamicSection.schemaId}]\n`;
          
          dynamicSection.items.forEach((item: any) => {
            // item is DynamicSectionItem with data property
            const itemData = item.data;
            
            switch (dynamicSection.schemaId) {
              case 'advanced-skills':
                content += `Category: ${itemData.category || 'N/A'}\n`;
                if (Array.isArray(itemData.skills)) {
                  content += `Skills: ${itemData.skills.join(', ')}\n`;
                } else if (itemData.skills) {
                  content += `Skills: ${itemData.skills}\n`;
                }
                if (itemData.proficiency) content += `Proficiency: ${itemData.proficiency}\n`;
                if (itemData.yearsOfExperience) content += `Experience: ${itemData.yearsOfExperience} years\n`;
                content += '\n';
                break;
                
              case 'projects':
                content += `Project: ${itemData.name || 'Unnamed Project'}\n`;
                if (itemData.description) content += `Description: ${itemData.description}\n`;
                if (itemData.url) content += `URL: ${itemData.url}\n`;
                if (Array.isArray(itemData.technologies)) {
                  content += `Technologies: ${itemData.technologies.join(', ')}\n`;
                } else if (itemData.technologies) {
                  content += `Technologies: ${itemData.technologies}\n`;
                }
                if (itemData.startDate || itemData.endDate) {
                  content += `Duration: ${itemData.startDate || 'N/A'} - ${itemData.endDate || 'Present'}\n`;
                }
                content += '\n';
                break;
                
              default:
                // Generic dynamic section handling
                content += `[${dynamicSection.schemaId} item]\n`;
                Object.entries(itemData).forEach(([key, value]) => {
                  if (value) {
                    if (Array.isArray(value)) {
                      content += `${key}: ${value.join(', ')}\n`;
                    } else {
                      content += `${key}: ${value}\n`;
                    }
                  }
                });
                content += '\n';
                break;
            }
          });
        } else {
          // Legacy section
          const legacySection = section as any;
          if (legacySection.type === 'summary' || legacySection.type === 'customText') {
            content += `${(legacySection.items[0] as any)?.content || ''}\n\n`;
          } else {
            legacySection.items.forEach((item: any) => {
              if ('jobTitle' in item) content += `${item.jobTitle} at ${item.company} (${item.startDate} - ${item.endDate})\n${item.description}\n\n`;
              else if ('degree' in item) content += `${item.degree} from ${item.institution} (${item.graduationYear})\n${item.details || ''}\n\n`;
              else if ('name' in item) content += `- ${item.name}\n`;
            });
            if (legacySection.type === 'skills') content += '\n';
          }
        }
      }
    });
    return content;
  };

  const handleReviewResume = async () => {
    setIsReviewLoading(true);
    setReviewContent(null);
    setIsReviewDialogOpen(true);
    try {
      const resumeText = stringifyResumeForReview(resumeData);
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

  const handleExportPdf = async () => {
    try {
      const { exportResumeToPDF } = await import('@/lib/pdfExport');
      await exportResumeToPDF(resumeData);
      toast({ 
        title: "PDF Export Ready", 
        description: "Please use your browser's print dialog to save as PDF for best quality." 
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({ 
        variant: "destructive", 
        title: "Export Failed", 
        description: "Failed to export PDF. Please try again." 
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Header onReviewResume={handleReviewResume} onExportPdf={handleExportPdf} />
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
                  <TemplateSelector
                    selectedTemplateId={selectedTemplateId}
                    onSelectTemplate={handleSelectTemplate}
                  />
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
           <ResumeCanvas resumeData={resumeData} />
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
