import { StateCreator } from 'zustand';
import { ResumeState, ResumeActions } from '../types';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { AIDataBridge } from '@/lib/aiDataBridge';
import type { DynamicResumeSection } from '@/types/schema';
import { toast } from '@/hooks/use-toast';
import { mapErrorToToast } from '@/lib/utils';
import i18n from '@/i18n';

// Helper function to read file as Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert file to Base64.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export interface AIActions {
  startAIImprovement: (payload: {
    sectionId: string;
    itemId?: string;
    fieldId: string;
    currentValue: string;
    uniqueFieldId: string;
    isPersonalDetails?: boolean;
  }) => Promise<void>;
  acceptAIImprovement: () => void;
  rejectAIImprovement: () => void;
  startBatchImprovement: (sectionId: string, prompt: string) => Promise<void>;
  acceptBatchImprovement: (
    itemsToAccept: Array<{ id: string; data: Record<string, unknown> }>
  ) => void;
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
  batchImproveSection: (sectionId: string, prompt: string) => Promise<void>;
  extractJobInfoFromImage: (file: File) => Promise<void>;
  updateUserBioFromFile: (file: File) => Promise<void>;
  generateResumeSnapshotFromBio: () => Promise<void>;
  generateCoverLetter: () => Promise<string | null>;
}

export const createAIActions: StateCreator<
  ResumeState & ResumeActions,
  [],
  [],
  AIActions
> = (set, get) => ({
  startAIImprovement: async (payload) => {
    const schemaRegistry = SchemaRegistry.getInstance();
    const state = get();

    set({
      isImprovingFieldId: payload.uniqueFieldId,
      aiImprovement: null,
    });

    try {
      let improvedText: string;

      if (payload.isPersonalDetails) {
        // For personal details, use the legacy flow directly for now
        const { improveResumeSection } =
          await import('@/ai/flows/improve-resume-section');
        const context = {
          currentItemContext: `Personal Details Field: ${payload.fieldId}`,
          otherSectionsContext: schemaRegistry.stringifyResumeForReview(
            state.resumeData
          ),
          userJobTitle: state.resumeData.personalDetails?.jobTitle || '',
          userJobInfo: state.aiConfig.targetJobInfo,
          userBio: state.aiConfig.userBio,
        };

        const result = await improveResumeSection({
          resumeSection: payload.currentValue,
          prompt: state.aiPrompt,
          context: context,
          sectionType: 'personalDetailsField',
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
          aiConfig: state.aiConfig,
        });
      }

      if (improvedText) {
        set({
          aiImprovement: {
            uniqueFieldId: payload.uniqueFieldId,
            suggestion: improvedText,
            originalText: payload.currentValue,
          },
          isImprovingFieldId: null,
        });
      } else {
        set({
          aiImprovement: null,
          isImprovingFieldId: null,
        });
      }
    } catch (error) {
      console.error('AI improvement error:', error);
      toast(mapErrorToToast(error));
      set({
        aiImprovement: null,
        isImprovingFieldId: null,
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
        isPersonalDetails: true,
      });
    } else {
      const fieldName = parts.pop()!;
      parts.pop()!; // Remove sectionType (unused)
      const itemId = parts.join('_').replace(/-/g, '_');

      // Find the section ID from the editing target
      const sectionId = state.editingTarget || '';
      state.updateField({
        sectionId,
        itemId,
        fieldId: fieldName,
        value: state.aiImprovement.suggestion,
        isPersonalDetails: false,
      });
    }

    set({
      aiImprovement: null,
      aiPrompt: '',
    });
  },

  rejectAIImprovement: () =>
    set({
      aiImprovement: null,
      isImprovingFieldId: null,
    }),

  // NEW: Dialog-based improvement actions
  startBatchImprovement: async (sectionId: string, prompt: string) => {
    const state = get();
    const section = state.resumeData.sections.find(
      (s) => s.id === sectionId
    ) as DynamicResumeSection;
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
        originalItems: section.items.map((item) => ({ ...item })),
        improvedItems: [],
        improvementSummary: '',
        isLoading: true,
      },
    });

    try {
      const schemaRegistry = SchemaRegistry.getInstance();

      // Check if batch improvement is supported
      const sectionSchema = schemaRegistry.getSectionSchema(section.schemaId);
      if (!sectionSchema?.aiContext?.batchImprovementSupported) {
        console.error('Batch improvement not supported for this section type');
        set({ batchImprovementReview: null });
        return;
      }

      // Delegate the heavy lifting to SchemaRegistry (single source of truth)
      const { improvedItems, improvementSummary } =
        await schemaRegistry.batchImproveSection({
          resumeData: state.resumeData,
          sectionId,
          prompt,
          aiConfig: state.aiConfig,
        });

      if (improvedItems.length > 0) {
        set((currentState) => {
          if (!currentState.batchImprovementReview) return currentState;
          return {
            batchImprovementReview: {
              ...currentState.batchImprovementReview,
              improvedItems: improvedItems,
              improvementSummary: improvementSummary,
              isLoading: false,
            },
          };
        });
      } else {
        set({ batchImprovementReview: null });
      }
    } catch (error) {
      console.error('Batch improvement error:', error);
      toast(mapErrorToToast(error));
      set({ batchImprovementReview: null });
    }
  },

  acceptBatchImprovement: (
    itemsToAccept: Array<{ id: string; data: Record<string, unknown> }>
  ) => {
    const state = get();
    if (!state.batchImprovementReview) return;

    const { sectionId } = state.batchImprovementReview;

    set((currentState) => {
      const updatedResumeData = AIDataBridge.applyFieldLevelImprovements(
        currentState.resumeData,
        sectionId,
        itemsToAccept
      );

      return {
        resumeData: updatedResumeData,
        batchImprovementReview: null,
        aiPrompt: '',
      };
    });
  },

  rejectBatchImprovement: () =>
    set({
      batchImprovementReview: null,
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
        isLoading: true,
      },
    });

    try {
      const schemaRegistry = SchemaRegistry.getInstance();
      let improvedText: string;

      if (payload.isPersonalDetails) {
        // For personal details, use the legacy flow directly
        const { improveResumeSection } =
          await import('@/ai/flows/improve-resume-section');
        const context = {
          currentItemContext: `Personal Details Field: ${payload.fieldId}`,
          otherSectionsContext: schemaRegistry.stringifyResumeForReview(
            state.resumeData
          ),
          userJobTitle: state.resumeData.personalDetails?.jobTitle || '',
          userJobInfo: state.aiConfig.targetJobInfo,
          userBio: state.aiConfig.userBio,
        };

        const result = await improveResumeSection({
          resumeSection: payload.currentValue,
          prompt: payload.prompt,
          context: context,
          sectionType: 'personalDetailsField',
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
          aiConfig: state.aiConfig,
        });
      }

      if (improvedText) {
        set((currentState) => {
          if (!currentState.singleFieldImprovementReview) return currentState;
          return {
            singleFieldImprovementReview: {
              ...currentState.singleFieldImprovementReview,
              improvedText,
              isLoading: false,
            },
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

    const { sectionId, itemId, fieldId, improvedText, isPersonalDetails } =
      state.singleFieldImprovementReview;

    // Apply the improvement
    if (isPersonalDetails) {
      state.updateField({
        sectionId: '',
        fieldId,
        value: improvedText,
        isPersonalDetails: true,
      });
    } else {
      state.updateField({
        sectionId,
        itemId,
        fieldId,
        value: improvedText,
        isPersonalDetails: false,
      });
    }

    set({
      singleFieldImprovementReview: null,
      aiPrompt: '',
    });
  },

  rejectSingleFieldImprovement: () =>
    set({
      singleFieldImprovementReview: null,
    }),

  // DEPRECATED: Keep for backward compatibility - will be removed
  batchImproveSection: async (sectionId: string, prompt: string) => {
    const state = get();
    const { AIDataBridge } = await import('@/lib/aiDataBridge');
    const { SchemaRegistry } = await import('@/lib/schemaRegistry');
    const { batchImproveSection } =
      await import('@/ai/flows/batch-improve-section');

    const schemaRegistry = SchemaRegistry.getInstance();

    // Find the section
    const section = state.resumeData.sections.find(
      (s) => s.id === sectionId
    ) as DynamicResumeSection;
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
        otherSectionsContext: schemaRegistry.stringifyResumeForReview(
          state.resumeData
        ),
      });

      if (result && result.improvedSection) {
        // This is the deprecated path. We'll merge all items.
        const itemsToMerge = result.improvedSection.items.map(
          (itemData, index) => ({
            id: section.items[index].id,
            data: itemData,
          })
        );

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
      toast({
        title: 'Invalid File Type',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Set loading state to true at the start
    set({ isExtractingJobInfo: true });

    try {
      const dataUri = await fileToBase64(file);
      const { getJobInfoFromImage } =
        await import('@/ai/flows/getJobInfoFromImage');
      const extractedText = await getJobInfoFromImage({ dataUri });

      if (extractedText) {
        get().updateAIConfig({ targetJobInfo: extractedText });
        // Add success toast when extractedText is received
        toast({
          title: 'Success',
          description: 'Job information extracted successfully.',
        });
      } else {
        console.error('AI failed to extract text from the image.');
        toast({
          title: 'Extraction Failed',
          description:
            'AI could not extract text from the image. Please try a different image.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing image for job info extraction:', error);
      toast(mapErrorToToast(error));
    } finally {
      // Set loading state to false in both success and error cases
      set({ isExtractingJobInfo: false });
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
          text += content.items
            .map((item) => ('str' in item ? item.str : null))
            .filter(Boolean)
            .join(' ');
        }
      } else if (
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
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
      const { generateResumeFromContext } =
        await import('@/ai/flows/generateResumeFromContext');
      const { AIDataBridge } = await import('@/lib/aiDataBridge');
      const { SchemaRegistry } = await import('@/lib/schemaRegistry');

      const schemaRegistry = SchemaRegistry.getInstance();

      const aiResult = await generateResumeFromContext({
        bio: userBio,
        jobDescription: targetJobInfo,
      });

      if (aiResult) {
        const newResumeData = AIDataBridge.toExtendedResumeData(
          aiResult,
          schemaRegistry
        );

        // Translate section titles into the current language for the snapshot
        try {
          newResumeData.sections = newResumeData.sections.map((s) => {
            const originalTitle = s.title as string | undefined;
            const looksLikeSchemaKey =
              typeof originalTitle === 'string' && i18n.exists(originalTitle);

            return {
              ...s,
              title: looksLikeSchemaKey
                ? i18n.t(originalTitle)
                : originalTitle || '',
            } as DynamicResumeSection;
          });
        } catch (e) {
          // Non-fatal; if translation fails, fallback to whatever title we have
          // Keep a console warning to aid debugging

          console.warn('Failed to localize section titles for snapshot', e);
        }

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
  generateCoverLetter: async () => {
    const state = get();
    set({ isGeneratingCoverLetter: true });
    const { SchemaRegistry } = await import('@/lib/schemaRegistry');
    const { generateCoverLetter } =
      await import('@/ai/flows/generateCoverLetter');

    const schemaRegistry = SchemaRegistry.getInstance();

    try {
      // Create or find the cover letter section
      let coverLetterSection = state.resumeData.sections.find(
        (s) => s.schemaId === 'cover-letter'
      ) as DynamicResumeSection | undefined;

      if (!coverLetterSection) {
        // Create new cover letter section
        const newSectionId = `cover-letter_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        coverLetterSection = {
          id: newSectionId,
          schemaId: 'cover-letter',
          title: 'Cover Letter',
          visible: true,
          items: [
            {
              id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              schemaId: 'cover-letter',
              data: { content: '' },
              metadata: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                aiGenerated: false,
              },
            },
          ],
        };

        // Add section to resume data
        set((currentState) => ({
          resumeData: {
            ...currentState.resumeData,
            sections: [
              ...currentState.resumeData.sections,
              coverLetterSection!,
            ],
          },
        }));
      }

      // Prepare input for AI generation
      const resumeContext = schemaRegistry.stringifyResumeForReview(
        state.resumeData
      );
      const targetJobInfo = state.aiConfig.targetJobInfo || 'General position';

      const input = {
        resumeContext,
        targetJobInfo,
        context: {
          userJobTitle: state.resumeData.personalDetails?.jobTitle,
          userBio: state.aiConfig.userBio,
        },
      };

      // Generate cover letter content
      const result = await generateCoverLetter(input);

      if (result && result.coverLetterContent) {
        // Update the cover letter section with generated content
        set((currentState) => {
          const updatedSections = currentState.resumeData.sections.map(
            (section) => {
              if (section.schemaId === 'cover-letter') {
                const dynamicSection = section as DynamicResumeSection;
                return {
                  ...dynamicSection,
                  items: dynamicSection.items.map((item, index) =>
                    index === 0
                      ? {
                          ...item,
                          data: {
                            ...item.data,
                            content: result.coverLetterContent,
                          },
                          metadata: {
                            ...item.metadata,
                            createdAt:
                              item.metadata?.createdAt ||
                              new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            aiGenerated: true,
                          },
                        }
                      : item
                  ),
                };
              }
              return section;
            }
          );

          return {
            resumeData: {
              ...currentState.resumeData,
              sections: updatedSections,
            },
          };
        });

        return result.generationSummary;
      }

      return null;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      return null;
    } finally {
      set({ isGeneratingCoverLetter: false });
    }
  },
});
