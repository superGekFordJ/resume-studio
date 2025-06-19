import { 
  SectionSchema, 
  FieldSchema, 
  ISchemaRegistry, 
  ContextBuilderFunction,
  ADVANCED_SKILLS_SCHEMA,
  PROJECTS_SCHEMA,
  AIContextPayload,
  StructuredAIContext
} from '@/types/schema';
import type { ResumeData, SectionType } from '@/types/resume';

// Schema注册中心实现
export class SchemaRegistry implements ISchemaRegistry {
  private static instance: SchemaRegistry;
  private sectionSchemas: Map<string, SectionSchema> = new Map();
  private contextBuilders: Map<string, ContextBuilderFunction> = new Map();

  private constructor() {
    this.initializeDefaultSchemas();
    this.initializeContextBuilders();
  }

  public static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }

  // 初始化默认Schema
  private initializeDefaultSchemas() {
    // 注册现有的基础Schema（向后兼容）
    this.registerSectionSchema(this.createLegacySummarySchema());
    this.registerSectionSchema(this.createLegacyExperienceSchema());
    this.registerSectionSchema(this.createLegacyEducationSchema());
    this.registerSectionSchema(this.createLegacySkillsSchema());
    this.registerSectionSchema(this.createLegacyCustomTextSchema());
    
    // 注册新的高级Schema
    this.registerSectionSchema(ADVANCED_SKILLS_SCHEMA);
    this.registerSectionSchema(PROJECTS_SCHEMA);
  }

  // 初始化上下文构建器
  private initializeContextBuilders() {
    // 基础上下文构建器 - Updated for new system
    
    // Summary builders
    this.registerContextBuilder('summary-content', (data, allData) => {
      return data.content || data || '';
    });
    
    this.registerContextBuilder('summary-section', (section, allData) => {
      const content = section.items?.[0]?.data?.content || section.items?.[0]?.content || '';
      return `## Summary\n${content}`;
    });

    // Experience builders
    this.registerContextBuilder('job-title', (data, allData) => {
      return `Job Title: ${data.jobTitle || 'Untitled Job'}`;
    });

    this.registerContextBuilder('company-name', (data, allData) => {
      return `Company: ${data.company || 'Unnamed Company'}`;
    });

    this.registerContextBuilder('job-description', (data, allData) => {
      return `Job: ${data.jobTitle || 'Untitled Job'} at ${data.company || 'Unnamed Company'}\nDescription: ${data.description || ''}`;
    });

    this.registerContextBuilder('experience-item', (data, allData) => {
      return `- ${data.jobTitle || 'Untitled Job'} at ${data.company || 'Unnamed Company'}: ${data.description?.substring(0, 70)}...`;
    });

    this.registerContextBuilder('experience-summary', (section, allData) => {
      const itemsSummary = section.items?.map((item: any) => this.buildContext('experience-item', item.data || item, allData)).join('\n') || '';
      return `## Experience\n${itemsSummary}`;
    });

    // Education builders
    this.registerContextBuilder('degree-name', (data, allData) => {
      return `Degree: ${data.degree || 'Untitled Degree'}`;
    });

    this.registerContextBuilder('institution-name', (data, allData) => {
      return `Institution: ${data.institution || 'Unnamed Institution'}`;
    });

    this.registerContextBuilder('education-details', (data, allData) => {
      return `Education: ${data.degree || 'Untitled Degree'} from ${data.institution || 'Unnamed Institution'}\nDetails: ${data.details || ''}`;
    });

    this.registerContextBuilder('education-item', (data, allData) => {
      return `- ${data.degree || 'Untitled Degree'} from ${data.institution || 'Unnamed Institution'}`;
    });

    this.registerContextBuilder('education-summary', (section, allData) => {
      const itemsSummary = section.items?.map((item: any) => this.buildContext('education-item', item.data || item, allData)).join('\n') || '';
      return `## Education\n${itemsSummary}`;
    });

    // Skills builders
    this.registerContextBuilder('skill-name', (data, allData) => {
      return `Skill: ${data.name || 'Unnamed Skill'}`;
    });

    this.registerContextBuilder('skill-item', (data, allData) => {
      return `${data.name || 'Unnamed Skill'}`;
    });

    this.registerContextBuilder('skills-summary', (section, allData) => {
      const skills = section.items?.map((item: any) => item.data?.name || item.name || 'Unnamed Skill').join(', ') || '';
      return `## Skills\n${skills}`;
    });

    // Custom content builders
    this.registerContextBuilder('custom-content', (data, allData) => {
      return data.content || data || '';
    });

    this.registerContextBuilder('custom-summary', (section, allData) => {
      const content = section.items?.[0]?.data?.content || section.items?.[0]?.content || '';
      return `## ${section.title || 'Custom Section'}\n${content}`;
    });

    // 高级技能上下文构建器
    this.registerContextBuilder('skill-category', (data, allData) => {
      const skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
      return `Skill Category: ${data.category}, Skills: ${skills}`;
    });

    this.registerContextBuilder('skill-list', (data, allData) => {
      return Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
    });

    this.registerContextBuilder('skill-proficiency', (data, allData) => {
      return `Proficiency: ${data.proficiency || 'Not specified'}`;
    });

    this.registerContextBuilder('skill-experience', (data, allData) => {
      return `Years of Experience: ${data.yearsOfExperience || 'Not specified'}`;
    });

    this.registerContextBuilder('advanced-skills-summary', (section, allData) => {
      const categories = section.items?.map((item: any) => 
        `${item.data?.category || item.category}: ${Array.isArray(item.data?.skills || item.skills) ? (item.data?.skills || item.skills).join(', ') : (item.data?.skills || item.skills) || ''}`
      ).join('; ') || '';
      return `## Advanced Skills\n${categories}`;
    });

    this.registerContextBuilder('advanced-skills-item', (data, allData) => {
      const skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
      const proficiency = data.proficiency ? ` (${data.proficiency})` : '';
      return `${data.category}: ${skills}${proficiency}`;
    });

    // 项目上下文构建器
    this.registerContextBuilder('project-name', (data, allData) => {
      return `Project: ${data.name || 'Untitled Project'}`;
    });

    this.registerContextBuilder('project-description', (data, allData) => {
      const tech = Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
      return `Project: ${data.name}, Technologies: ${tech}\nDescription: ${data.description || ''}`;
    });

    this.registerContextBuilder('project-technologies', (data, allData) => {
      return Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
    });

    this.registerContextBuilder('projects-summary', (section, allData) => {
      const projects = section.items?.map((item: any) => {
        const itemData = item.data || item;
        return `${itemData.name}: ${itemData.description?.substring(0, 50)}...`;
      }).join('; ') || '';
      return `## Projects\n${projects}`;
    });

    this.registerContextBuilder('projects-item', (data, allData) => {
      const tech = Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
      return `Project: ${data.name}, Tech: ${tech}`;
    });
  }

  // 创建向后兼容的Schema
  private createLegacySummarySchema(): SectionSchema {
    return {
      id: 'summary',
      name: 'Summary',
      type: 'single',
      fields: [
        {
          id: 'content',
          type: 'textarea',
          label: 'Summary',
          required: true,
          uiProps: {
            rows: 4,
            placeholder: 'A brief summary about your professional background...'
          },
          aiHints: {
            contextBuilders: {
              improve: 'summary-content',
              autocomplete: 'summary-content'
            },
            improvementPrompts: [
              'Make it more concise',
              'Add quantifiable achievements',
              'Highlight key skills',
              'Tailor to target role'
            ],
            autocompleteEnabled: true,
            priority: 'high'
          }
        }
      ],
      aiContext: {
        sectionSummaryBuilder: 'summary-section',
        itemSummaryBuilder: 'summary-content'
      },
      uiConfig: {
        icon: 'FileText',
        addButtonText: 'Add Summary'
      }
    };
  }

  private createLegacyExperienceSchema(): SectionSchema {
    return {
      id: 'experience',
      name: 'Experience',
      type: 'list',
      fields: [
        {
          id: 'jobTitle',
          type: 'text',
          label: 'Job Title',
          required: true,
          aiHints: {
            contextBuilders: {
              improve: 'job-title',
              autocomplete: 'job-title'
            },
            autocompleteEnabled: true,
            priority: 'high'
          }
        },
        {
          id: 'company',
          type: 'text',
          label: 'Company',
          required: true,
          aiHints: {
            contextBuilders: {
              improve: 'company-name',
              autocomplete: 'company-name'
            },
            autocompleteEnabled: true,
            priority: 'high'
          }
        },
        {
          id: 'startDate',
          type: 'text',
          label: 'Start Date',
          required: true
        },
        {
          id: 'endDate',
          type: 'text',
          label: 'End Date',
          required: true
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
          uiProps: {
            rows: 4,
            placeholder: 'Describe your responsibilities and achievements...'
          },
          aiHints: {
            contextBuilders: {
              improve: 'job-description',
              autocomplete: 'job-description'
            },
            improvementPrompts: [
              'Add quantifiable results',
              'Use action verbs',
              'Highlight achievements',
              'Include relevant keywords'
            ],
            autocompleteEnabled: true,
            priority: 'high'
          }
        }
      ],
      aiContext: {
        sectionSummaryBuilder: 'experience-summary',
        itemSummaryBuilder: 'experience-item',
        batchImprovementSupported: true
      },
      uiConfig: {
        icon: 'Briefcase',
        addButtonText: 'Add Experience',
        itemDisplayTemplate: '{jobTitle} at {company}',
        sortable: true
      }
    };
  }

  private createLegacyEducationSchema(): SectionSchema {
    return {
      id: 'education',
      name: 'Education',
      type: 'list',
      fields: [
        {
          id: 'degree',
          type: 'text',
          label: 'Degree',
          required: true,
          aiHints: {
            contextBuilders: {
              improve: 'degree-name',
              autocomplete: 'degree-name'
            },
            autocompleteEnabled: true,
            priority: 'high'
          }
        },
        {
          id: 'institution',
          type: 'text',
          label: 'Institution',
          required: true,
          aiHints: {
            contextBuilders: {
              improve: 'institution-name',
              autocomplete: 'institution-name'
            },
            autocompleteEnabled: true,
            priority: 'high'
          }
        },
        {
          id: 'graduationYear',
          type: 'text',
          label: 'Graduation Year',
          required: true
        },
        {
          id: 'details',
          type: 'textarea',
          label: 'Details',
          uiProps: {
            rows: 2,
            placeholder: 'Relevant coursework, projects, achievements...'
          },
          aiHints: {
            contextBuilders: {
              improve: 'education-details',
              autocomplete: 'education-details'
            },
            improvementPrompts: [
              'Add relevant coursework',
              'Include academic achievements',
              'Mention projects or thesis',
              'Add GPA if impressive'
            ],
            autocompleteEnabled: true,
            priority: 'medium'
          }
        }
      ],
      aiContext: {
        sectionSummaryBuilder: 'education-summary',
        itemSummaryBuilder: 'education-item'
      },
      uiConfig: {
        icon: 'GraduationCap',
        addButtonText: 'Add Education',
        itemDisplayTemplate: '{degree} from {institution}',
        sortable: true
      }
    };
  }

  private createLegacySkillsSchema(): SectionSchema {
    return {
      id: 'skills',
      name: 'Skills',
      type: 'list',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Skill',
          required: true,
          aiHints: {
            contextBuilders: {
              improve: 'skill-name',
              autocomplete: 'skill-name'
            },
            improvementPrompts: [
              'Add specific technologies',
              'Include proficiency levels',
              'Group related skills',
              'Add trending skills'
            ],
            autocompleteEnabled: true,
            priority: 'high'
          }
        }
      ],
      aiContext: {
        sectionSummaryBuilder: 'skills-summary',
        itemSummaryBuilder: 'skill-item',
        batchImprovementSupported: true
      },
      uiConfig: {
        icon: 'Wand2',
        addButtonText: 'Add Skill',
        itemDisplayTemplate: '{name}',
        sortable: true
      }
    };
  }

  private createLegacyCustomTextSchema(): SectionSchema {
    return {
      id: 'customText',
      name: 'Custom Section',
      type: 'single',
      fields: [
        {
          id: 'content',
          type: 'textarea',
          label: 'Content',
          required: true,
          uiProps: {
            rows: 3,
            placeholder: 'Enter your custom content...'
          },
          aiHints: {
            contextBuilders: {
              improve: 'custom-content',
              autocomplete: 'custom-content'
            },
            improvementPrompts: [
              'Improve clarity',
              'Make it more professional',
              'Add specific examples',
              'Optimize formatting'
            ],
            autocompleteEnabled: true,
            priority: 'medium'
          }
        }
      ],
      aiContext: {
        sectionSummaryBuilder: 'custom-summary',
        itemSummaryBuilder: 'custom-content'
      },
      uiConfig: {
        icon: 'FilePlus2',
        addButtonText: 'Add Content'
      }
    };
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
  public buildAIContext(payload: AIContextPayload): StructuredAIContext {
    const { resumeData, task, sectionId, itemId, fieldId } = payload;
    
    const section = resumeData.sections.find((s: any) => s.id === sectionId);
    if (!section) return { currentItemContext: '', otherSectionsContext: '' };
    
    const schemaId = section.schemaId || section.type;
    const sectionSchema = this.getSectionSchema(schemaId);
    const fieldSchema = sectionSchema?.fields.find(f => f.id === fieldId);
    
    // 1. Build currentItemContext
    let currentItemContext = '';
    const builderId = fieldSchema?.aiHints?.contextBuilders?.[task];
    if (builderId) {
      const itemData = itemId ? section.items?.find((i: any) => i.id === itemId) : section.items?.[0];
      const itemContent = itemData?.data || itemData;
      currentItemContext = this.buildContext(builderId, itemContent, resumeData);
    }

    // 2. Build otherSectionsContext
    const otherSectionsContextParts: string[] = [];
    for (const otherSection of resumeData.sections) {
      if (otherSection.id === sectionId) continue;
      const otherSchemaId = otherSection.schemaId || otherSection.type;
      const otherSchema = this.getSectionSchema(otherSchemaId);
      if (otherSchema?.aiContext?.sectionSummaryBuilder) {
        const summary = this.buildContext(otherSchema.aiContext.sectionSummaryBuilder, otherSection, resumeData);
        otherSectionsContextParts.push(summary);
      }
    }

    return {
      currentItemContext,
      otherSectionsContext: otherSectionsContextParts.join('\n\n'),
      userJobTitle: resumeData.personalDetails?.jobTitle,
    };
  }

  // NEW: Resume Stringify Service for Review
  public stringifyResumeForReview(resumeData: any): string {
    const sectionParts: string[] = [];
    
    // Add personal details first
    if (resumeData.personalDetails) {
      const personalInfo = [
        resumeData.personalDetails.name,
        resumeData.personalDetails.jobTitle,
        resumeData.personalDetails.email,
        resumeData.personalDetails.phone,
        resumeData.personalDetails.location
      ].filter(Boolean).join(' | ');
      
      if (personalInfo) {
        sectionParts.push(`## Personal Information\n${personalInfo}`);
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
    
    return sectionParts.join('\n\n');
  }
}

// 导出单例实例
export const schemaRegistry = SchemaRegistry.getInstance(); 