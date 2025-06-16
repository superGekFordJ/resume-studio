import type { LucideIcon } from 'lucide-react';
// Import the new schema types for extended functionality
import type { ExtendedResumeData } from './schema';

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

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string; // Can be 'Present'
  description: string;
}

export interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
  details?: string;
}

export interface SkillEntry {
  id: string;
  name: string;
}

export interface CustomTextEntry {
  id: string;
  content: string;
}

export type SectionType =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'customText';

// Using a discriminated union for section items for type safety
export type SectionItem = ExperienceEntry | EducationEntry | SkillEntry | CustomTextEntry;

export interface ResumeSection {
  id: string; // Unique ID for this section instance in the resume
  title: string;
  type: SectionType;
  visible: boolean;
  items: SectionItem[]; // Ensures items match the section type
  isList: boolean; // true for experience, education, skills; false for summary, customText with single item
  // content?: string; // For single-content sections like summary
}

// Legacy resume data structure (for backward compatibility)
export interface LegacyResumeData {
  personalDetails: PersonalDetails;
  sections: ResumeSection[];
  templateId: string; // e.g., 'classic', 'modern'
}

// Main ResumeData type that supports both legacy and extended formats
export type ResumeData = LegacyResumeData | ExtendedResumeData;

// Type guard to check if resume data is using the new extended format
export function isExtendedResumeData(data: ResumeData): data is ExtendedResumeData {
  return 'schemaVersion' in data;
}

// Type guard to check if resume data is using the legacy format
export function isLegacyResumeData(data: ResumeData): data is LegacyResumeData {
  return !('schemaVersion' in data);
}

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
      title: 'Summary',
      type: 'summary',
      visible: true,
      isList: false,
      items: [{ id: 'summary_content_1', content: 'A brief summary about your professional background and career aspirations. Highlight your key skills and experiences that make you a strong candidate for the roles you are targeting.' } as CustomTextEntry],
    },
    {
      id: 'experience_1',
      title: 'Experience',
      type: 'experience',
      visible: true,
      isList: true,
      items: [
        { id: 'exp_1_1', jobTitle: 'Software Engineer', company: 'Tech Solutions Inc.', startDate: 'Jan 2020', endDate: 'Present', description: 'Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software products meeting client requirements and deadlines.' },
        { id: 'exp_1_2', jobTitle: 'Junior Developer', company: 'Web Wonders LLC', startDate: 'Jun 2018', endDate: 'Dec 2019', description: 'Assisted senior developers in coding, testing, and debugging software. Gained experience in agile methodologies and version control systems like Git.' },
      ] as ExperienceEntry[],
    },
    {
      id: 'education_1',
      title: 'Education',
      type: 'education',
      visible: true,
      isList: true,
      items: [
        { id: 'edu_1_1', degree: 'B.S. in Computer Science', institution: 'State University', graduationYear: '2018', details: 'Relevant coursework: Data Structures, Algorithms, Database Management, Web Development. Capstone Project: Developed a full-stack e-commerce platform.' },
      ] as EducationEntry[],
    },
    {
      id: 'skills_1',
      title: 'Skills',
      type: 'skills',
      visible: true,
      isList: true,
      items: [
        { id: 'skill_1_1', name: 'JavaScript (ES6+)' },
        { id: 'skill_1_2', name: 'React & Redux' },
        { id: 'skill_1_3', name: 'Node.js & Express' },
        { id: 'skill_1_4', name: 'Python' },
        { id: 'skill_1_5', name: 'SQL & NoSQL Databases' },
        { id: 'skill_1_6', name: 'Git & GitHub' },
        { id: 'skill_1_7', name: 'Agile Methodologies' },
      ] as SkillEntry[],
    },
  ],
  templateId: 'default',
};

export interface TemplateInfo {
  id: string;
  name: string;
  imageUrl: string;
  dataAiHint: string;
}

export const templates: TemplateInfo[] = [
  { id: 'default', name: 'Classic Professional', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'resume template' },
  { id: 'modern-minimalist', name: 'Modern Minimalist', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'modern resume' },
  { id: 'creative', name: 'Creative Impact', imageUrl: 'https://placehold.co/200x283.png', dataAiHint: 'creative design' },
];

// Using dynamic imports for Lucide icons to avoid making them server components by default if not necessary.
// However, for simplicity here, directly referencing. Ensure Lucide is client-compatible.
// For server components, you might pass icon names and render them client-side.
// This map is better used in a client component.
export const sectionIconMap: Record<SectionType | 'personalDetails', string> = {
  personalDetails: 'User',
  summary: 'FileText',
  experience: 'Briefcase',
  education: 'GraduationCap',
  skills: 'Wand2', // Changed from Lightbulb for more "skill" vibe
  customText: 'FilePlus2',
};

    