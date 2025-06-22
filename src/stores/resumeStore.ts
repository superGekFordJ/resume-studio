import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ResumeData, PersonalDetails, SectionItem, ExperienceEntry, EducationEntry, SkillEntry, CustomTextEntry, ResumeSection } from '@/types/resume';
import { initialResumeData } from '@/types/resume';
import type { ReviewResumeOutput } from '@/ai/flows/review-resume';
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';
import { SchemaRegistry } from '@/lib/schemaRegistry';

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
  aiImprovement: {
    uniqueFieldId: string;
    suggestion: string;
    originalText: string;
  } | null;
  isImprovingFieldId: string | null;
  aiPrompt: string;
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
}

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
      aiPrompt: '',

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
                
                if ('schemaId' in section) {
                  // Handle dynamic section
                  const dynamicSection = section as DynamicResumeSection;
                  return {
                    ...dynamicSection,
                    items: dynamicSection.items.map(item =>
                      item.id === payload.itemId
                        ? { ...item, data: { ...item.data, [payload.fieldId]: payload.value } }
                        : item
                    )
                  };
                } else {
                  // Handle legacy section
                  const legacySection = section as ResumeSection;
                  return {
                    ...legacySection,
                    items: legacySection.items.map(item =>
                      item.id === payload.itemId
                        ? { ...item, [payload.fieldId]: payload.value }
                        : item
                    ) as SectionItem[]
                  };
                }
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
          
          if ('schemaId' in section) {
            // Handle dynamic section
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
          } else {
            // Handle legacy section
            const legacySection = section as ResumeSection;
            const newItemId = `${legacySection.type}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            let newItem: SectionItem;
            
            switch (legacySection.type) {
              case 'experience':
                newItem = { id: newItemId, jobTitle: '', company: '', startDate: '', endDate: '', description: '' } as ExperienceEntry;
                break;
              case 'education':
                newItem = { id: newItemId, degree: '', institution: '', graduationYear: '', details: '' } as EducationEntry;
                break;
              case 'skills':
                newItem = { id: newItemId, name: '' } as SkillEntry;
                break;
              case 'summary': 
              case 'customText':
                if (legacySection.isList || legacySection.items.length === 0) {
                  newItem = { id: newItemId, content: '' } as CustomTextEntry;
                } else {
                  return section; // Don't add if not a list and already has content
                }
                break;
              default:
                return section;
            }
            
            return {
              ...legacySection,
              items: [...legacySection.items, newItem]
            };
          }
        });
        
        return { resumeData: { ...state.resumeData, sections: updatedSections } };
      }),
      
      removeSectionItem: (payload) => set((state) => ({
        resumeData: {
          ...state.resumeData,
          sections: state.resumeData.sections.map(section => {
            if (section.id !== payload.sectionId) return section;
            
            if ('items' in section) {
              return {
                ...section,
                items: section.items.filter((item: any) => item.id !== payload.itemId)
              };
            }
            
            return section;
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
              userJobTitle: state.resumeData.personalDetails?.jobTitle || ''
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
              prompt: state.aiPrompt
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