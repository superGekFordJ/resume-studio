# Resume Studio

*[中文说明](./README.zh.md) | English*

An intelligent, schema-driven resume builder powered by AI. Create, optimize, and customize professional resumes with advanced AI assistance features including auto-completion, content improvement, and comprehensive review capabilities.

**🛡️ Privacy-First Design**: Resume Studio is built with privacy as a core principle. Your data stays on your device with local storage, and you maintain full control over your information.

![Resume Studio Demo](./demo/diff-view-of-batch-improvement.png)

## ✨ Key Features

### 🤖 AI-Powered Content Generation
- **One-Click Resume Generation**: Generate complete resumes from job descriptions or personal context
- **Cover Letter Generation**: Create tailored cover letters matching your resume and target job
- **Smart Auto-completion**: Real-time content suggestions while typing
- **Single Field Improvement**: AI-driven optimization for individual content sections
- **Batch Content Enhancement**: Simultaneous improvement of multiple sections with diff view comparison
- **Comprehensive AI Review**: Full resume analysis with actionable feedback
- **🚀 Coming Soon**: Conversational agent for automated resume completion

### 🎨 Professional Templates
Resume Studio includes several professionally designed templates:

| Template | Preview | Description |
|----------|---------|-------------|
| **Classic Professional** | ![Classic](./public/images/templates/classic.png) | Traditional single-column layout |
| **Pro Classic (2-Col)** | ![Pro Classic](./public/images/templates/pro-classic.png) | Professional two-column design |
| **Sapphire Sidebar** | ![Sapphire](./public/images/templates/sapphire-sidebar.png) | Elegant layout with dark sidebar |
| **Veridian Sidebar** | ![Veridian](./public/images/templates/veridian-sidebar.png) | Classic design with teal sidebar and serif fonts |
| **Modern Minimalist** | ![Minimalist](./public/images/templates/minimalist.png) | Clean, contemporary styling |
| **Creative Two-Column** | ![Creative](./public/images/templates/basic-two-column.png) | Innovative design with enhanced visual hierarchy |
| **Continuous Narrative** | ![Narrative](./public/images/templates/continous-narrative.png) | Magazine-style continuous flow layout |
| **Parallel Modular** | ![Parallel](./public/images/templates/prallel-module.png) | Functionally distinct parallel columns |

### 🏗️ Schema-Driven Architecture
Built on a **single source of truth** schema system that enables:
- Dynamic section creation and management
- Consistent AI context building
- Extensible data structures
- Type-safe development

### 🛡️ Privacy & Data Control
- **Local Storage**: All your data stays on your device
- **No Data Collection**: We don't collect or store your personal information
- **Open Source**: Full transparency with auditable code
- **Self-Hosted Option**: Deploy your own instance for maximum control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Google AI Studio API key (Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/superGekFordJ/Resume-studio.git
   cd Resume-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google AI Studio API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   
   Get your API key from [Google AI Studio](https://aistudio.google.com/)
   
   > **⚠️ Important Configuration Notes**:
   > - API keys **must** be configured through environment files (`.env.local` or `.env.production`)
   > - UI-based API key configuration is temporarily disabled due to Genkit lifecycle constraints
   > - Currently uses **pre-configured Gemini models only** - no model selection available
   > - Multi-provider support and flexible model selection coming after AI system refactor

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002` to start building your resume!

### 🎯 Optimizing AI Performance

For the best AI assistance experience, we **strongly recommend** configuring these settings first:

1. **Target Job Info**: Go to Settings → Upload a job description image or paste the job details. Our AI will parse the requirements to provide highly targeted suggestions.

2. **Professional Bio**: Add your professional background in Settings. The system will help you format it while protecting sensitive credential information for privacy.

**Why this matters**: All AI features (auto-completion, improvements, reviews, generation) receive these contexts to provide personalized, relevant suggestions tailored to your career goals.

### 🔒 Privacy Recommendations

To ensure maximum data privacy when using AI features:

1. **Enable Google AI Studio Billing**: For enhanced data privacy rights with Google's AI services, enable billing in your [Google AI Studio account](https://aistudio.google.com/). This ensures your data is handled according to Google's enhanced privacy policies for paying customers.

2. **Review Data Policies**: Understand how your data is processed by reading Google AI's privacy policies before using AI features.

3. **Self-Host Option**: For organizations requiring maximum data control, consider self-hosting this application on your own infrastructure.

### Demo Features

Check out these demo files to see Resume Studio in action:
- 📹 **Quick Start Demo**: [demo/quick-start-of-generating-new-resumes.mp4](./demo/quick-start-of-generating-new-resumes.mp4)
- 🎯 **Auto-completion**: ![Auto-completion Demo](./demo/autocomplete.gif)  
- 📊 **Batch Improvement**: ![Batch Improvement Diff View](./demo/diff-view-of-batch-improvement.png)

## 🔧 Extending Resume Studio

### Adding New Resume Sections

Resume Studio's schema-driven architecture makes it incredibly easy to add new sections:

1. **Define your schema** in `src/lib/schemas/defaultSchemas.ts`
2. **Add the section** following the existing schema format
3. **Register context builders** for AI functionality
4. **That's it!** Your new section will automatically support all AI features

The system will automatically handle:
- ✅ Form field generation
- ✅ AI context building  
- ✅ Auto-completion
- ✅ Content improvement
- ✅ Data validation

### Creating New Templates

Want to add a custom resume template? It's easier than you think:

1. **Use our template guide**: Share `docs/ui/how-to-replicate-a-new-template.md` with any LLM assistant
2. **Follow the examples**: Check existing templates in `src/components/resume/templates/`
3. **Submit a PR**: We welcome high-quality template contributions!

Our hybrid rendering model ensures your templates can leverage existing atomic components while maintaining unique styling.

## 📚 Documentation

> **Note**: Documentation is currently in Chinese to optimize token usage during development.

- 📖 **Architecture Guide**: [docs/architecture.md](./docs/architecture.md)
- 🎨 **Template Creation**: [docs/ui/how-to-replicate-a-new-template.md](./docs/ui/how-to-replicate-a-new-template.md)
- 🤖 **AI Integration**: [docs/ai/](./docs/ai/)
- 🏗️ **Component API**: [docs/component-api-reference.md](./docs/component-api-reference.md)

## ⚠️ Current Limitations

### AI Provider Support
Currently supports **Google Gemini only** through environment variable configuration:

- ✅ **Supported**: Gemini via `.env.local` or `.env.production` with pre-configured models
- 🚧 **Coming Soon**: Full multi-provider support (OpenAI, Anthropic, Ollama, etc.) after AI system refactor
- ❌ **Not Available**: UI-based API key configuration or model selection (temporarily disabled due to Genkit lifecycle constraints)
- ❌ **Not Available**: Custom model parameters or fine-tuning options

We're actively working on a comprehensive AI system refactor that will support multiple providers with flexible configuration options and model selection.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **AI**: Google Genkit, Gemini API
- **State**: Zustand with persistence
- **Styling**: CSS Variables, responsive design

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug fixes
- ✨ New features  
- 🎨 New templates
- 📝 Documentation improvements
- 🌍 Translations

Please feel free to open issues and submit pull requests.

## 📄 License

This project is licensed under a **Non-Commercial Use License**. 

- ✅ **Free for personal, educational, and non-commercial use**
- ❌ **Commercial use requires explicit permission**
- 📧 **For commercial licensing, please contact**: [hi@fordj.me](mailto:hi@fordj.me)

See the [LICENSE](LICENSE) file for full details.

## 🙏 Acknowledgments

- Built with [Google Genkit](https://firebase.google.com/docs/genkit) for AI integration
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Ready to build your perfect resume?** [Get started now!](#quick-start) 🚀 