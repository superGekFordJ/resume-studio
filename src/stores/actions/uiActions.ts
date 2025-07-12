import { StateCreator } from 'zustand';
import { ResumeState, ResumeActions, AIConfig } from '../types';
import { ResumeData } from '@/types/resume';
import { ReviewResumeOutput } from '@/ai/flows/review-resume';

export interface UIActions {
    setResumeData: (data: ResumeData) => void;
    updateResumeData: (updater: (prev: ResumeData) => ResumeData) => void;
    setSelectedTemplateId: (templateId: string) => void;
    setEditingTarget: (target: string | null) => void;
    setIsLeftPanelOpen: (isOpen: boolean) => void;
    toggleLeftPanel: () => void;
    setIsAutocompleteEnabled: (isEnabled: boolean) => void;
    toggleAutocomplete: () => void;
    setIsReviewDialogOpen: (isOpen: boolean) => void;
    toggleReviewDialog: (isOpen?: boolean) => void;
    setReviewContent: (content: ReviewResumeOutput | null) => void;
    setIsReviewLoading: (isLoading: boolean) => void;
    setAIPrompt: (prompt: string) => void;
    updateAIConfig: (config: Partial<AIConfig>) => void;
    exportCurrentSchema: () => void;
}

export const createUIActions: StateCreator<
    ResumeState & ResumeActions,
    [],
    [],
    UIActions
> = (set, get) => ({
    setResumeData: (data) => set({ resumeData: data }),
    updateResumeData: (updater) => set((state) => ({ resumeData: updater(state.resumeData) })),
    setSelectedTemplateId: (templateId) => set({ selectedTemplateId: templateId }),
    setEditingTarget: (target) => set({ editingTarget: target }),
    setIsLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }),
    toggleLeftPanel: () => set((state) => ({ isLeftPanelOpen: !state.isLeftPanelOpen })),
    setIsAutocompleteEnabled: (isEnabled) => set({ isAutocompleteEnabled: isEnabled }),
    toggleAutocomplete: () => set((state) => ({ isAutocompleteEnabled: !state.isAutocompleteEnabled })),
    setIsReviewDialogOpen: (isOpen) => set({ isReviewDialogOpen: isOpen }),
    toggleReviewDialog: (isOpen) => set((state) => ({ 
        isReviewDialogOpen: isOpen !== undefined ? isOpen : !state.isReviewDialogOpen 
    })),
    setReviewContent: (content) => set({ reviewContent: content }),
    setIsReviewLoading: (isLoading) => set({ isReviewLoading: isLoading }),
    setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
    updateAIConfig: (config) => set((state) => ({
        aiConfig: { ...state.aiConfig, ...config }
    })),
    exportCurrentSchema: () => {
        const { resumeData } = get();
        
        const exportData = {
          exportedAt: new Date().toISOString(),
          schemaVersion: ('schemaVersion' in resumeData) ? resumeData.schemaVersion : '1.0.0',
          resumeData: JSON.parse(JSON.stringify(resumeData))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-schema-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('Schema exported successfully:', exportData);
    },
}); 