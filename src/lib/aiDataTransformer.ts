import type { ResumeData } from '@/types/resume';
import type { DynamicResumeSection, DynamicSectionItem } from '@/types/schema';
import type { AIGeneratedResumeData } from '@/ai/flows/generateResumeFromContext';

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function convertAiOutputToResumeData(aiJson: AIGeneratedResumeData): ResumeData {
  
  // 1. Summary Section (Dynamic)
  const summarySection: DynamicResumeSection = {
    id: generateId('summary'),
    schemaId: 'summary',
    title: 'Professional Summary',
    visible: true,
    items: [{
      id: generateId('summary-item'),
      schemaId: 'summary',
      data: { content: aiJson.summary },
    }],
  };
  
  // 2. Experience Section (Dynamic)
  const experienceSection: DynamicResumeSection = {
    id: generateId('experience'),
    schemaId: 'experience',
    title: 'Work Experience',
    visible: true,
    items: aiJson.experience.map(exp => ({
      id: generateId('exp-item'),
      schemaId: 'experience',
      data: exp,
    } as DynamicSectionItem)),
  };
    
  // 3. Education Section (Dynamic)
  const educationSection: DynamicResumeSection = {
    id: generateId('education'),
    schemaId: 'education',
    title: 'Education',
    visible: true,
    items: aiJson.education.map(edu => ({
      id: generateId('edu-item'),
      schemaId: 'education',
      data: edu,
    } as DynamicSectionItem)),
  };

  // 4. Skills Sections (grouped by category into dynamic sections)
  const skillsByCategory: Record<string, { name: string }[]> = aiJson.skills.reduce((acc, skill) => {
    const category = skill.category || 'Skills';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ name: skill.name });
    return acc;
  }, {} as Record<string, { name: string }[]>);

  const skillSections: DynamicResumeSection[] = Object.entries(skillsByCategory).map(([category, skills]) => ({
    id: generateId('skills'),
    schemaId: 'skills', // All grouped skills will use the basic 'skills' schema
    title: category,
      visible: true,
    items: skills.map(skill => ({
      id: generateId('skill-item'),
      schemaId: 'skills',
      data: skill, // data is { name: 'skill name' }
    } as DynamicSectionItem)),
  }));

  const finalResumeData: ResumeData = {
    personalDetails: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      avatar: '',
    },
    sections: [
      summarySection,
      experienceSection,
      educationSection,
      ...skillSections,
    ],
    templateId: 'default', // Default template
    schemaVersion: '2.0.0', // Mark as modern schema
  };

  return finalResumeData;
} 