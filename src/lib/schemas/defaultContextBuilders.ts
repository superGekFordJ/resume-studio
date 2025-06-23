import type { ISchemaRegistry } from '@/types/schema';

/**
 * Registers all the default AI context builders with the schema registry.
 * @param registry The schema registry instance.
 */
export function registerDefaultContextBuilders(registry: ISchemaRegistry) {
  // Summary builders
  registry.registerContextBuilder('summary-content', (data, allData) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data.content === 'string') return data.content;
    return '';
  });
  
  registry.registerContextBuilder('summary-section', (section, allData) => {
    const content = section.items?.[0]?.data?.content || section.items?.[0]?.content || '';
    return `## Summary\n${content}`;
  });

  // Experience builders
  registry.registerContextBuilder('job-title', (data, allData) => {
    return `Job Title: ${data.jobTitle || 'Untitled Job'}`;
  });

  registry.registerContextBuilder('company-name', (data, allData) => {
    return `Company: ${data.company || 'Unnamed Company'}`;
  });

  registry.registerContextBuilder('job-description', (data, allData) => {
    return `Job: ${data.jobTitle || 'Untitled Job'} at ${data.company || 'Unnamed Company'}\nDescription: ${data.description || ''}`;
  });

  registry.registerContextBuilder('experience-item', (data, allData) => {
    return `- ${data.jobTitle || 'Untitled Job'} at ${data.company || 'Unnamed Company'}: ${data.description || ''}`;
  });

  registry.registerContextBuilder('experience-summary', (section, allData) => {
    const itemsSummary = section.items?.map((item: any) => registry.buildContext('experience-item', item.data || item, allData)).join('\n') || '';
    return `## Experience\n${itemsSummary}`;
  });

  // Education builders
  registry.registerContextBuilder('degree-name', (data, allData) => {
    return `Degree: ${data.degree || 'Untitled Degree'}`;
  });

  registry.registerContextBuilder('institution-name', (data, allData) => {
    return `Institution: ${data.institution || 'Unnamed Institution'}`;
  });

  registry.registerContextBuilder('education-details', (data, allData) => {
    return `Education: ${data.degree || 'Untitled Degree'} from ${data.institution || 'Unnamed Institution'}\nDetails: ${data.details || ''}`;
  });

  registry.registerContextBuilder('education-item', (data, allData) => {
    return `- ${data.degree || 'Untitled Degree'} from ${data.institution || 'Unnamed Institution'}`;
  });

  registry.registerContextBuilder('education-summary', (section, allData) => {
    const itemsSummary = section.items?.map((item: any) => registry.buildContext('education-item', item.data || item, allData)).join('\n') || '';
    return `## Education\n${itemsSummary}`;
  });

  // Skills builders
  registry.registerContextBuilder('skill-name', (data, allData) => {
    return `Skill: ${data.name || 'Unnamed Skill'}`;
  });

  registry.registerContextBuilder('skill-item', (data, allData) => {
    return `${data.name || 'Unnamed Skill'}`;
  });

  registry.registerContextBuilder('skills-summary', (section, allData) => {
    const skills = section.items?.map((item: any) => item.data?.name || item.name || 'Unnamed Skill').join(', ') || '';
    return `## Skills\n${skills}`;
  });

  // Custom content builders
  registry.registerContextBuilder('custom-content', (data, allData) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data.content === 'string') return data.content;
    return '';
  });

  registry.registerContextBuilder('custom-summary', (section, allData) => {
    const content = section.items?.[0]?.data?.content || section.items?.[0]?.content || '';
    return `## ${section.title || 'Custom Section'}\n${content}`;
  });

  // Advanced Skills context builders
  registry.registerContextBuilder('skill-category', (data, allData) => {
    const skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
    return `Skill Category: ${data.category}, Skills: ${skills}`;
  });

  registry.registerContextBuilder('skill-list', (data, allData) => {
    return Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
  });

  registry.registerContextBuilder('skill-proficiency', (data, allData) => {
    return `Proficiency: ${data.proficiency || 'Not specified'}`;
  });

  registry.registerContextBuilder('skill-experience', (data, allData) => {
    return `Years of Experience: ${data.yearsOfExperience || 'Not specified'}`;
  });

  registry.registerContextBuilder('advanced-skills-summary', (section, allData) => {
    const categories = section.items?.map((item: any) => 
      `${item.data?.category || item.category}: ${Array.isArray(item.data?.skills || item.skills) ? (item.data?.skills || item.skills).join(', ') : (item.data?.skills || item.skills) || ''}`
    ).join('; ') || '';
    return `## Advanced Skills\n${categories}`;
  });

  registry.registerContextBuilder('advanced-skills-item', (data, allData) => {
    const skills = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills || '';
    const proficiency = data.proficiency ? ` (${data.proficiency})` : '';
    return `${data.category}: ${skills}${proficiency}`;
  });

  // Projects context builders
  registry.registerContextBuilder('project-name', (data, allData) => {
    return `Project: ${data.name || 'Untitled Project'}`;
  });

  registry.registerContextBuilder('project-description', (data, allData) => {
    const tech = Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
    return `Project: ${data.name}, Technologies: ${tech}\nDescription: ${data.description || ''}`;
  });

  registry.registerContextBuilder('project-technologies', (data, allData) => {
    return Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
  });

  registry.registerContextBuilder('projects-summary', (section, allData) => {
    const projects = section.items?.map((item: any) => {
      const itemData = item.data || item;
      return `${itemData.name}: ${itemData.description || ''}`;
    }).join('; ') || '';
    return `## Projects\n${projects}`;
  });

  registry.registerContextBuilder('projects-item', (data, allData) => {
    const tech = Array.isArray(data.technologies) ? data.technologies.join(', ') : data.technologies || '';
    return `Project: ${data.name}, Tech: ${tech}`;
  });
  
  // Certifications context builders (for test schema)
  registry.registerContextBuilder('certification-name', (data, allData) => {
    return `Certification: ${data.name || 'Unnamed Certification'}`;
  });
  
  registry.registerContextBuilder('certification-issuer', (data, allData) => {
    return `Issuer: ${data.issuer || 'Unknown Issuer'}`;
  });
  
  registry.registerContextBuilder('certification-description', (data, allData) => {
    return `Certification: ${data.name} from ${data.issuer}\nDescription: ${data.description || ''}`;
  });
  
  registry.registerContextBuilder('certifications-summary', (section, allData) => {
    const certs = section.items?.map((item: any) => {
      const itemData = item.data || item;
      return `${itemData.name} (${itemData.issuer})`;
    }).join(', ') || '';
    return `## Certifications\n${certs}`;
  });
  
  registry.registerContextBuilder('certifications-item', (data, allData) => {
    return `${data.name} from ${data.issuer}${data.date ? ` (${data.date})` : ''}`;
  });
} 