import type { ResumeData, DynamicSectionItem } from '@/types/resume';
import type { ReviewResumeOutput } from '@/ai/flows/review-resume';

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
  originalItems: DynamicSectionItem[];
  improvedItems: DynamicSectionItem['data'][];
  improvementSummary: string;
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
  isGeneratingCoverLetter?: boolean; // NEW: For cover letter generation
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
  setAIPrompt: (prompt: string) => void;
  // DEPRECATED: Keep for backward compatibility
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
  // NEW: Dialog-based improvement actions
  startBatchImprovement: (sectionId: string, prompt: string) => Promise<void>;
  acceptBatchImprovement: (
    itemsToAccept: Array<{ id: string; data: DynamicSectionItem['data'] }>
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
  // NEW: Cover letter generation
  generateCoverLetter: () => Promise<string | null>;
}
