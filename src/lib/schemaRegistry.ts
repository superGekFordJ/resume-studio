import {
  SectionSchema,
  FieldSchema,
  ISchemaRegistry,
  ContextBuilderFunction,
  AIContextPayload,
  StructuredAIContext,
  RoleMap,
  DynamicResumeSection,
  type ContextBuilderInput,
} from '@/types/schema';
import { type ResumeData } from '@/types/resume';
import { AIDataBridge } from '@/lib/aiDataBridge';
import { registerDefaultSchemas } from './schemas/defaultSchemas';
import { registerDefaultContextBuilders } from './schemas/defaultContextBuilders';
import { staticRoleMaps } from './schemas/staticRoleMaps'; // Import the static maps
import { AIConfig } from '@/stores/types';
import { LRUCache, stableHash } from '@/lib/utils';

// Schema注册中心实现
export class SchemaRegistry implements ISchemaRegistry {
  private static instance: SchemaRegistry;
  private sectionSchemas: Map<string, SectionSchema> = new Map();
  private contextBuilders: Map<string, ContextBuilderFunction> = new Map();
  private roleMaps: Record<string, RoleMap> = {}; // Use a simple record/object

  // Cache for otherSectionsContext to improve performance.
  // The key is a combination of resume data hash and the excluded section id.
  private otherSectionsContextCache: Map<string, string> = new Map();

  // Builder-level LRU cache for repeated context building calls
  private builderCache: LRUCache<string, string> = new LRUCache(200);

  // Placeholder token for currently editing fields
  public static readonly CURRENTLY_EDITING_TOKEN = '[[CURRENTLY_EDITING]]';

  private constructor() {
    this.initializeDefaultSchemas();
    this.initializeContextBuilders();
    this.initializeStaticRoleMaps(); // Load static maps on init
  }

  public static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }

  private initializeStaticRoleMaps(): void {
    this.roleMaps = staticRoleMaps;
  }

  // Hashing function to detect changes in resumeData
  private generateResumeDataHash(
    resumeData: ResumeData,
    sectionIdToExclude: string
  ): string {
    // Create a deep copy to avoid modifying the original data
    const dataToHash = JSON.parse(JSON.stringify(resumeData));

    // Exclude the section that is currently being edited from the hash
    dataToHash.sections = dataToHash.sections.filter(
      (section: DynamicResumeSection) => section.id !== sectionIdToExclude
    );

    // A simple and fast hashing strategy using the filtered data.
    return JSON.stringify(dataToHash);
  }

  private generateOtherSectionsContextKey(
    resumeDataHash: string,
    currentSectionId: string
  ): string {
    return `${resumeDataHash}_${currentSectionId}`;
  }

  private buildOtherSectionsContext(
    resumeData: ResumeData,
    currentSectionId: string
  ): string {
    const otherSectionsContextParts: string[] = [];
    for (const otherSection of resumeData.sections) {
      if (otherSection.id === currentSectionId) continue;
      const otherSchemaId = otherSection.schemaId;
      const otherSchema = this.getSectionSchema(otherSchemaId);
      if (otherSchema?.aiContext?.sectionSummaryBuilder) {
        const summary = this.buildContext(
          otherSchema.aiContext.sectionSummaryBuilder,
          otherSection,
          resumeData
        );
        otherSectionsContextParts.push(summary);
      }
    }
    return otherSectionsContextParts.join('\n\n');
  }

  public clearContextCache(): void {
    this.otherSectionsContextCache.clear();
    this.builderCache.clear();
    if (process.env.NEXT_PUBLIC_DEBUG_CACHE === 'true') {
      console.log('[Cache] All AI context caches cleared.');
    }
  }

  // 初始化默认Schema
  private initializeDefaultSchemas() {
    registerDefaultSchemas(this);
  }

  // 初始化上下文构建器
  private initializeContextBuilders() {
    registerDefaultContextBuilders(this);
  }

  // 公共方法
  public registerSectionSchema(schema: SectionSchema): void {
    this.sectionSchemas.set(schema.id, schema);
  }

  public getSectionSchema(id: string): SectionSchema | undefined {
    return this.sectionSchemas.get(id);
  }

  public getAllSectionSchemas(): SectionSchema[] {
    return Array.from(this.sectionSchemas.values());
  }

  public registerContextBuilder(
    id: string,
    builder: ContextBuilderFunction
  ): void {
    this.contextBuilders.set(id, builder);
  }

  public buildContext(
    builderId: string,
    data: ContextBuilderInput,
    allData: ResumeData
  ): string {
    const cacheKey = `${builderId}:${stableHash(data)}`;
    const cachedResult = this.builderCache.get(cacheKey);

    if (cachedResult !== undefined) {
      if (process.env.NEXT_PUBLIC_DEBUG_CACHE === 'true') {
        console.log(`%c[Cache Hit] Builder: ${builderId}`, 'color: #2e9940');
      }
      return cachedResult;
    }

    if (process.env.NEXT_PUBLIC_DEBUG_CACHE === 'true') {
      console.log(`%c[Cache Miss] Builder: ${builderId}`, 'color: #c72929');
    }
    const builder = this.contextBuilders.get(builderId);
    const result = builder ? builder(data, allData) : '';
    this.builderCache.set(cacheKey, result);
    return result;
  }

  // 工具方法
  public getAvailableSectionTypes(): string[] {
    return Array.from(this.sectionSchemas.keys());
  }

  public getFieldSchema(
    sectionId: string,
    fieldId: string
  ): FieldSchema | undefined {
    const sectionSchema = this.getSectionSchema(sectionId);
    return sectionSchema?.fields.find((field) => field.id === fieldId);
  }

  // AI相关工具方法
  public getAIEnabledFields(sectionId: string): FieldSchema[] {
    const schema = this.getSectionSchema(sectionId);
    return (
      schema?.fields.filter((field) => field.aiHints?.autocompleteEnabled) || []
    );
  }

  public getImprovementPrompts(sectionId: string, fieldId: string): string[] {
    const field = this.getFieldSchema(sectionId, fieldId);
    return field?.aiHints?.improvementPrompts || [];
  }

  public supportsBatchImprovement(sectionId: string): boolean {
    const schema = this.getSectionSchema(sectionId);
    return schema?.aiContext?.batchImprovementSupported || false;
  }

  // NEW: Main AI Context Service - The heart of the centralized logic
  public buildAIContext(
    payload: AIContextPayload & { aiConfig?: AIConfig }
  ): StructuredAIContext {
    const {
      resumeData,
      task,
      sectionId,
      itemId,
      fieldId,
      inputText,
      aiConfig,
    } = payload;

    const section = resumeData.sections.find((s) => s.id === sectionId);
    if (!section) {
      return { currentItemContext: '', otherSectionsContext: '' };
    }

    const schemaId = section.schemaId;
    const sectionSchema = this.getSectionSchema(schemaId);
    const fieldSchema = sectionSchema?.fields.find((f) => f.id === fieldId);

    let currentItemContext = '';
    const builderId = fieldSchema?.aiHints?.contextBuilders?.[task];

    if (builderId) {
      // 1. Get the original item data from the store's state
      const originalItemData = itemId
        ? section.items?.find((i) => i.id === itemId)
        : section.items?.[0];

      let itemContent: unknown = originalItemData?.data || originalItemData;

      // 2. If we have live input text, create a copy of the item data and inject the
      //    placeholder token for the field being edited. This avoids passing partial/raw
      //    input to builders and signals which field is active.
      if (itemContent && typeof inputText === 'string' && fieldId) {
        itemContent = {
          ...itemContent,
          [fieldId]: SchemaRegistry.CURRENTLY_EDITING_TOKEN,
        };
      }

      // 3. Build the context using the (potentially updated) item content.
      currentItemContext = this.buildContext(
        builderId,
        itemContent as ContextBuilderInput,
        resumeData
      );
    }

    // 4. Build otherSectionsContext (using Layer 1 cache)
    // The key is based on a hash of all resume data *except* the section currently being edited.
    // This ensures the cache hits when typing within a single section.
    const relevantDataForOtherSections = {
      ...resumeData,
      sections: resumeData.sections.filter((s) => s.id !== sectionId),
    };
    const otherSectionsCacheKey = `other-sections:${stableHash(
      relevantDataForOtherSections
    )}`;

    let otherSectionsContext = this.otherSectionsContextCache.get(
      otherSectionsCacheKey
    );

    if (otherSectionsContext !== undefined) {
      if (process.env.NEXT_PUBLIC_DEBUG_CACHE === 'true') {
        console.log('%c[Cache Hit] Other sections context', 'color: #2e9940');
      }
    } else {
      if (process.env.NEXT_PUBLIC_DEBUG_CACHE === 'true') {
        console.log('%c[Cache Miss] Other sections context', 'color: #c72929');
      }
      // 缓存未命中，重新构建
      otherSectionsContext = this.buildOtherSectionsContext(
        resumeData,
        sectionId
      );
      this.otherSectionsContextCache.set(
        otherSectionsCacheKey,
        otherSectionsContext
      );
    }

    const result = {
      currentItemContext,
      otherSectionsContext,
      userJobTitle: resumeData.personalDetails?.jobTitle,
      userJobInfo: aiConfig?.targetJobInfo as string | undefined,
      userBio: aiConfig?.userBio as string | undefined,
    };

    return result;
  }

  // NEW: AI Service Methods - Unified interface for all AI operations
  public async improveField(payload: {
    resumeData: ResumeData;
    sectionId: string;
    itemId: string;
    fieldId: string;
    currentValue: string;
    prompt: string;
    aiConfig?: AIConfig;
  }): Promise<string> {
    // 1. Build context using buildAIContext
    const context = this.buildAIContext({
      resumeData: payload.resumeData,
      task: 'improve',
      sectionId: payload.sectionId,
      fieldId: payload.fieldId,
      itemId: payload.itemId,
      aiConfig: payload.aiConfig,
      inputText: payload.currentValue,
    });

    // 2. Get field schema for additional hints
    const section = payload.resumeData.sections.find(
      (s) => s.id === payload.sectionId
    );
    const schemaId = section?.schemaId || '';

    // 3. Import and call the AI Flow
    const { improveResumeSection } = await import(
      '@/ai/flows/improve-resume-section'
    );

    const result = await improveResumeSection({
      resumeSection: payload.currentValue,
      prompt: payload.prompt,
      context: context,
      sectionType: schemaId,
    });

    if (!result.improvedResumeSection) {
      throw new Error('Failed to get improvement from AI');
    }

    return result.improvedResumeSection;
  }

  public async batchImproveSection(payload: {
    resumeData: ResumeData;
    sectionId: string;
    prompt: string;
    aiConfig?: AIConfig;
  }): Promise<{
    improvedItems: Record<string, unknown>[];
    improvementSummary: string;
  }> {
    const section = payload.resumeData.sections.find(
      (s: DynamicResumeSection) => s.id === payload.sectionId
    );
    if (!section) throw new Error('Section not found');

    const schemaId = section.schemaId;
    const schema = this.getSectionSchema(schemaId);

    if (!schema?.aiContext?.batchImprovementSupported) {
      throw new Error('Batch improvement not supported for this section type');
    }

    // Import the new batch improvement flow and AIDataBridge
    const { batchImproveSection } = await import(
      '@/ai/flows/batch-improve-section'
    );

    // Convert section to AI-friendly format
    const aiSection = AIDataBridge.fromSection(section, this);

    const result = await batchImproveSection({
      section: aiSection,
      improvementGoals: [payload.prompt],
      userJobTitle: payload.resumeData.personalDetails?.jobTitle,
      userJobInfo: payload.aiConfig?.targetJobInfo,
      userBio: payload.aiConfig?.userBio,
      otherSectionsContext: this.stringifyResumeForReview(payload.resumeData),
    });

    if (result && result.improvedSection) {
      return {
        improvedItems: (result.improvedSection.items ?? []) as Record<
          string,
          unknown
        >[],
        improvementSummary: result.improvementSummary ?? '',
      };
    }

    return {
      improvedItems: [] as Record<string, unknown>[],
      improvementSummary: '',
    };
  }

  public async reviewResume(resumeData: ResumeData): Promise<unknown> {
    const { reviewResume } = await import('@/ai/flows/review-resume');

    const resumeText = this.stringifyResumeForReview(resumeData);

    const result = await reviewResume({
      resumeText: resumeText,
    });

    return result;
  }

  // NEW: Resume Stringify Service for Review
  public stringifyResumeForReview(resumeData: ResumeData): string {
    const sectionParts: string[] = [];

    const aiConfig = (
      resumeData.metadata as {
        aiConfig?: Record<string, unknown>;
      }
    )?.aiConfig;

    // Prepend the target job info and user bio for critical context
    if (aiConfig?.targetJobInfo && typeof aiConfig.targetJobInfo === 'string') {
      sectionParts.push(`## Target Job Description\n${aiConfig.targetJobInfo}`);
    }
    if (aiConfig?.userBio && typeof aiConfig.userBio === 'string') {
      sectionParts.push(`## User's Professional Bio\n${aiConfig.userBio}`);
    }

    // Add personal details summary
    if (resumeData.personalDetails) {
      const personalInfo = [
        `Job Title: ${resumeData.personalDetails.jobTitle}`,
        `Location: ${resumeData.personalDetails.address}`,
      ]
        .filter((val) => val.includes(': ') && val.split(': ')[1])
        .join(' | ');

      if (personalInfo) {
        sectionParts.push(`## Personal Information Summary\n${personalInfo}`);
      }
    }

    // Process all sections using their summary builders
    for (const section of resumeData.sections) {
      if (!section.visible) continue;

      const schemaId = section.schemaId;
      const sectionSchema = this.getSectionSchema(schemaId);

      if (sectionSchema?.aiContext?.sectionSummaryBuilder) {
        const summary = this.buildContext(
          sectionSchema.aiContext.sectionSummaryBuilder,
          section,
          resumeData
        );
        if (summary.trim()) {
          sectionParts.push(summary);
        }
      }
    }

    return sectionParts.join('\n\n---\n\n');
  }

  /**
   * Synchronously gets a pre-defined RoleMap for a given schema ID.
   */
  public getRoleMap(schemaId: string): RoleMap | undefined {
    return this.roleMaps[schemaId];
  }
}

// 导出单例实例
export const schemaRegistry = SchemaRegistry.getInstance();
