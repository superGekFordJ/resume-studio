// Import the new schema types for extended functionality
import type { ExtendedResumeData, DynamicResumeSection, DynamicSectionItem } from './schema';

export interface PersonalDetails {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  avatar?: string; // Base64 encoded image or URL
}

// Main ResumeData type now directly uses ExtendedResumeData
export type ResumeData = ExtendedResumeData;

export const initialPersonalDetails: PersonalDetails = {
  fullName: 'Your Name',
  jobTitle: 'Aspiring Professional',
  email: 'your.email@example.com',
  phone: '(123) 456-7890',
  address: 'Your City, State',
  linkedin: 'linkedin.com/in/yourprofile',
  github: 'github.com/yourusername',
  portfolio: 'yourportfolio.com',
  avatar: 'https://placehold.co/200x283.png',
};

export const initialResumeData: ResumeData = {
  personalDetails: { ...initialPersonalDetails },
  sections: [
    {
      id: 'summary_1',
      schemaId: 'summary',
      title: 'Summary',
      visible: true,
      items: [{
        id: 'summary_content_1',
        schemaId: 'summary',
        data: {
          content: 'A brief summary about your professional background and career aspirations. Highlight your key skills and experiences that make you a strong candidate for the roles you are targeting.'
        }
      }] as DynamicSectionItem[]
    } as DynamicResumeSection,
    {
      id: 'experience_1',
      schemaId: 'experience',
      title: 'Experience',
      visible: true,
      items: [
        {
          id: 'exp_1_1',
          schemaId: 'experience',
          data: {
            jobTitle: 'Software Engineer',
            company: 'Tech Solutions Inc.',
            startDate: 'Jan 2020',
            endDate: 'Present',
            description: 'Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software products meeting client requirements and deadlines.'
          }
        },
        {
          id: 'exp_1_2',
          schemaId: 'experience',
          data: {
            jobTitle: 'Junior Developer',
            company: 'Web Wonders LLC',
            startDate: 'Jun 2018',
            endDate: 'Dec 2019',
            description: 'Assisted senior developers in coding, testing, and debugging software. Gained experience in agile methodologies and version control systems like Git.'
          }
        }
      ] as DynamicSectionItem[]
    } as DynamicResumeSection,
    {
      id: 'education_1',
      schemaId: 'education',
      title: 'Education',
      visible: true,
      items: [{
        id: 'edu_1_1',
        schemaId: 'education',
        data: {
          degree: 'B.S. in Computer Science',
          institution: 'State University',
          graduationYear: '2018',
          details: 'Relevant coursework: Data Structures, Algorithms, Database Management, Web Development. Capstone Project: Developed a full-stack e-commerce platform.'
        }
      }] as DynamicSectionItem[]
    } as DynamicResumeSection,
    {
      id: 'skills_1',
      schemaId: 'skills',
      title: 'Skills',
      visible: true,
      items: [
        { id: 'skill_1_1', schemaId: 'skills', data: { name: 'JavaScript (ES6+)' } },
        { id: 'skill_1_2', schemaId: 'skills', data: { name: 'React & Redux' } },
        { id: 'skill_1_3', schemaId: 'skills', data: { name: 'Node.js & Express' } },
        { id: 'skill_1_4', schemaId: 'skills', data: { name: 'Python' } },
        { id: 'skill_1_5', schemaId: 'skills', data: { name: 'SQL & NoSQL Databases' } },
        { id: 'skill_1_6', schemaId: 'skills', data: { name: 'Git & GitHub' } },
        { id: 'skill_1_7', schemaId: 'skills', data: { name: 'Agile Methodologies' } }
      ] as DynamicSectionItem[]
    } as DynamicResumeSection
  ],
  templateId: 'default',
  schemaVersion: '1.0.0'
};

export interface TemplateInfo {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint: string;
}

export const templates: TemplateInfo[] = [
  { id: 'default', name: 'Classic Professional', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'resume template' },
  { id: 'pro-classic', name: 'Pro Classic (2-Col)', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'professional two column resume' },
  { id: 'modern-minimalist', name: 'Modern Minimalist', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'modern resume' },
  { id: 'creative', name: 'Creative Two-Column', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'creative design' },
  { id: 'continuous-narrative', name: 'Continuous Narrative', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'continuous flow magazine-style' },
  { id: 'parallel-modular', name: 'Parallel Modular', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'parallel functionally-distinct columns' },
];

// Using dynamic imports for Lucide icons to avoid making them server components by default if not necessary.
// However, for simplicity here, directly referencing. Ensure Lucide is client-compatible.
// For server components, you might pass icon names and render them client-side.
// This map is better used in a client component.
export const sectionIconMap: Record<string, string> = {
  personalDetails: 'User',
  summary: 'FileText',
  experience: 'Briefcase',
  education: 'GraduationCap',
  skills: 'Wand2', // Changed from Lightbulb for more "skill" vibe
  customText: 'FilePlus2',
  // Add more as needed for new sections
};

    