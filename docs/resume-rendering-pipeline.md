# Resume Rendering Pipeline Documentation

## Overview
This document describes the complete pipeline for rendering resume data into visual presentations.

## Core Components

### 1. ResumeCanvas
Main rendering container that selects and renders appropriate templates.

### 2. Template System
- DefaultTemplate: Classic professional layout
- ModernTemplate: Modern minimalist design
- CreativeTemplate: Creative impact layout

### 3. Section Renderers
Individual components for rendering different resume sections.

## Rendering Flow
1. Data validation and preprocessing
2. Template selection based on templateId
3. Component rendering with proper styling
4. A4 layout optimization
5. Final output generation

## Performance Considerations
- Memoization for expensive renders
- Virtual scrolling for large datasets
- Lazy loading of template components

## Export Capabilities
- PDF generation
- Print optimization
- HTML export

## 渲染管道概述

简历渲染管道负责将结构化的简历数据转换为可视化的简历页面，支持多种模板和响应式布局。

## 渲染流程图

```
ResumeData → Template Selection → Component Rendering → Style Application → A4 Layout → Final Output
     ↓              ↓                    ↓                  ↓              ↓           ↓
  数据验证      模板匹配           组件渲染           样式应用        页面布局      最终输出
```

## 核心组件架构

### 1. ResumeCanvas (主渲染容器)

```typescript
// src/components/resume/ResumeCanvas.tsx
interface ResumeCanvasProps {
  resumeData: ResumeData;
  className?: string;
}

export default function ResumeCanvas({ resumeData, className }: ResumeCanvasProps) {
  // 根据 templateId 选择对应的模板组件
  let CurrentTemplate;
  switch (resumeData.templateId) {
    case 'modern-minimalist':
      CurrentTemplate = ModernTemplate;
      break;
    case 'creative':
      CurrentTemplate = CreativeTemplate;
      break;
    case 'default':
    default:
      CurrentTemplate = DefaultTemplate;
      break;
  }

  return (
    <div id="resume-canvas-printable-area" className={cn("a4-canvas printable-area", className)}>
      <CurrentTemplate resumeData={resumeData} />
    </div>
  );
}
```

### 2. 模板组件结构

#### DefaultTemplate (经典专业模板)
```typescript
const DefaultTemplate = ({ resumeData }: { resumeData: ResumeData }) => {
  const { personalDetails, sections } = resumeData;

  return (
    <div className="text-xs leading-relaxed">
      {/* 头部信息 */}
      <HeaderSection personalDetails={personalDetails} />
      
      {/* 联系信息 */}
      <ContactSection personalDetails={personalDetails} />
      
      {/* 动态章节 */}
      {sections.map((section) => (
        section.visible && (
          <SectionRenderer 
            key={section.id} 
            section={section} 
            templateId={resumeData.templateId}
          />
        )
      ))}
    </div>
  );
};
```

#### ModernTemplate (现代简约模板)
```typescript
const ModernTemplate = ({ resumeData }: ModernTemplateProps) => {
  return (
    <div className="text-sm p-8 bg-white">
      {/* 现代化布局 */}
      <div className="grid grid-cols-3 gap-8">
        {/* 左侧栏 */}
        <div className="col-span-1">
          <PersonalInfoSidebar personalDetails={resumeData.personalDetails} />
          <SkillsSidebar sections={resumeData.sections} />
        </div>
        
        {/* 主内容区 */}
        <div className="col-span-2">
          <MainContentArea sections={resumeData.sections} />
        </div>
      </div>
    </div>
  );
};
```

### 3. 章节渲染器 (SectionRenderer)

```typescript
const renderSectionItem = (item: SectionItem, type: SectionType, templateId: string) => {
  switch (type) {
    case 'experience':
      return <ExperienceItem item={item as ExperienceEntry} templateId={templateId} />;
    case 'education':
      return <EducationItem item={item as EducationEntry} templateId={templateId} />;
    case 'skills':
      return <SkillItem item={item as SkillEntry} templateId={templateId} />;
    case 'summary':
    case 'customText':
      return <TextItem item={item as CustomTextEntry} templateId={templateId} />;
    default:
      return null;
  }
};
```

## 样式系统

### 1. CSS 类命名规范

```css
/* A4 页面容器 */
.a4-canvas {
  width: 210mm;
  min-height: 297mm;
  max-height: 297mm;
  margin: 0 auto;
  background: white;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  padding: 20mm;
  box-sizing: border-box;
  overflow: hidden;
}

/* 打印样式 */
.printable-area {
  @media print {
    box-shadow: none;
    margin: 0;
    width: 100%;
    height: 100vh;
    max-height: none;
  }
}

/* 非打印元素 */
.no-print {
  @media print {
    display: none !important;
  }
}
```

### 2. 响应式设计

```css
/* 移动端适配 */
@media (max-width: 768px) {
  .a4-canvas {
    width: 100%;
    min-height: auto;
    max-height: none;
    padding: 16px;
    margin: 0;
    box-shadow: none;
  }
}

/* 平板适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .a4-canvas {
    width: 90%;
    padding: 18mm;
  }
}
```

### 3. 模板特定样式

```typescript
// 样式配置对象
const templateStyles = {
  default: {
    fontFamily: 'Inter, sans-serif',
    headingColor: 'text-primary',
    accentColor: 'text-accent',
    spacing: 'space-y-3'
  },
  'modern-minimalist': {
    fontFamily: 'Space Grotesk, sans-serif',
    headingColor: 'text-gray-800',
    accentColor: 'text-blue-600',
    spacing: 'space-y-4'
  },
  creative: {
    fontFamily: 'Poppins, sans-serif',
    headingColor: 'text-purple-700',
    accentColor: 'text-orange-500',
    spacing: 'space-y-5'
  }
};
```

## 数据预处理

### 1. 数据清理和验证

```typescript
function preprocessResumeData(rawData: ResumeData): ProcessedResumeData {
  return {
    ...rawData,
    personalDetails: cleanPersonalDetails(rawData.personalDetails),
    sections: rawData.sections
      .filter(section => section.visible)
      .map(section => ({
        ...section,
        items: section.items.filter(item => isValidItem(item, section.type))
      }))
      .filter(section => section.items.length > 0)
  };
}

function cleanPersonalDetails(details: PersonalDetails): PersonalDetails {
  return {
    ...details,
    fullName: details.fullName.trim(),
    email: details.email.toLowerCase().trim(),
    phone: formatPhoneNumber(details.phone),
    linkedin: formatUrl(details.linkedin),
    github: formatUrl(details.github),
    portfolio: formatUrl(details.portfolio)
  };
}
```

### 2. 内容优化

```typescript
function optimizeForTemplate(data: ResumeData, templateId: string): ResumeData {
  switch (templateId) {
    case 'modern-minimalist':
      return optimizeForModernTemplate(data);
    case 'creative':
      return optimizeForCreativeTemplate(data);
    default:
      return data;
  }
}

function optimizeForModernTemplate(data: ResumeData): ResumeData {
  return {
    ...data,
    sections: data.sections.map(section => {
      if (section.type === 'skills') {
        // 现代模板限制技能数量以保持简洁
        return {
          ...section,
          items: section.items.slice(0, 8)
        };
      }
      return section;
    })
  };
}
```

## 布局算法

### 1. A4 页面适配算法

```typescript
class A4LayoutManager {
  private readonly PAGE_HEIGHT = 297; // mm
  private readonly CONTENT_HEIGHT = 257; // mm (减去边距)
  
  calculateLayout(sections: ResumeSection[]): LayoutResult {
    let currentHeight = 0;
    const layoutSections: LayoutSection[] = [];
    
    for (const section of sections) {
      const sectionHeight = this.estimateSectionHeight(section);
      
      if (currentHeight + sectionHeight > this.CONTENT_HEIGHT) {
        // 需要分页或调整布局
        return this.handleOverflow(layoutSections, section);
      }
      
      layoutSections.push({
        ...section,
        estimatedHeight: sectionHeight,
        position: currentHeight
      });
      
      currentHeight += sectionHeight;
    }
    
    return { sections: layoutSections, totalHeight: currentHeight };
  }
  
  private estimateSectionHeight(section: ResumeSection): number {
    const baseHeight = 15; // 标题高度
    const itemHeight = this.getItemHeight(section.type);
    return baseHeight + (section.items.length * itemHeight);
  }
  
  private getItemHeight(type: SectionType): number {
    switch (type) {
      case 'experience': return 25;
      case 'education': return 20;
      case 'skills': return 8;
      case 'summary': return 15;
      case 'customText': return 12;
      default: return 15;
    }
  }
}
```

### 2. 动态字体缩放

```typescript
function calculateOptimalFontSize(content: string, containerWidth: number): number {
  const baseSize = 12; // px
  const charWidth = 7; // 平均字符宽度
  const maxCharsPerLine = Math.floor(containerWidth / charWidth);
  const lines = Math.ceil(content.length / maxCharsPerLine);
  
  if (lines > 3) {
    return Math.max(10, baseSize - (lines - 3) * 0.5);
  }
  
  return baseSize;
}
```

## 性能优化

### 1. 虚拟化渲染

```typescript
// 对于大量数据的章节，使用虚拟化渲染
const VirtualizedSection = ({ items, renderItem }: VirtualizedSectionProps) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  return (
    <div className="virtualized-container">
      {items.slice(visibleRange.start, visibleRange.end).map(renderItem)}
    </div>
  );
};
```

### 2. 渲染缓存

```typescript
const memoizedTemplateRenderer = useMemo(() => {
  return createTemplateRenderer(resumeData.templateId);
}, [resumeData.templateId]);

const MemoizedSection = React.memo(({ section }: { section: ResumeSection }) => {
  return <SectionRenderer section={section} />;
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.section) === JSON.stringify(nextProps.section);
});
```

## 导出功能

### 1. PDF 导出

```typescript
async function exportToPDF(resumeData: ResumeData): Promise<Blob> {
  // 创建隐藏的渲染容器
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.innerHTML = renderResumeHTML(resumeData);
  
  document.body.appendChild(container);
  
  try {
    // 使用 html2canvas 和 jsPDF
    const canvas = await html2canvas(container, {
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      scale: 2
    });
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    
    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}
```

### 2. 打印优化

```typescript
function optimizeForPrint() {
  // 添加打印专用样式
  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #resume-canvas-printable-area,
      #resume-canvas-printable-area * { visibility: visible; }
      #resume-canvas-printable-area {
        position: absolute;
        left: 0;
        top: 0;
        width: 100% !important;
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = printStyles;
  document.head.appendChild(styleSheet);
  
  window.print();
  
  // 清理样式
  setTimeout(() => {
    document.head.removeChild(styleSheet);
  }, 1000);
}
```

## 错误处理和降级

### 1. 模板加载失败处理

```typescript
function SafeTemplateRenderer({ resumeData }: { resumeData: ResumeData }) {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    return <FallbackTemplate resumeData={resumeData} />;
  }
  
  try {
    return <DynamicTemplate resumeData={resumeData} />;
  } catch (err) {
    setError(err as Error);
    return <FallbackTemplate resumeData={resumeData} />;
  }
}
```

### 2. 渲染性能监控

```typescript
function useRenderingPerformance() {
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('resume-render')) {
          console.log(`Rendering took: ${entry.duration}ms`);
          
          if (entry.duration > 1000) {
            // 渲染时间过长，触发优化
            optimizeRendering();
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, []);
}
```

## 测试策略

### 1. 视觉回归测试

```typescript
describe('Resume Rendering', () => {
  test('should render default template correctly', async () => {
    const { container } = render(<ResumeCanvas resumeData={mockResumeData} />);
    
    // 等待渲染完成
    await waitFor(() => {
      expect(container.querySelector('.a4-canvas')).toBeInTheDocument();
    });
    
    // 视觉快照测试
    expect(container).toMatchSnapshot();
  });
  
  test('should handle template switching', async () => {
    const { rerender } = render(
      <ResumeCanvas resumeData={{ ...mockResumeData, templateId: 'default' }} />
    );
    
    rerender(
      <ResumeCanvas resumeData={{ ...mockResumeData, templateId: 'modern-minimalist' }} />
    );
    
    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });
});
```

### 2. 性能测试

```typescript
test('should render large resume within performance budget', async () => {
  const largeResumeData = generateLargeResumeData(100); // 100个工作经历
  
  const startTime = performance.now();
  render(<ResumeCanvas resumeData={largeResumeData} />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(500); // 500ms 内完成渲染
});
``` 