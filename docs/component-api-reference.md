# A4 Resume Studio - 组件 API 参考

## 核心组件

### 1. ResumeCanvas

主要的简历渲染容器，负责选择和渲染适当的模板。

#### Props
```typescript
interface ResumeCanvasProps {
  resumeData: ResumeData;           // 简历数据
  className?: string;               // 额外的CSS类名
}
```

#### 使用示例
```tsx
<ResumeCanvas 
  resumeData={resumeData} 
  className="custom-canvas-style"
/>
```

#### 特性
- 自动模板选择基于 `resumeData.templateId`
- A4 页面尺寸适配
- 打印优化支持
- 响应式设计

---

### 2. TemplateSelector

模板选择器组件，提供可视化的模板选择界面。

#### Props
```typescript
interface TemplateSelectorProps {
  selectedTemplateId: string;                    // 当前选中的模板ID
  onSelectTemplate: (templateId: string) => void; // 模板选择回调
}
```

#### 使用示例
```tsx
<TemplateSelector
  selectedTemplateId={selectedTemplateId}
  onSelectTemplate={handleSelectTemplate}
/>
```

#### 特性
- 横向滚动的模板预览
- 键盘导航支持
- 选中状态视觉反馈
- 无障碍访问支持

---

### 3. SectionManager

章节管理器，用于管理简历的各个章节。

#### Props
```typescript
interface SectionManagerProps {
  resumeData: ResumeData;                                    // 简历数据
  onUpdateResumeData: (updatedData: ResumeData) => void;     // 数据更新回调
  onEditSection: (targetId: string | 'personalDetails') => void; // 编辑章节回调
}
```

#### 使用示例
```tsx
<SectionManager 
  resumeData={resumeData} 
  onUpdateResumeData={handleUpdateResumeData}
  onEditSection={handleEditSection}
/>
```

#### 特性
- 章节可见性切换
- 章节重新排序（拖拽）
- 添加新章节
- 删除章节
- 章节类型图标显示

---

### 4. SectionEditor

章节编辑器，提供详细的章节内容编辑功能。

#### Props
```typescript
interface SectionEditorProps {
  resumeData: ResumeData;                                    // 简历数据
  targetToEdit: string | 'personalDetails';                 // 编辑目标ID
  onUpdateResumeData: (updatedData: ResumeData) => void;     // 数据更新回调
  onCloseEditor: () => void;                                 // 关闭编辑器回调
  isAutocompleteEnabled: boolean;                            // 是否启用自动补全
  onToggleAutocomplete: (enabled: boolean) => void;         // 切换自动补全回调
}
```

#### 使用示例
```tsx
<SectionEditor
  resumeData={resumeData}
  targetToEdit={editingTarget}
  onUpdateResumeData={handleUpdateResumeData}
  onCloseEditor={handleCloseEditor}
  isAutocompleteEnabled={isAutocompleteEnabled}
  onToggleAutocomplete={setIsAutocompleteEnabled}
/>
```

#### 特性
- 动态表单生成
- AI 自动补全集成
- AI 内容改进功能
- 实时预览
- 表单验证

---

### 5. AutocompleteTextarea

支持 AI 自动补全的文本输入组件。

#### Props
```typescript
interface AutocompleteTextareaProps {
  value: string;                                    // 当前值
  onChange: (value: string) => void;                // 值变化回调
  placeholder?: string;                             // 占位符文本
  className?: string;                               // CSS类名
  isAutocompleteEnabled?: boolean;                  // 是否启用自动补全
  userJobTitle?: string;                            // 用户职位（用于AI上下文）
  sectionType?: string;                             // 章节类型（用于AI上下文）
  currentItemContext?: string;                      // 当前项目上下文
  otherSectionsContext?: string;                    // 其他章节上下文
  rows?: number;                                    // 文本区域行数
}
```

#### 使用示例
```tsx
<AutocompleteTextarea
  value={description}
  onChange={setDescription}
  placeholder="描述你的工作经历..."
  isAutocompleteEnabled={true}
  userJobTitle="软件工程师"
  sectionType="experience"
  rows={4}
/>
```

#### 特性
- 2秒防抖触发自动补全
- Tab键接受建议
- Escape键取消建议
- 加载状态指示
- 错误处理

---

### 6. AIReviewDialog

AI 简历评审对话框组件。

#### Props
```typescript
interface AIReviewDialogProps {
  isOpen: boolean;                                          // 是否打开
  onClose: () => void;                                      // 关闭回调
  reviewContent: { overallQuality: string; suggestions: string } | null; // 评审内容
  isLoading: boolean;                                       // 是否加载中
}
```

#### 使用示例
```tsx
<AIReviewDialog
  isOpen={isReviewDialogOpen}
  onClose={() => setIsReviewDialogOpen(false)}
  reviewContent={reviewContent}
  isLoading={isReviewLoading}
/>
```

#### 特性
- Markdown 内容渲染
- 加载骨架屏
- 滚动区域支持
- 响应式布局

---

## 模板组件

### 1. DefaultTemplate

经典专业模板组件。

#### Props
```typescript
interface DefaultTemplateProps {
  resumeData: ResumeData;                           // 简历数据
}
```

#### 特性
- 传统单栏布局
- 清晰的章节分隔
- 专业的排版风格
- 优化的打印效果

---

### 2. ModernTemplate

现代简约模板组件。

#### Props
```typescript
interface ModernTemplateProps {
  resumeData: ResumeData;                           // 简历数据
}
```

#### 特性
- 现代化设计风格
- 灵活的布局系统
- 视觉层次清晰
- 移动端友好

---

## 工具组件

### 1. Header

应用头部组件。

#### Props
```typescript
interface HeaderProps {
  onReviewResume: () => void;                       // 评审简历回调
  onExportPdf: () => void;                          // 导出PDF回调
}
```

#### 使用示例
```tsx
<Header 
  onReviewResume={handleReviewResume} 
  onExportPdf={handleExportPdf} 
/>
```

#### 特性
- 品牌标识显示
- 主要操作按钮
- 响应式导航
- 主题切换支持

---

## Hooks

### 1. useToast

Toast 通知 Hook。

#### 返回值
```typescript
interface UseToastReturn {
  toast: (props: ToastProps) => void;               // 显示toast
  dismiss: (toastId?: string) => void;              // 关闭toast
  toasts: ToasterToast[];                           // 当前toast列表
}
```

#### 使用示例
```tsx
const { toast } = useToast();

// 显示成功消息
toast({
  title: "保存成功",
  description: "简历已保存到本地存储",
  variant: "default"
});

// 显示错误消息
toast({
  title: "保存失败",
  description: "请检查网络连接后重试",
  variant: "destructive"
});
```

---

## 类型定义

### 1. 核心数据类型

```typescript
// 简历数据主结构
interface ResumeData {
  personalDetails: PersonalDetails;
  sections: ResumeSection[];
  templateId: string;
}

// 个人信息
interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

// 简历章节
interface ResumeSection {
  id: string;
  title: string;
  type: SectionType;
  visible: boolean;
  items: SectionItem[];
  isList: boolean;
}

// 章节类型
type SectionType = 'summary' | 'experience' | 'education' | 'skills' | 'customText';

// 章节项目联合类型
type SectionItem = ExperienceEntry | EducationEntry | SkillEntry | CustomTextEntry;
```

### 2. AI 接口类型

```typescript
// 自动补全输入
interface AutocompleteInputInput {
  inputText: string;
  userJobTitle?: string;
  sectionType?: string;
  currentItemContext?: string;
  otherSectionsContext?: string;
}

// 自动补全输出
interface AutocompleteInputOutput {
  completion: string;
}

// 内容改进输入
interface ImproveResumeSectionInput {
  resumeSection: string;
  prompt: string;
  userJobTitle?: string;
  sectionType?: string;
  currentItemContext?: string;
  otherSectionsContext?: string;
}

// 内容改进输出
interface ImproveResumeSectionOutput {
  improvedResumeSection: string;
}

// 简历评审输入
interface ReviewResumeInput {
  resumeText: string;
}

// 简历评审输出
interface ReviewResumeOutput {
  overallQuality: string;
  suggestions: string;
}
```

### 3. 模板类型

```typescript
// 模板信息
interface TemplateInfo {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint: string;
}

// 模板样式配置
interface TemplateStyleConfig {
  fontFamily: string;
  headingColor: string;
  accentColor: string;
  spacing: string;
}
```

---

## 事件处理

### 1. 数据更新事件

```typescript
// 更新个人信息
const handleUpdatePersonalDetails = (updates: Partial<PersonalDetails>) => {
  setResumeData(prev => ({
    ...prev,
    personalDetails: { ...prev.personalDetails, ...updates }
  }));
};

// 更新章节
const handleUpdateSection = (sectionId: string, updates: Partial<ResumeSection>) => {
  setResumeData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    )
  }));
};

// 添加章节项目
const handleAddSectionItem = (sectionId: string, newItem: SectionItem) => {
  setResumeData(prev => ({
    ...prev,
    sections: prev.sections.map(section =>
      section.id === sectionId 
        ? { ...section, items: [...section.items, newItem] }
        : section
    )
  }));
};
```

### 2. UI 交互事件

```typescript
// 模板选择
const handleSelectTemplate = (templateId: string) => {
  setSelectedTemplateId(templateId);
  setResumeData(prev => ({ ...prev, templateId }));
};

// 章节编辑
const handleEditSection = (targetId: string | 'personalDetails') => {
  setEditingTarget(targetId);
  if (!isRightPanelOpen) setIsRightPanelOpen(true);
};

// 关闭编辑器
const handleCloseEditor = () => {
  setEditingTarget(null);
};
```

---

## 样式系统

### 1. CSS 类命名约定

```css
/* 组件前缀 */
.resume-canvas { /* 主要组件 */ }
.template-selector { /* 模板选择器 */ }
.section-manager { /* 章节管理器 */ }
.section-editor { /* 章节编辑器 */ }

/* 状态修饰符 */
.is-loading { /* 加载状态 */ }
.is-active { /* 激活状态 */ }
.is-disabled { /* 禁用状态 */ }
.is-hidden { /* 隐藏状态 */ }

/* 响应式修饰符 */
.mobile-only { /* 仅移动端显示 */ }
.desktop-only { /* 仅桌面端显示 */ }
.tablet-up { /* 平板及以上显示 */ }
```

### 2. Tailwind CSS 工具类

```css
/* 布局 */
.a4-canvas { @apply w-[210mm] min-h-[297mm] max-h-[297mm] mx-auto bg-white shadow-lg p-[20mm] box-border overflow-hidden; }

/* 打印样式 */
.printable-area { @apply print:shadow-none print:m-0 print:w-full print:h-screen print:max-h-none; }
.no-print { @apply print:hidden; }

/* 响应式 */
.responsive-panel { @apply w-full md:w-[320px] lg:w-[360px]; }
```

---

## 最佳实践

### 1. 组件使用

```tsx
// ✅ 推荐：使用 TypeScript 类型
const MyComponent: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  return <div>{/* 组件内容 */}</div>;
};

// ✅ 推荐：使用 memo 优化性能
const OptimizedComponent = React.memo(MyComponent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

// ✅ 推荐：错误边界处理
const SafeComponent = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return <ErrorFallback onRetry={() => setHasError(false)} />;
  }
  
  return <ErrorBoundary onError={() => setHasError(true)}>{children}</ErrorBoundary>;
};
```

### 2. 状态管理

```tsx
// ✅ 推荐：使用 useCallback 优化回调
const handleUpdate = useCallback((newData: ResumeData) => {
  setResumeData(newData);
}, []);

// ✅ 推荐：使用 useMemo 优化计算
const processedData = useMemo(() => {
  return processResumeData(resumeData);
}, [resumeData]);

// ✅ 推荐：自定义 Hook 封装逻辑
const useResumeEditor = (initialData: ResumeData) => {
  const [data, setData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  
  const updateData = useCallback((updates: Partial<ResumeData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);
  
  return { data, isEditing, updateData, setIsEditing };
};
```

### 3. 错误处理

```tsx
// ✅ 推荐：组件级错误处理
const ComponentWithErrorHandling = () => {
  const [error, setError] = useState<Error | null>(null);
  
  if (error) {
    return (
      <div className="error-container">
        <h3>出现错误</h3>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>重试</button>
      </div>
    );
  }
  
  return <ActualComponent onError={setError} />;
};
``` 