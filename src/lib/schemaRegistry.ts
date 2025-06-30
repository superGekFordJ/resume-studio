import { 
  SectionSchema, 
  FieldSchema, 
  ISchemaRegistry, 
  ContextBuilderFunction,
  ADVANCED_SKILLS_SCHEMA,
  PROJECTS_SCHEMA,
  AIContextPayload,
  StructuredAIContext,
  RoleMap
} from '@/types/schema';
import { registerDefaultSchemas } from './schemas/defaultSchemas';
import { registerDefaultContextBuilders } from './schemas/defaultContextBuilders';
import { staticRoleMaps } from './schemas/staticRoleMaps'; // Import the static maps
import type { ResumeData } from '@/types/resume';

// Schema注册中心实现
export class SchemaRegistry implements ISchemaRegistry {
  private static instance: SchemaRegistry;
  private sectionSchemas: Map<string, SectionSchema> = new Map();
  private contextBuilders: Map<string, ContextBuilderFunction> = new Map();
  private roleMaps: Record<string, RoleMap> = {}; // Use a simple record/object
  
  // Cache for otherSectionsContext to improve performance.
  // The key is a combination of resume data hash and the excluded section id.
  private otherSectionsContextCache: Map<string, string> = new Map();

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
  private generateResumeDataHash(resumeData: any, sectionIdToExclude: string): string {
    // Create a deep copy to avoid modifying the original data
    const dataToHash = JSON.parse(JSON.stringify(resumeData));

    // Exclude the section that is currently being edited from the hash
    dataToHash.sections = dataToHash.sections.filter((section: any) => section.id !== sectionIdToExclude);

    // A simple and fast hashing strategy using the filtered data.
    return JSON.stringify(dataToHash);
  }

  private generateOtherSectionsContextKey(resumeDataHash: string, currentSectionId: string): string {
    return `${resumeDataHash}_${currentSectionId}`;
  }

  private buildOtherSectionsContext(resumeData: any, currentSectionId: string): string {
    const otherSectionsContextParts: string[] = [];
    for (const otherSection of resumeData.sections) {
      if (otherSection.id === currentSectionId) continue;
      const otherSchemaId = otherSection.schemaId || otherSection.type;
      const otherSchema = this.getSectionSchema(otherSchemaId);
      if (otherSchema?.aiContext?.sectionSummaryBuilder) {
        const summary = this.buildContext(otherSchema.aiContext.sectionSummaryBuilder, otherSection, resumeData);
        otherSectionsContextParts.push(summary);
      }
    }
    return otherSectionsContextParts.join('\n\n');
  }

  public clearContextCache(): void {
    this.otherSectionsContextCache.clear();
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

  public registerContextBuilder(id: string, builder: ContextBuilderFunction): void {
    this.contextBuilders.set(id, builder);
  }

  public buildContext(builderId: string, data: any, allData: any): string {
    const builder = this.contextBuilders.get(builderId);
    return builder ? builder(data, allData) : '';
  }

  // 工具方法
  public getAvailableSectionTypes(): string[] {
    return Array.from(this.sectionSchemas.keys());
  }

  public isLegacySectionType(type: string): boolean {
    return ['summary', 'experience', 'education', 'skills', 'customText'].includes(type);
  }

  public getFieldSchema(sectionId: string, fieldId: string): FieldSchema | undefined {
    const sectionSchema = this.getSectionSchema(sectionId);
    return sectionSchema?.fields.find(field => field.id === fieldId);
  }

  // AI相关工具方法
  public getAIEnabledFields(sectionId: string): FieldSchema[] {
    const schema = this.getSectionSchema(sectionId);
    return schema?.fields.filter(field => field.aiHints?.autocompleteEnabled) || [];
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
  public buildAIContext(payload: AIContextPayload & { aiConfig?: any }): StructuredAIContext {
    const { resumeData, task, sectionId, itemId, fieldId, inputText, textAfterCursor, aiConfig } = payload;
    
    const section = resumeData.sections.find((s: any) => s.id === sectionId);
    if (!section) {
      return { currentItemContext: '', otherSectionsContext: '' };
    }
    
    const schemaId = section.schemaId || section.type;
    const sectionSchema = this.getSectionSchema(schemaId);
    const fieldSchema = sectionSchema?.fields.find(f => f.id === fieldId);
    
    let currentItemContext = '';
    const builderId = fieldSchema?.aiHints?.contextBuilders?.[task];

    if (builderId) {
      // 1. Get the original item data from the store's state
      const originalItemData = itemId 
        ? section.items?.find((i: any) => i.id === itemId) 
        : section.items?.[0];

      let itemContent = originalItemData?.data || originalItemData;

      // 2. If we have live input text, create a copy of the item data and update the
      //    field being currently edited. This gives the context builder the most
      //    up-to-date information for the active field, while preserving all other fields.
      if (itemContent && typeof inputText === 'string' && fieldId) {
        // Here, we combine the text before and after the cursor to represent the full, up-to-date field value
        const completeInput = inputText + (textAfterCursor || '');
        itemContent = {
          ...itemContent,
          [fieldId]: completeInput,
        };
      }
      
      // 3. Build the context using the (potentially updated) item content.
      currentItemContext = this.buildContext(builderId, itemContent, resumeData);
    }

    // 2. Build otherSectionsContext (使用缓存)
    const currentResumeDataHash = this.generateResumeDataHash(resumeData, sectionId);
    const cacheKey = this.generateOtherSectionsContextKey(currentResumeDataHash, sectionId);
    
    let otherSectionsContext = '';
    
    if (this.otherSectionsContextCache.has(cacheKey)) {
      otherSectionsContext = this.otherSectionsContextCache.get(cacheKey)!;
    } else {
      // 缓存未命中，重新构建
      otherSectionsContext = this.buildOtherSectionsContext(resumeData, sectionId);
      this.otherSectionsContextCache.set(cacheKey, otherSectionsContext);
    }

    const result = {
      currentItemContext,
      otherSectionsContext,
      userJobTitle: resumeData.personalDetails?.jobTitle,
      userJobInfo: aiConfig?.targetJobInfo,
      userBio: aiConfig?.userBio,
    };
    
    return result;
  }

  // NEW: AI Service Methods - Unified interface for all AI operations
  public async improveField(payload: {
    resumeData: any;
    sectionId: string;
    itemId: string;
    fieldId: string;
    currentValue: string;
    prompt: string;
    aiConfig?: any;
  }): Promise<string> {
    // 1. Build context using buildAIContext
    const context = this.buildAIContext({
      resumeData: payload.resumeData,
      task: 'improve',
      sectionId: payload.sectionId,
      fieldId: payload.fieldId,
      itemId: payload.itemId,
      aiConfig: payload.aiConfig
    });
    
    // 2. Get field schema for additional hints
    const section = payload.resumeData.sections.find((s: any) => s.id === payload.sectionId);
    const schemaId = section?.schemaId || section?.type;
    const schema = this.getSectionSchema(schemaId);
    const field = schema?.fields.find(f => f.id === payload.fieldId);
    
    // 3. Import and call the AI Flow
    const { improveResumeSection } = await import('@/ai/flows/improve-resume-section');
    
    const result = await improveResumeSection({
      resumeSection: payload.currentValue,
      prompt: payload.prompt,
      context: context,
      sectionType: schemaId
    });
    
    if (!result.improvedResumeSection) {
      throw new Error('Failed to get improvement from AI');
    }
    
    return result.improvedResumeSection;
  }

  public async getAutocomplete(payload: {
    resumeData: any;
    sectionId: string;
    itemId: string;
    fieldId: string;
    inputText: string;
    aiConfig?: any;
  }): Promise<string> {
    // 1. Build context using buildAIContext
    const context = this.buildAIContext({
      resumeData: payload.resumeData,
      task: 'autocomplete',
      sectionId: payload.sectionId,
      fieldId: payload.fieldId,
      itemId: payload.itemId,
      aiConfig: payload.aiConfig
    });
    
    // 2. Get field schema for additional hints
    const section = payload.resumeData.sections.find((s: any) => s.id === payload.sectionId);
    const schemaId = section?.schemaId || section?.type;
    const schema = this.getSectionSchema(schemaId);
    const field = schema?.fields.find(f => f.id === payload.fieldId);
    
    // 3. Import and call the AI Flow
    const { autocompleteInput } = await import('@/ai/flows/autocomplete-input');
    
    const result = await autocompleteInput({
      inputText: payload.inputText,
      context: context,
      sectionType: schemaId
    });
    
    return result.completion || '';
  }

  public async batchImproveSection(payload: {
    resumeData: any;
    sectionId: string;
    prompt: string;
    aiConfig?: any;
  }): Promise<any[]> {
    const section = payload.resumeData.sections.find((s: any) => s.id === payload.sectionId);
    if (!section) throw new Error('Section not found');
    
    const schemaId = section.schemaId || section.type;
    const schema = this.getSectionSchema(schemaId);
    
    if (!schema?.aiContext?.batchImprovementSupported) {
      throw new Error('Batch improvement not supported for this section type');
    }
    
    // Import and call the batch improvement flow
    const { batchImproveSection } = await import('@/ai/flows/batch-improve-section');
    
    // Convert section data to the format expected by the AI flow
    const sectionData: Record<string, any> = {};
    if (section.items && Array.isArray(section.items)) {
      section.items.forEach((item: any, index: number) => {
        const itemData = item.data || item;
        Object.keys(itemData).forEach(key => {
          if (key !== 'id') {
            sectionData[`item${index}_${key}`] = itemData[key];
          }
        });
      });
    }
    
    const result = await batchImproveSection({
      sectionData: sectionData,
      sectionType: schemaId,
      improvementGoals: [payload.prompt],
      userJobTitle: payload.resumeData.personalDetails?.jobTitle,
      userJobInfo: payload.aiConfig?.targetJobInfo,
      userBio: payload.aiConfig?.userBio,
      otherSectionsContext: this.stringifyResumeForReview(payload.resumeData)
    });
    
    // Convert the improved data back to items array
    const improvedItems: any[] = [];
    const itemCount = section.items?.length || 0;
    
    for (let i = 0; i < itemCount; i++) {
      const improvedItem: any = { id: section.items[i].id };
      Object.keys(result.improvedSectionData).forEach(key => {
        if (key.startsWith(`item${i}_`)) {
          const fieldName = key.replace(`item${i}_`, '');
          improvedItem[fieldName] = result.improvedSectionData[key];
        }
      });
      improvedItems.push(improvedItem);
    }
    
    return improvedItems;
  }

  public async reviewResume(resumeData: any): Promise<any> {
    const { reviewResume } = await import('@/ai/flows/review-resume');
    
    const resumeText = this.stringifyResumeForReview(resumeData);
    
    const result = await reviewResume({
      resumeText: resumeText
    });
    
    return result;
  }

  // NEW: Resume Stringify Service for Review
  public stringifyResumeForReview(resumeData: any): string {
    const sectionParts: string[] = [];

    // Prepend the target job info and user bio for critical context
    if (resumeData.aiConfig?.targetJobInfo) {
      sectionParts.push(`## Target Job Description\n${resumeData.aiConfig.targetJobInfo}`);
    }
    if (resumeData.aiConfig?.userBio) {
      sectionParts.push(`## User's Professional Bio\n${resumeData.aiConfig.userBio}`);
    }
    
    // Add personal details summary
    if (resumeData.personalDetails) {
      const personalInfo = [
        `Job Title: ${resumeData.personalDetails.jobTitle}`,
        `Location: ${resumeData.personalDetails.address}`
      ].filter(val => val.includes(': ') && val.split(': ')[1]).join(' | ');
      
      if (personalInfo) {
        sectionParts.push(`## Personal Information Summary\n${personalInfo}`);
      }
    }
    
    // Process all sections using their summary builders
    for (const section of resumeData.sections) {
      if (!section.visible) continue;
      
      const schemaId = section.schemaId || section.type;
      const sectionSchema = this.getSectionSchema(schemaId);
      
      if (sectionSchema?.aiContext?.sectionSummaryBuilder) {
        const summary = this.buildContext(sectionSchema.aiContext.sectionSummaryBuilder, section, resumeData);
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