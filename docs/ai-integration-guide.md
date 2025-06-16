# A4 Resume Studio - AI 集成指南

## AI 功能概述

A4 Resume Studio 集成了四个核心 AI 功能，基于 Google Genkit 和 Gemini API 实现：

1. **自动补全 (Autocomplete)** - 智能文本补全建议
2. **内容改进 (Content Improvement)** - AI 驱动的文本优化
3. **批量改进 (Batch Improvement)** - 针对特定章节的批量内容优化
4. **简历评审 (Resume Review)** - 全面的简历质量分析

## 技术架构

### 1. Genkit 框架集成

```typescript
// src/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash-lite', // 默认模型
});
```

### 2. Flow-based 架构

每个 AI 功能都实现为独立的 Genkit Flow：

```typescript
// 通用 Flow 结构
const aiFlow = ai.defineFlow(
  {
    name: 'flowName',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    const { output } = await aiPrompt(input);
    return output!;
  }
);
```

## AI 功能详解

### 1. 自动补全功能 (Autocomplete)

#### 实现位置
- **Flow**: `src/ai/flows/autocomplete-input.ts`
- **UI 组件**: `src/components/resume/AutocompleteTextarea.tsx`

#### 核心特性
- **触发机制**: 用户停止输入 2 秒后自动触发
- **上下文感知**: 基于当前章节类型、用户职位、当前编辑项的完整数据及整个简历数据提供建议。
- **轻量模型**: 使用 `gemini-2.0-flash-lite` 确保快速响应。
- **动态 Schema 支持**: 能够根据注册的动态 Schema 信息构建更准确的上下文。

#### 输入参数
```typescript
interface AutocompleteInputInput {
  inputText: string;                    // 用户当前输入
  userJobTitle?: string;                // 目标职位
  sectionType?: string;                 // 章节类型 (experience, skills, etc. 或动态 schema ID)
  currentItemContext?: string;          // 当前项目上下文 (legacy support)
  otherSectionsContext?: string;        // 其他章节上下文
  fieldId?: string;                     // 正在编辑的特定字段ID (用于动态章节)
  currentItemData?: Record<string, any>; // 当前编辑项的完整数据 (用于动态章节)
  allResumeData?: Record<string, any>;  // 完整的简历数据 (包含个人信息和所有章节)
  enhancedContext?: string;             // 预构建的增强上下文，用于解决 Handlebars helper 问题
}
```

#### 使用示例
```typescript
// 在工作经历章节中的自动补全
const result = await autocompleteInput({
  inputText: "Developed web applications using",
  userJobTitle: "Frontend Developer",
  sectionType: "experience",
  currentItemContext: "Job: Software Engineer at Tech Co",
  otherSectionsContext: "Skills: React, TypeScript, Node.js"
});
// 返回: "React and TypeScript, improving user experience by 30%"
```

#### UI 集成
```typescript
// AutocompleteTextarea 组件核心逻辑
const handleInputChange = useCallback((value: string) => {
  setValue(value);
  
  // 防抖处理
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }
  
  debounceTimeoutRef.current = setTimeout(() => {
    if (value.trim() && isAutocompleteEnabled) {
      fetchAutocompletion(value);
    }
  }, 2000); // 2秒延迟
}, [isAutocompleteEnabled]);
```

### 2. 内容改进功能 (Content Improvement)

#### 实现位置
- **Flow**: `src/ai/flows/improve-resume-section.ts`
- **UI 集成**: `src/components/resume/SectionEditor.tsx`

#### 核心特性
- **自定义提示**: 用户可以提供具体的改进指令。
- **上下文保持**: 保持与整个简历的一致性，通过传递更完整的 `currentItemData` 和 `allResumeData` 增强上下文感知能力。
- **多种改进类型**: 支持语法、结构、内容等多维度优化。
- **动态 Schema 支持**: 能够根据注册的动态 Schema 信息构建更准确的上下文。

#### 输入参数
```typescript
interface ImproveResumeSectionInput {
  resumeSection: string;                // 待改进内容
  prompt: string;                       // 用户改进指令
  userJobTitle?: string;                // 目标职位
  sectionType?: string;                 // 章节类型 (experience, skills, etc. 或动态 schema ID)
  currentItemContext?: string;          // 当前项目上下文 (legacy support)
  otherSectionsContext?: string;        // 其他章节上下文
  fieldId?: string;                     // 正在改进的特定字段ID (用于动态章节)
  currentItemData?: Record<string, any>; // 当前编辑项的完整数据 (用于动态章节)
  allResumeData?: Record<string, any>;  // 完整的简历数据 (包含个人信息和所有章节)
  enhancedContext?: string;             // 预构建的增强上下文，用于解决 Handlebars helper 问题
}
```

#### 常见改进提示示例
```typescript
const commonPrompts = {
  quantify: "添加具体的数字和成果指标",
  keywords: "优化关键词以提高ATS通过率",
  impact: "强调工作影响和价值创造",
  clarity: "提高表达的清晰度和专业性",
  action: "使用更强有力的动作词汇"
};
```

### 3. 批量改进功能 (Batch Improvement)

#### 实现位置
- **Flow**: `src/ai/flows/batch-improve-section.ts`
- **UI 集成**: 尚未直接集成到 UI，但可通过开发模式 (`src/ai/dev.ts`) 调用。

#### 核心特性
- **整段优化**: 针对特定章节的多个项目进行批量改进。
- **灵活目标**: 可定义多个改进目标，如量化成果、关键词优化等。
- **全面的上下文**: 利用完整的章节数据和整个简历数据进行优化。

#### 输入参数
```typescript
interface BatchImproveSectionInput {
  sectionData: Record<string, any>;     // 完整章节数据 (例如，DynamicResumeSection 或 ResumeSection)
  sectionType: string;                  // 章节类型或动态 schema ID
  improvementGoals: string[];           // 改进目标列表
  userJobTitle?: string;                // 用户目标职位
  otherSectionsContext?: string;        // 其他章节上下文
  allResumeData?: Record<string, any>;  // 完整的简历数据 (包含个人信息和所有章节)
  priorityFields?: string[];            // 优先改进的字段
}
```

#### 输出参数
```typescript
interface BatchImproveSectionOutput {
  improvedSectionData: Record<string, any>; // 改进后的章节数据
  improvementSummary: string;               // 改进摘要
  fieldChanges: Array<{
    fieldId: string;
    originalValue: string;
    improvedValue: string;
    changeReason: string;
  }>;
}
```

### 4. 简历评审功能 (Resume Review)

#### 实现位置
- **Flow**: `src/ai/flows/review-resume.ts`
- **UI 组件**: `src/components/resume/AIReviewDialog.tsx`

#### 核心特性
- **全面分析**: 评估简历的整体质量和结构。
- **具体建议**: 提供可操作的改进建议。
- **Markdown 支持**: 评审结果支持 Markdown 格式渲染。
- **动态 Schema 支持**: `stringifyResumeForReview` 函数已更新，能够解析并包含动态章节的完整数据，为 AI 提供全面的上下文。

#### 数据转换
```typescript
// 将 ResumeData (包括 LegacyResumeData 和 ExtendedResumeData) 转换为 AI 可处理的文本格式
const stringifyResumeForReview = (data: ResumeData): string => {
  let content = `Resume for ${data.personalDetails.fullName} (${data.personalDetails.jobTitle})\n\n`;
  
  // 联系信息
  content += `Contact: ${data.personalDetails.email} | ${data.personalDetails.phone}\n`;
  content += `Address: ${data.personalDetails.address}\n`;
  
  // 社交链接
  if (data.personalDetails.linkedin) content += `LinkedIn: ${data.personalDetails.linkedin}\n`;
  if (data.personalDetails.github) content += `GitHub: ${data.personalDetails.github}\n`;
  if (data.personalDetails.portfolio) content += `Portfolio: ${data.personalDetails.portfolio}\n`;
  
  content += '\n';
  
  // 各个章节 (处理 LegacyResumeData 和 ExtendedResumeData)
  data.sections.forEach(section => {
    if (section.visible) {
      content += `--- ${section.title.toUpperCase()} ---\n`;
      
      if ('type' in section) { // LegacyResumeData section
        section.items.forEach(item => {
          switch (section.type) {
            case 'experience':
              const exp = item as ExperienceEntry;
              content += `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.endDate})\n`;
              content += `${exp.description}\n\n`;
              break;
            case 'education':
              const edu = item as EducationEntry;
              content += `${edu.degree} from ${edu.institution} (${edu.graduationYear})\n`;
              if (edu.details) content += `${edu.details}\n`;
              content += '\n';
              break;
            case 'skills':
              const skill = item as SkillEntry;
              content += `- ${skill.name}\n`;
              break;
            case 'summary':
            case 'customText':
              const text = item as CustomTextEntry;
              content += `${text.content}\n\n`;
              break;
          }
        });
      } else if ('schemaId' in section) { // DynamicResumeSection
        section.items.forEach(item => {
          content += `Dynamic Item (Schema: ${item.schemaId}):\n`;
          Object.entries(item.data).forEach(([key, value]) => {
            if (typeof value === 'string') {
              content += `  ${key}: ${value}\n`;
            } else if (Array.isArray(value)) {
              content += `  ${key}: ${value.join(', ')}\n`;
            } else {
              content += `  ${key}: ${JSON.stringify(value)}\n`;
            }
          });
          content += '\n';
        });
      }
      
      content += '\n';
    }
  });
  
  return content;
};
```

## 错误处理策略

### 1. 网络错误处理
```typescript
async function handleAIRequest<T>(
  aiFunction: () => Promise<T>,
  fallbackMessage: string
): Promise<T | { error: string }> {
  try {
    return await aiFunction();
  } catch (error) {
    console.error('AI request failed:', error);
    
    // 假设 NetworkError 和 RateLimitError 是已定义的错误类型
    // if (error instanceof NetworkError) {
    //   return { error: '网络连接失败，请检查网络后重试' };
    // } else if (error instanceof RateLimitError) {
    //   return { error: 'AI 服务请求过于频繁，请稍后再试' };
    // } else {
      return { error: fallbackMessage };
    // }
  }
}
```

### 2. 降级策略
```typescript
// 自动补全降级策略
const fallbackAutocompletion = (inputText: string, sectionType: string): string => {
  const templates = {
    experience: [
      "负责项目开发和维护",
      "与团队协作完成项目目标",
      "优化系统性能和用户体验"
    ],
    skills: [
      "熟练掌握相关技术栈",
      "具备良好的学习能力",
      "拥有丰富的实践经验"
    ]
  };
  
  const suggestions = (templates as any)[sectionType] || ["继续完善这部分内容"];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};
```

## 性能优化

### 1. 请求缓存
```typescript
// 简单的内存缓存实现
class AICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5分钟过期
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
}

const aiCache = new AICache();
```

### 2. 请求防抖
```typescript
// 防抖 Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### 3. 并发控制
```typescript
// 限制并发 AI 请求数量
class ConcurrencyController {
  private activeRequests = 0;
  private readonly maxConcurrent = 3;
  private queue: Array<() => Promise<any>> = [];
  
  async execute<T>(request: () => Promise<T>): Promise<T> {
    if (this.activeRequests >= this.maxConcurrent) {
      return new Promise((resolve, reject) => {
        this.queue.push(async () => {
          try {
            const result = await this.executeRequest(request);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
    
    return this.executeRequest(request);
  }
  
  private async executeRequest<T>(request: () => Promise<T>): Promise<T> {
    this.activeRequests++;
    
    try {
      const result = await request();
      return result;
    } finally {
      this.activeRequests--;
      
      if (this.queue.length > 0) {
        const nextRequest = this.queue.shift()!;
        nextRequest();
      }
    }
  }
}
```

## 安全考虑

### 1. 输入验证
```typescript
// 使用 Zod 进行严格的输入验证
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)[^<]*)*<\/script>/gi, '') // 移除脚本
    .replace(/[<>]/g, '') // 移除 HTML 标签
    .trim()
    .slice(0, 5000); // 限制长度
};
```

### 2. API 密钥管理
```typescript
// 环境变量配置
const AI_CONFIG = {
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: process.env.AI_MODEL || 'googleai/gemini-2.0-flash-lite',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7')
};

// 运行时验证
if (!AI_CONFIG.apiKey) {
  throw new Error('Google AI API key is required');
}
```

## 监控和分析

### 1. 使用统计
```typescript
// AI 功能使用统计
class AIAnalytics {
  private static instance: AIAnalytics;
  private stats = {
    autocomplete: { requests: 0, successes: 0, failures: 0 },
    improve: { requests: 0, successes: 0, failures: 0 },
    review: { requests: 0, successes: 0, failures: 0 }
  };
  
  trackRequest(feature: 'autocomplete' | 'improve' | 'review', success: boolean) {
    this.stats[feature].requests++;
    if (success) {
      this.stats[feature].successes++;
    } else {
      this.stats[feature].failures++;
    }
  }
  
  getStats() {
    return { ...this.stats };
  }
}
```

### 2. 性能监控
```typescript
// AI 请求性能监控
const measureAIPerformance = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    
    console.log(`AI ${operationName} completed in ${duration.toFixed(2)}ms`);
    
    // 发送到分析服务
    if (duration > 5000) {
      console.warn(`Slow AI operation detected: ${operationName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`AI ${operationName} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
};
```

## 测试策略

### 1. 单元测试
```typescript
describe('AI Flows', () => {
  test('autocomplete should return valid completion', async () => {
    const input = {
      inputText: "Developed web applications",
      userJobTitle: "Frontend Developer",
      sectionType: "experience"
    };
    
    const result = await autocompleteInput(input);
    
    expect(result.completion).toBeDefined();
    expect(result.completion.length).toBeGreaterThan(0);
    expect(result.completion.length).toBeLessThan(200);
  });
  
  test('improve section should enhance content', async () => {
    const input = {
      resumeSection: "I worked on projects",
      prompt: "Make it more specific and quantifiable"
    };
    
    const result = await improveResumeSection(input);
    
    expect(result.improvedResumeSection).toBeDefined();
    expect(result.improvedResumeSection).not.toBe(input.resumeSection);
  });
});
```

### 2. 集成测试
```typescript
describe('AI Integration', () => {
  test('should handle network failures gracefully', async () => {
    // 模拟网络错误
    // 假设 NetworkError 是已定义的错误类型
    // jest.spyOn(global, 'fetch').mockRejectedValue(new NetworkError('Network error'));
    
    const result = await handleAIRequest(
      () => autocompleteInput({ inputText: "test" }),
      "自动补全失败"
    );
    
    expect(result).toHaveProperty('error');
  });
});
```

## 部署配置

### 1. 环境变量
```bash
# .env.local
GOOGLE_AI_API_KEY=your_api_key_here
AI_MODEL=googleai/gemini-2.0-flash-lite
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7
AI_CACHE_TTL=300000
```

### 2. 生产环境优化
```typescript
// 生产环境配置
const PRODUCTION_CONFIG = {
  enableCaching: true,
  maxConcurrentRequests: 5,
  requestTimeout: 10000,
  retryAttempts: 3,
  enableAnalytics: true
};
``` 