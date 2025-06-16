import { 
  SectionSchema, 
  FieldSchema, 
  ISchemaRegistry, 
  ContextBuilderFunction,
  ADVANCED_SKILLS_SCHEMA,
  PROJECTS_SCHEMA
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
    // 基础上下文构建器
    this.registerContextBuilder('experience-item', (data, allData) => {
      return `Job: ${data.jobTitle || 'Untitled Job'} at ${data.company || 'Unnamed Company'}`;
    });

    this.registerContextBuilder('education-item', (data, allData) => {
      return `Degree: ${data.degree || 'Untitled Degree'} from ${data.institution || 'Unnamed Institution'}`;
    });

    this.registerContextBuilder('skill-item', (data, allData) => {
      return `Skill: ${data.name || 'Unnamed Skill'}`;
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

    this.registerContextBuilder('advanced-skills-summary', (section, allData) => {
      const categories = section.items?.map((item: any) => 
        `${item.data.category}: ${Array.isArray(item.data.skills) ? item.data.skills.join(', ') : item.data.skills || ''}`
      ).join('; ') || '';
      return `Advanced Skills: ${categories}`;
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
      return `Project: ${data.name}, Technologies: ${tech}`;
    });

    this.registerContextBuilder('projects-summary', (section, allData) => {
      const projects = section.items?.map((item: any) => 
        `${item.data.name}: ${item.data.description?.substring(0, 50)}...`
      ).join('; ') || '';
      return `Projects: ${projects}`;
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
            contextBuilder: 'summary-content',
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
        summaryBuilder: 'summary-section',
        itemContextBuilder: 'summary-content'
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
            contextBuilder: 'job-title',
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
            contextBuilder: 'company-name',
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
            contextBuilder: 'job-description',
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
        summaryBuilder: 'experience-summary',
        itemContextBuilder: 'experience-item',
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
            contextBuilder: 'degree-name',
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
            contextBuilder: 'institution-name',
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
            contextBuilder: 'education-details',
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
        summaryBuilder: 'education-summary',
        itemContextBuilder: 'education-item'
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
            contextBuilder: 'skill-name',
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
        summaryBuilder: 'skills-summary',
        itemContextBuilder: 'skill-item',
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
            contextBuilder: 'custom-content',
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
        summaryBuilder: 'custom-summary',
        itemContextBuilder: 'custom-content'
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
}

// 导出单例实例
export const schemaRegistry = SchemaRegistry.getInstance(); 