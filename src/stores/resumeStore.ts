import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { initialResumeData } from '@/types/resume';
import { indexedDbStorage } from './indexedDbStorage';
// import { migrateLegacyResumeIfNeeded } from '@/lib/migrateLegacyResume';
import { ResumeState, ResumeActions } from './types';
import { createDataActions } from './actions/dataActions';
import { createAIActions } from './actions/aiActions';
import { createSnapshotActions } from './actions/snapshotActions';
import { createUIActions } from './actions/uiActions';

// Create the store with persist middleware
export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set, get, api) => ({
      // Initial state
      resumeData: initialResumeData,
      selectedTemplateId: initialResumeData.templateId,
      editingTarget: null,
      isLeftPanelOpen: true,
      isAutocompleteEnabled: true,
      isReviewDialogOpen: false,
      reviewContent: null,
      isReviewLoading: false,
      aiImprovement: null,
      isImprovingFieldId: null,
      batchImprovementReview: null,
      singleFieldImprovementReview: null,
      aiPrompt: '',
      aiConfig: {
        provider: 'google',
        model: 'gemini-2.0-flash',
        targetJobInfo: '',
        userBio: '',
        ollamaServerAddress: 'http://127.0.0.1:11434',
        autocompleteModel: 'default',
      },
      versionSnapshots: [],
      isGeneratingSnapshot: false,
      isGeneratingCoverLetter: false,
      isExtractingJobInfo: false,

      // Actions from slices
      ...createDataActions(set, get, api),
      ...createAIActions(set, get, api),
      ...createSnapshotActions(set, get, api),
      ...createUIActions(set, get, api),

      // New action for setting the autocomplete model
      setAutocompleteModel: (model) =>
        set((state) => ({
          aiConfig: { ...state.aiConfig, autocompleteModel: model },
        })),
    }),
    {
      name: 'resume-studio-storage',
      storage: createJSONStorage(() => indexedDbStorage),

      // This function determines which parts of the state are persisted.
      // We are excluding the API key from being saved to IndexedDB.
      partialize: (state) => {
        const { aiConfig, ...rest } = state;
        const { ...restAiConfig } = aiConfig;
        return { ...rest, aiConfig: restAiConfig };
      },

      // This function merges the persisted state with the in-memory state.
      // It's crucial for keeping non-persisted values (like the API key) alive.
      merge: (persistedState, currentState) => {
        const state = {
          ...currentState,
          ...(persistedState as Partial<ResumeState>),
        };

        // Ensure the API key from the initial state is not overwritten
        // by the (intentionally) missing key from the persisted state.
        state.aiConfig.apiKey = currentState.aiConfig.apiKey;

        // // Migrate legacy resume data if needed
        // if (state.resumeData) {
        //   state.resumeData = migrateLegacyResumeIfNeeded(state.resumeData);
        // }

        return state;
      },
    }
  )
);
