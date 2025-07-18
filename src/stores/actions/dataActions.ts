import { StateCreator } from 'zustand';
import { ResumeState, ResumeActions } from '../types';
import { SchemaRegistry } from '@/lib/schemaRegistry';
import { PersonalDetails } from '@/types/resume';
import { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';

export interface DataActions {
  updateField: (payload: {
    sectionId: string;
    itemId?: string;
    fieldId: string;
    value: unknown;
    isPersonalDetails?: boolean;
  }) => void;
  updateSectionTitle: (payload: {
    sectionId: string;
    newTitle: string;
  }) => void;
  addSectionItem: (sectionId: string) => void;
  removeSectionItem: (payload: { sectionId: string; itemId: string }) => void;
  reorderSectionItems: (payload: {
    sectionId: string;
    fromIndex: number;
    toIndex: number;
  }) => void;
  reorderSections: (payload: { fromIndex: number; toIndex: number }) => void;
}

export const createDataActions: StateCreator<
  ResumeState & ResumeActions,
  [],
  [],
  DataActions
> = (set) => ({
  updateField: (payload) =>
    set((state) => {
      if (payload.isPersonalDetails) {
        // Update personal details field
        return {
          resumeData: {
            ...state.resumeData,
            personalDetails: {
              ...state.resumeData.personalDetails,
              [payload.fieldId]: payload.value,
            } as PersonalDetails,
          },
        };
      } else {
        // Update section field
        return {
          resumeData: {
            ...state.resumeData,
            sections: state.resumeData.sections.map((section) => {
              if (section.id !== payload.sectionId) return section;

              // All sections are now dynamic
              const dynamicSection = section as DynamicResumeSection;
              return {
                ...dynamicSection,
                items: dynamicSection.items.map((item) =>
                  item.id === payload.itemId
                    ? {
                        ...item,
                        data: {
                          ...item.data,
                          [payload.fieldId]: payload.value,
                        },
                      }
                    : item
                ),
              };
            }),
          },
        };
      }
    }),
  updateSectionTitle: (payload) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.map((section) =>
          section.id === payload.sectionId
            ? { ...section, title: payload.newTitle }
            : section
        ),
      },
    })),
  addSectionItem: (sectionId) =>
    set((state) => {
      const schemaRegistry = SchemaRegistry.getInstance();
      const updatedSections = state.resumeData.sections.map((section) => {
        if (section.id !== sectionId) return section;

        const dynamicSection = section as DynamicResumeSection;
        const sectionSchema = schemaRegistry.getSectionSchema(
          dynamicSection.schemaId
        );
        if (!sectionSchema) return section;

        if (
          sectionSchema.type === 'single' &&
          dynamicSection.items.length > 0
        ) {
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
            aiGenerated: false,
          },
        };

        return {
          ...dynamicSection,
          items: [...dynamicSection.items, newItem],
        };
      });

      return { resumeData: { ...state.resumeData, sections: updatedSections } };
    }),
  removeSectionItem: (payload) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        sections: state.resumeData.sections.map((section) => {
          if (section.id !== payload.sectionId) return section;

          return {
            ...section,
            items: section.items.filter(
              (item: DynamicSectionItem) => item.id !== payload.itemId
            ),
          };
        }),
      },
    })),
  reorderSectionItems: (payload) =>
    set((state) => {
      const { sectionId, fromIndex, toIndex } = payload;
      const sections = state.resumeData.sections.map((section) => {
        if (section.id === sectionId) {
          const newItems = Array.from((section as DynamicResumeSection).items);
          const [movedItem] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, movedItem);
          return { ...section, items: newItems };
        }
        return section;
      });

      return {
        resumeData: {
          ...state.resumeData,
          sections,
        },
      };
    }),
  reorderSections: (payload) =>
    set((state) => {
      const { fromIndex, toIndex } = payload;
      const newSections = Array.from(state.resumeData.sections);
      const [movedItem] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedItem);

      return {
        resumeData: {
          ...state.resumeData,
          sections: newSections,
        },
      };
    }),
});
