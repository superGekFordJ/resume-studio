import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData } from '@/types/resume';
import { initialResumeData } from '@/types/resume';
import type { ReviewResumeOutput } from '@/ai/flows/review-resume';

// State interface
export interface ResumeState {
  resumeData: ResumeData;
  selectedTemplateId: string;
  editingTarget: string | null;
  isLeftPanelOpen: boolean;
  isAutocompleteEnabled: boolean;
  isReviewDialogOpen: boolean;
  reviewContent: ReviewResumeOutput | null;
  isReviewLoading: boolean;
}

// Actions interface
export interface ResumeActions {
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
}

// Create the store with persist middleware
export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set) => ({
      // Initial state
      resumeData: initialResumeData,
      selectedTemplateId: initialResumeData.templateId,
      editingTarget: null,
      isLeftPanelOpen: true,
      isAutocompleteEnabled: true,
      isReviewDialogOpen: false,
      reviewContent: null,
      isReviewLoading: false,

      // Actions
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
    }),
    {
      name: 'resume-studio-storage', // name of the storage key
      merge: (persistedState, currentState) => {
        // Custom merge function to handle nested objects gracefully
        return {
          ...currentState,
          ...(persistedState as ResumeState & ResumeActions),
        };
      },
    }
  )
); 