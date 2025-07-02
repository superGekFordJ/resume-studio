import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData, PersonalDetails } from '@/types/resume';
import { initialResumeData } from '@/types/resume';
import type { ReviewResumeOutput } from '@/ai/flows/review-resume';
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { indexedDbStorage } from './indexedDbStorage';
import { migrateLegacyResumeIfNeeded } from '@/lib/migrateLegacyResume';

// Version Snapshot interface
export interface VersionSnapshot {
  id: string;
  name: string;
  createdAt: string;
  schemaVersion: string;
  resumeData: ResumeData;
}

// AI Config interface
export interface AIConfig {
  provider: 'google' | 'ollama' | 'anthropic';
  model: string;
  apiKey?: string; // Stored in memory, not persisted
  targetJobInfo?: string;
  userBio?: string;
  ollamaServerAddress?: string; // For Ollama users
}

// NEW: Batch improvement review state
export interface BatchImprovementReview {
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  originalItems: any[];
  improvedItems: any[];
  isLoading: boolean;
}

// NEW: Single field improvement review state
export interface SingleFieldImprovementReview {
  uniqueFieldId: string;
  sectionId: string;
  itemId?: string;
  fieldId: string;
  originalText: string;
  improvedText: string;
  prompt: string;
  isPersonalDetails?: boolean;
  isLoading: boolean;
}

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
  // DEPRECATED: Keep for backward compatibility but will be removed
  aiImprovement: {
    uniqueFieldId: string;
    suggestion: string;
    originalText: string;
  } | null;
  isImprovingFieldId: string | null;
  // NEW: Dialog-based improvement states
  batchImprovementReview: BatchImprovementReview | null;
  singleFieldImprovementReview: SingleFieldImprovementReview | null;
  aiPrompt: string;
  aiConfig: AIConfig;
  versionSnapshots: VersionSnapshot[]; // NEW: Version snapshots
  isGeneratingSnapshot: boolean; // For resume generation loading state
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
  updateField: (payload: { 
    sectionId: string; 
    itemId?: string; 
    fieldId: string; 
    value: any; 
    isPersonalDetails?: boolean 
  }) => void;
  updateSectionTitle: (payload: { sectionId: string; newTitle: string }) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (payload: { sectionId: string; itemId: string }) => void;
  setAIPrompt: (prompt: string) => void;
  // DEPRECATED: Keep for backward compatibility
  startAIImprovement: (payload: { 
    sectionId: string; 
    itemId?: string; 
    fieldId: string; 
    currentValue: string; 
    uniqueFieldId: string; 
    isPersonalDetails?: boolean 
  }) => Promise<void>;
  acceptAIImprovement: () => void;
  rejectAIImprovement: () => void;
  // NEW: Dialog-based improvement actions
  startBatchImprovement: (sectionId: string, prompt: string) => Promise<void>;
  acceptBatchImprovement: (itemsToAccept: Array<{id: string, data: any}>) => void;
  rejectBatchImprovement: () => void;
  startSingleFieldImprovement: (payload: {
    uniqueFieldId: string;
    sectionId: string;
    itemId?: string;
    fieldId: string;
    currentValue: string;
    prompt: string;
    isPersonalDetails?: boolean;
  }) => Promise<void>;
  acceptSingleFieldImprovement: () => void;
  rejectSingleFieldImprovement: () => void;
  updateAIConfig: (config: Partial<AIConfig>) => void;
  // DEPRECATED: Will be replaced by startBatchImprovement
  batchImproveSection: (sectionId: string, prompt: string) => Promise<void>;
  // NEW: Version snapshot actions
  createSnapshot: (name: string, dataToSnapshot?: ResumeData) => void;
  restoreSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  updateSnapshotName: (snapshotId: string, newName: string) => void;
  // NEW: AI-powered data import actions
  extractJobInfoFromImage: (file: File) => Promise<void>;
  updateUserBioFromFile: (file: File) => Promise<void>;
  generateResumeSnapshotFromBio: () => Promise<void>;
  // NEW: Export current schema for development/debugging
  exportCurrentSchema: () => void;
}

// Helper function to read file as Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result includes a data URL prefix (e.g., "data:image/png;base64,"), so we strip it.
      const base64String = (reader.result as string).split(',')[1];
      if (base64String) {
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to Base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Create the store with persist middleware
export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set, get) => ({
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
      },
      versionSnapshots: [], // NEW: Initialize empty snapshots array
      isGeneratingSnapshot: false,

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
      
      // NEW: Data manipulation actions
      updateField: (payload) => set((state) => {
        if (payload.isPersonalDetails) {
          // Update personal details field
          return {
            resumeData: {
              ...state.resumeData,
              personalDetails: {
                ...state.resumeData.personalDetails,
                [payload.fieldId]: payload.value
              } as PersonalDetails
            }
          };
        } else {
          // Update section field
          return {
            resumeData: {
              ...state.resumeData,
              sections: state.resumeData.sections.map(section => {
                if (section.id !== payload.sectionId) return section;
                
                // All sections are now dynamic
                  const dynamicSection = section as DynamicResumeSection;
                  return {
                    ...dynamicSection,
                    items: dynamicSection.items.map(item =>
                      item.id === payload.itemId
                        ? { ...item, data: { ...item.data, [payload.fieldId]: payload.value } }
                        : item
                    )
                  };
              })
            }
          };
        }
      }),
      
      updateSectionTitle: (payload) => set((state) => ({
        resumeData: {
          ...state.resumeData,
          sections: state.resumeData.sections.map(section =>
            section.id === payload.sectionId
              ? { ...section, title: payload.newTitle }
              : section
          )
        }
      })),
      
      addSectionItem: (sectionId) => set((state) => {
        const schemaRegistry = SchemaRegistry.getInstance();
        const updatedSections = state.resumeData.sections.map(section => {
          if (section.id !== sectionId) return section;
          
          // All sections are now dynamic
            const dynamicSection = section as DynamicResumeSection;
            const sectionSchema = schemaRegistry.getSectionSchema(dynamicSection.schemaId);
            if (!sectionSchema) return section;
            
            // For single type sections, only allow one item
            if (sectionSchema.type === 'single' && dynamicSection.items.length > 0) {
              return section;
            }
            
            const newItemId = `${dynamicSection.schemaId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            const newItem: DynamicSectionItem = {
              id: newItemId,
              schemaId: dynamicSection.schemaId,
              data: {},
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                aiGenerated: false
              }
            };
            
            return {
              ...dynamicSection,
              items: [...dynamicSection.items, newItem]
            };
        });
        
        return { resumeData: { ...state.resumeData, sections: updatedSections } };
      }),
      
      removeSectionItem: (payload) => set((state) => ({
        resumeData: {
          ...state.resumeData,
          sections: state.resumeData.sections.map(section => {
            if (section.id !== payload.sectionId) return section;
            
              return {
                ...section,
                items: section.items.filter((item: any) => item.id !== payload.itemId)
              };
          })
        }
      })),
      
      // NEW: AI Improvement flow actions
      setAIPrompt: (prompt) => set({ aiPrompt: prompt }),
      
      startAIImprovement: async (payload) => {
        const schemaRegistry = SchemaRegistry.getInstance();
        const state = get();
        
        set({ 
          isImprovingFieldId: payload.uniqueFieldId,
          aiImprovement: null
        });
        
        try {
          let improvedText: string;
          
          if (payload.isPersonalDetails) {
            // For personal details, use the legacy flow directly for now
            const { improveResumeSection } = await import('@/ai/flows/improve-resume-section');
            const context = {
              currentItemContext: `Personal Details Field: ${payload.fieldId}`,
              otherSectionsContext: schemaRegistry.stringifyResumeForReview(state.resumeData),
              userJobTitle: state.resumeData.personalDetails?.jobTitle || '',
              userJobInfo: state.aiConfig.targetJobInfo,
              userBio: state.aiConfig.userBio
            };
            
            const result = await improveResumeSection({
              resumeSection: payload.currentValue,
              prompt: state.aiPrompt,
              context: context,
              sectionType: 'personalDetailsField'
            });
            
            improvedText = result.improvedResumeSection;
          } else {
            // Use SchemaRegistry for all section fields
            improvedText = await schemaRegistry.improveField({
              resumeData: state.resumeData,
              sectionId: payload.sectionId,
              itemId: payload.itemId || '',
              fieldId: payload.fieldId,
              currentValue: payload.currentValue,
              prompt: state.aiPrompt,
              aiConfig: state.aiConfig
            });
          }
          
          if (improvedText) {
            set({
              aiImprovement: {
                uniqueFieldId: payload.uniqueFieldId,
                suggestion: improvedText,
                originalText: payload.currentValue
              },
              isImprovingFieldId: null
            });
          } else {
            set({
              aiImprovement: null,
              isImprovingFieldId: null
            });
          }
        } catch (error) {
          console.error('AI improvement error:', error);
          set({
            aiImprovement: null,
            isImprovingFieldId: null
          });
        }
      },
      
      acceptAIImprovement: () => {
        const state = get();
        if (!state.aiImprovement) return;
        
        // Parse the unique field ID to determine how to update
        const parts = state.aiImprovement.uniqueFieldId.split('_');
        const isPersonal = parts[0] === 'personal';
        
        if (isPersonal) {
          const fieldName = parts.slice(1).join('_');
          state.updateField({
            sectionId: '',
            fieldId: fieldName,
            value: state.aiImprovement.suggestion,
            isPersonalDetails: true
          });
        } else {
          const fieldName = parts.pop()!;
          const sectionType = parts.pop()!;
          const itemId = parts.join('_').replace(/-/g, '_');
          
          // Find the section ID from the editing target
          const sectionId = state.editingTarget || '';
          state.updateField({
            sectionId,
            itemId,
            fieldId: fieldName,
            value: state.aiImprovement.suggestion,
            isPersonalDetails: false
          });
        }
        
        set({ 
          aiImprovement: null,
          aiPrompt: ''
        });
      },
      
      rejectAIImprovement: () => set({ 
        aiImprovement: null,
        isImprovingFieldId: null
      }),
      
      updateAIConfig: (config) => set((state) => ({
        aiConfig: { ...state.aiConfig, ...config }
      })),

      // NEW: Dialog-based improvement actions
      startBatchImprovement: async (sectionId: string, prompt: string) => {
        const state = get();
        const section = state.resumeData.sections.find(s => s.id === sectionId) as DynamicResumeSection;
        if (!section) {
          console.error('Section not found');
          return;
        }

        // Set loading state
        set({
          batchImprovementReview: {
            sectionId,
            sectionTitle: section.title,
            prompt,
            originalItems: section.items.map(item => ({ ...item })),
            improvedItems: [],
            isLoading: true
          }
        });

        try {
          const { AIDataBridge } = await import('@/lib/aiDataBridge');
          const { SchemaRegistry } = await import('@/lib/schemaRegistry');
          const { batchImproveSection } = await import('@/ai/flows/batch-improve-section');
          
          const schemaRegistry = SchemaRegistry.getInstance();
          
          // Check if batch improvement is supported
          const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
          if (!sectionSchema?.aiContext?.batchImprovementSupported) {
            console.error('Batch improvement not supported for this section type');
            set({ batchImprovementReview: null });
            return;
          }

          // Convert section to AI-friendly format
          const aiSection = AIDataBridge.fromSection(section, schemaRegistry);
          
          // Call AI flow
          const result = await batchImproveSection({
            section: aiSection,
            improvementGoals: [prompt],
            userJobTitle: state.resumeData.personalDetails?.jobTitle,
            userJobInfo: state.aiConfig.targetJobInfo,
            userBio: state.aiConfig.userBio,
            otherSectionsContext: schemaRegistry.stringifyResumeForReview(state.resumeData)
          });

          if (result && result.improvedSection) {
            // Update review state with improved items
            set((currentState) => {
              if (!currentState.batchImprovementReview) return currentState;
              return {
                batchImprovementReview: {
                  ...currentState.batchImprovementReview,
                  improvedItems: result.improvedSection.items,
                  isLoading: false
                }
              };
            });
          } else {
            set({ batchImprovementReview: null });
          }
        } catch (error) {
          console.error('Batch improvement error:', error);
          set({ batchImprovementReview: null });
        }
      },

      acceptBatchImprovement: (itemsToAccept: Array<{id: string, data: any}>) => {
        const state = get();
        if (!state.batchImprovementReview) return;

        const { sectionId } = state.batchImprovementReview;
        const { AIDataBridge } = require('@/lib/aiDataBridge');
        
        // Apply the staged improvements to the resume data
        const updatedResumeData = AIDataBridge.mergeImprovedSection(
          state.resumeData,
          sectionId,
          itemsToAccept,
        );

        set({
          resumeData: updatedResumeData,
          batchImprovementReview: null,
          aiPrompt: ''
        });
      },

      rejectBatchImprovement: () => set({ 
        batchImprovementReview: null 
      }),

      startSingleFieldImprovement: async (payload) => {
        const state = get();
        
        // Set loading state
        set({
          singleFieldImprovementReview: {
            uniqueFieldId: payload.uniqueFieldId,
            sectionId: payload.sectionId,
            itemId: payload.itemId,
            fieldId: payload.fieldId,
            originalText: payload.currentValue,
            improvedText: '',
            prompt: payload.prompt,
            isPersonalDetails: payload.isPersonalDetails,
            isLoading: true
          }
        });

        try {
          const schemaRegistry = SchemaRegistry.getInstance();
          let improvedText: string;
          
          if (payload.isPersonalDetails) {
            // For personal details, use the legacy flow directly
            const { improveResumeSection } = await import('@/ai/flows/improve-resume-section');
            const context = {
              currentItemContext: `Personal Details Field: ${payload.fieldId}`,
              otherSectionsContext: schemaRegistry.stringifyResumeForReview(state.resumeData),
              userJobTitle: state.resumeData.personalDetails?.jobTitle || '',
              userJobInfo: state.aiConfig.targetJobInfo,
              userBio: state.aiConfig.userBio
            };
            
            const result = await improveResumeSection({
              resumeSection: payload.currentValue,
              prompt: payload.prompt,
              context: context,
              sectionType: 'personalDetailsField'
            });
            
            improvedText = result.improvedResumeSection;
          } else {
            // Use SchemaRegistry for all section fields
            improvedText = await schemaRegistry.improveField({
              resumeData: state.resumeData,
              sectionId: payload.sectionId,
              itemId: payload.itemId || '',
              fieldId: payload.fieldId,
              currentValue: payload.currentValue,
              prompt: payload.prompt,
              aiConfig: state.aiConfig
            });
          }
          
          if (improvedText) {
            set((currentState) => {
              if (!currentState.singleFieldImprovementReview) return currentState;
              return {
                singleFieldImprovementReview: {
                  ...currentState.singleFieldImprovementReview,
                  improvedText,
                  isLoading: false
                }
              };
            });
          } else {
            set({ singleFieldImprovementReview: null });
          }
        } catch (error) {
          console.error('Single field improvement error:', error);
          set({ singleFieldImprovementReview: null });
        }
      },

      acceptSingleFieldImprovement: () => {
        const state = get();
        if (!state.singleFieldImprovementReview) return;

        const { 
          sectionId, 
          itemId, 
          fieldId, 
          improvedText, 
          isPersonalDetails 
        } = state.singleFieldImprovementReview;

        // Apply the improvement
        if (isPersonalDetails) {
          state.updateField({
            sectionId: '',
            fieldId,
            value: improvedText,
            isPersonalDetails: true
          });
        } else {
          state.updateField({
            sectionId,
            itemId,
            fieldId,
            value: improvedText,
            isPersonalDetails: false
          });
        }

        set({ 
          singleFieldImprovementReview: null,
          aiPrompt: ''
        });
      },

      rejectSingleFieldImprovement: () => set({ 
        singleFieldImprovementReview: null 
      }),

      // DEPRECATED: Keep for backward compatibility - will be removed
      batchImproveSection: async (sectionId: string, prompt: string) => {
        const state = get();
        const { AIDataBridge } = await import('@/lib/aiDataBridge');
        const { SchemaRegistry } = await import('@/lib/schemaRegistry');
        const { batchImproveSection } = await import('@/ai/flows/batch-improve-section');
        
        const schemaRegistry = SchemaRegistry.getInstance();
        
        // Find the section
        const section = state.resumeData.sections.find(s => s.id === sectionId) as DynamicResumeSection;
        if (!section) {
          console.error('Section not found');
          return;
        }
        
        // Check if batch improvement is supported
        const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
        if (!sectionSchema?.aiContext?.batchImprovementSupported) {
          console.error('Batch improvement not supported for this section type');
          return;
        }
        
        try {
          // Convert section to AI-friendly format
          const aiSection = AIDataBridge.fromSection(section, schemaRegistry);
          
          // Call AI flow
          const result = await batchImproveSection({
            section: aiSection,
            improvementGoals: [prompt],
            userJobTitle: state.resumeData.personalDetails?.jobTitle,
            userJobInfo: state.aiConfig.targetJobInfo,
            userBio: state.aiConfig.userBio,
            otherSectionsContext: schemaRegistry.stringifyResumeForReview(state.resumeData)
          });
          
          if (result && result.improvedSection) {
            // This is the deprecated path. We'll merge all items.
            const itemsToMerge = result.improvedSection.items.map((itemData, index) => ({
                id: section.items[index].id,
                data: itemData
            }));

            // Merge improved section back into resume data
            const updatedResumeData = AIDataBridge.mergeImprovedSection(
              state.resumeData,
              sectionId,
              itemsToMerge
            );
            
            set({ resumeData: updatedResumeData });
          }
        } catch (error) {
          console.error('Batch improvement error:', error);
        }
      },

      // NEW: AI-powered data import action
      extractJobInfoFromImage: async (file) => {
        if (!file.type.startsWith('image/')) {
          console.error('Invalid file type. Please upload an image.');
          // Optionally, add user-facing feedback, e.g., a toast notification.
          return;
        }

        try {
          const imageBase64 = await fileToBase64(file);
          const { getJobInfoFromImage } = await import('@/ai/flows/getJobInfoFromImage');
          const extractedText = await getJobInfoFromImage({ imageBase64, contentType: file.type || 'image/png' });
          
          if (extractedText) {
            get().updateAIConfig({ targetJobInfo: extractedText });
          } else {
            console.error('AI failed to extract text from the image.');
            // Optionally, add user-facing feedback.
          }
        } catch (error) {
          console.error('Error processing image for job info extraction:', error);
          // Optionally, add user-facing feedback.
        }
      },

      updateUserBioFromFile: async (file) => {
        const { updateAIConfig } = get();
        let text = '';
        try {
          if (file.type === 'application/pdf') {
            const pdfjs = await import('pdfjs-dist');
            // Dynamically import the worker. This is a common pattern for Next.js.
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            
            const doc = await pdfjs.getDocument(await file.arrayBuffer()).promise;
            for (let i = 1; i <= doc.numPages; i++) {
              const page = await doc.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item: any) => item.str).join(' ');
            }
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docx = await import('docx-preview');
            // docx-preview renders into a container, it doesn't return text directly.
            // We can create a dummy container, render to it, and then extract the text.
            const dummyContainer = document.createElement('div');
            await docx.renderAsync(file, dummyContainer);
            text = dummyContainer.innerText;
          } else {
            console.error('Unsupported file type:', file.type);
            return;
          }
          updateAIConfig({ userBio: text });
        } catch (error) {
          console.error('Error parsing file:', error);
        }
      },

      generateResumeSnapshotFromBio: async () => {
        set({ isGeneratingSnapshot: true });
        const { aiConfig, createSnapshot } = get();
        const { userBio, targetJobInfo } = aiConfig;

        if (!userBio || !targetJobInfo) {
          console.error('User bio or target job info is missing.');
          set({ isGeneratingSnapshot: false });
          return;
        }

        try {
          const { generateResumeFromContext } = await import('@/ai/flows/generateResumeFromContext');
          const { AIDataBridge } = await import('@/lib/aiDataBridge');
          const { SchemaRegistry } = await import('@/lib/schemaRegistry');

          const schemaRegistry = SchemaRegistry.getInstance();

          const aiResult = await generateResumeFromContext({
            bio: userBio,
            jobDescription: targetJobInfo,
          });

          if (aiResult) {
            const newResumeData = AIDataBridge.toExtendedResumeData(aiResult, schemaRegistry);
            
            const snapshotName = `AI Generated - ${new Date().toLocaleDateString()}`;
            createSnapshot(snapshotName, newResumeData);

          } else {
            throw new Error('AI generation returned no result.');
          }

        } catch (error) {
          console.error('Error generating resume snapshot:', error);
        } finally {
          set({ isGeneratingSnapshot: false });
        }
      },

      // NEW: Version snapshot actions
      createSnapshot: (name, dataToSnapshot) => set((state) => {
        const data = dataToSnapshot || state.resumeData;
        // Extract schema version from resumeData or default to '1.0.0'
        const schemaVersion = ('schemaVersion' in data) ? data.schemaVersion : '1.0.0';
        
        // Optimization: Deep clone and remove the avatar's base64 string before snapshotting.
        const clonedData = JSON.parse(JSON.stringify(data));
        if (clonedData.personalDetails) {
          clonedData.personalDetails.avatar = ''; 
        }

        const newSnapshot: VersionSnapshot = {
          id: `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name,
          createdAt: new Date().toISOString(),
          schemaVersion,
          resumeData: clonedData // Use the optimized, smaller data object
        };
        
        return {
          versionSnapshots: [...state.versionSnapshots, newSnapshot]
        };
      }),

      restoreSnapshot: (snapshotId) => set((state) => {
        const snapshot = state.versionSnapshots.find(s => s.id === snapshotId);
        if (!snapshot) {
          console.error(`Snapshot ${snapshotId} not found`);
          return state;
        }
        
        // Compare schema versions
        const currentSchemaVersion = ('schemaVersion' in state.resumeData) 
          ? state.resumeData.schemaVersion 
          : '1.0.0';
        
        if (snapshot.schemaVersion !== currentSchemaVersion) {
          console.warn(
            `Schema version mismatch! Snapshot version: ${snapshot.schemaVersion}, ` +
            `Current version: ${currentSchemaVersion}. Data migration may be needed.`
          );
        }
        
        return {
          resumeData: JSON.parse(JSON.stringify(snapshot.resumeData)) // Deep clone
        };
      }),

      deleteSnapshot: (snapshotId) => set((state) => ({
        versionSnapshots: state.versionSnapshots.filter(s => s.id !== snapshotId)
      })),

      updateSnapshotName: (snapshotId, newName) => set((state) => ({
        versionSnapshots: state.versionSnapshots.map(s =>
          s.id === snapshotId ? { ...s, name: newName } : s
        )
      })),

      // NEW: Export current schema for development/debugging
      exportCurrentSchema: () => {
        const { resumeData } = get();
        
        // Create a formatted snapshot with current timestamp
        const exportData = {
          exportedAt: new Date().toISOString(),
          schemaVersion: ('schemaVersion' in resumeData) ? resumeData.schemaVersion : '1.0.0',
          resumeData: JSON.parse(JSON.stringify(resumeData)) // Deep clone to avoid references
        };
        
        // Create and download the JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `resume-schema-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        console.log('Schema exported successfully:', exportData);
      },
    }),
    {
      name: 'resume-studio-storage',
      storage: createJSONStorage(() => indexedDbStorage),
      
      // This function determines which parts of the state are persisted.
      // We are excluding the API key from being saved to IndexedDB.
      partialize: (state) => {
        const { aiConfig, ...rest } = state;
        const { apiKey, ...restAiConfig } = aiConfig;
        return { ...rest, aiConfig: restAiConfig };
      },

      // This function merges the persisted state with the in-memory state.
      // It's crucial for keeping non-persisted values (like the API key) alive.
      merge: (persistedState, currentState) => {
        const state = { ...currentState, ...(persistedState as Partial<ResumeState>) };
        
        // Ensure the API key from the initial state is not overwritten
        // by the (intentionally) missing key from the persisted state.
        state.aiConfig.apiKey = currentState.aiConfig.apiKey;
        
        // Migrate legacy resume data if needed
        if (state.resumeData) {
          state.resumeData = migrateLegacyResumeIfNeeded(state.resumeData);
        }
        
        return state;
      },
    }
  )
); 