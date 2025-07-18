import { DynamicResumeSection, ISchemaRegistry } from '@/types/schema';

/**
 * Registers all the default AI context builders with the schema registry.
 * @param registry The schema registry instance.
 */
export function registerDefaultContextBuilders(registry: ISchemaRegistry) {
  // Summary builders
  registry.registerContextBuilder('summary-content', (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    const itemData = data as Record<string, unknown>;
    if (typeof itemData.content === 'string') return itemData.content;
    return '';
  });

  registry.registerContextBuilder('summary-section', (data) => {
    const section = data as DynamicResumeSection;
    const itemData = section.items?.[0]?.data;
    const content = itemData?.content || '';
    return `## Summary\n${content}`;
  });

  // Experience builders
  registry.registerContextBuilder('job-title', (d) => {
    const itemData = d as { jobTitle?: string };
    return `Job Title: ${itemData.jobTitle || 'Untitled Job'}`;
  });

  registry.registerContextBuilder('company-name', (d) => {
    const itemData = d as { company?: string };
    return `Company: ${itemData.company || 'Unnamed Company'}`;
  });

  registry.registerContextBuilder('job-description', (d) => {
    const itemData = d as {
      jobTitle?: string;
      company?: string;
      description?: string;
    };
    return `Job: ${itemData.jobTitle || 'Untitled Job'}\nCompany: ${itemData.company || 'Unnamed Company'}\nDescription: ${itemData.description || ''}`;
  });

  registry.registerContextBuilder('experience-item', (d) => {
    const itemData = d as {
      jobTitle?: string;
      company?: string;
      description?: string;
    };
    return `Job: ${itemData.jobTitle || 'Untitled Job'}\nCompany: ${itemData.company || 'Unnamed Company'}\nDescription: ${itemData.description || ''}`;
  });

  registry.registerContextBuilder('experience-summary', (data, allData) => {
    const section = data as {
      items: {
        data: { jobTitle?: string; company?: string; description?: string };
      }[];
    };
    const itemsSummary =
      section.items
        ?.map((item) =>
          registry.buildContext('experience-item', item.data, allData)
        )
        .join('\n') || '';
    return `## Experience\n${itemsSummary}`;
  });

  // Education builders
  registry.registerContextBuilder('degree-name', (data) => {
    const itemData = data as { degree?: string };
    return `Degree: ${itemData.degree || 'Untitled Degree'}`;
  });

  registry.registerContextBuilder('institution-name', (data) => {
    const itemData = data as { institution?: string };
    return `Institution: ${itemData.institution || 'Unnamed Institution'}`;
  });

  registry.registerContextBuilder('education-details', (data) => {
    const itemData = data as {
      degree?: string;
      institution?: string;
      details?: string;
    };
    return `Education:\n**Degree:** ${itemData.degree || 'Untitled Degree'}\n**Institution:** ${itemData.institution || 'Unnamed Institution'}\n**Details:** ${itemData.details || ''}`;
  });

  registry.registerContextBuilder('education-item', (data) => {
    const itemData = data as { degree?: string; institution?: string };
    return `**Degree:** ${itemData.degree || 'Untitled Degree'}\n**Institution:** ${itemData.institution || 'Unnamed Institution'}`;
  });

  registry.registerContextBuilder('education-summary', (data, allData) => {
    const section = data as {
      items: { data: { degree?: string; institution?: string } }[];
    };
    const itemsSummary =
      section.items
        ?.map((item) =>
          registry.buildContext('education-item', item.data, allData)
        )
        .join('\n') || '';
    return `## Education\n${itemsSummary}`;
  });

  // Skills builders
  registry.registerContextBuilder('skill-name', (data) => {
    const itemData = data as { name?: string };
    return `Skill: ${itemData.name || 'Unnamed Skill'}`;
  });

  registry.registerContextBuilder('skill-item', (data) => {
    const itemData = data as { name?: string };
    return `${itemData.name || 'Unnamed Skill'}`;
  });

  registry.registerContextBuilder('skills-summary', (data) => {
    const section = data as DynamicResumeSection;
    const skills =
      section.items
        ?.map((item) => item.data.name || 'Unnamed Skill')
        .join(', ') || '';
    return `## Skills\n${skills}`;
  });

  // Custom content builders
  registry.registerContextBuilder('custom-content', (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data;
    const itemData = data as Record<string, unknown>;
    if (typeof itemData.content === 'string') return itemData.content;
    return '';
  });

  registry.registerContextBuilder('custom-summary', (data) => {
    const section = data as DynamicResumeSection;
    const content = section.items?.[0]?.data?.content || '';
    return `## ${section.title || 'Custom Section'}\n${content}`;
  });

  // Advanced Skills context builders
  registry.registerContextBuilder('skill-category', (data) => {
    const itemData = data as Record<string, unknown>;
    const skills = Array.isArray(itemData.skills)
      ? itemData.skills.join(', ')
      : itemData.skills || '';
    return `Skill Category: ${itemData.category}, Skills: ${skills}`;
  });

  registry.registerContextBuilder('skill-list', (data) => {
    const itemData = data as { skills?: string[] | string };
    return Array.isArray(itemData.skills)
      ? itemData.skills.join(', ')
      : itemData.skills || '';
  });

  registry.registerContextBuilder('skill-proficiency', (data) => {
    const itemData = data as { proficiency?: string };
    return `Proficiency: ${itemData.proficiency || 'Not specified'}`;
  });

  registry.registerContextBuilder('skill-experience', (data) => {
    const itemData = data as { yearsOfExperience?: string | number };
    return `Years of Experience: ${itemData.yearsOfExperience || 'Not specified'}`;
  });

  registry.registerContextBuilder('advanced-skills-summary', (data) => {
    const section = data as DynamicResumeSection;
    const categories =
      section.items
        ?.map((item) => {
          const itemData = item.data;
          return `${itemData.category}: ${Array.isArray(itemData.skills) ? itemData.skills.join(', ') : itemData.skills || ''}`;
        })
        .join('; ') || '';
    return `## Advanced Skills\n${categories}`;
  });

  registry.registerContextBuilder('advanced-skills-item', (data) => {
    const itemData = data as {
      category?: string;
      skills?: string[] | string;
      proficiency?: string;
    };
    const skills = Array.isArray(itemData.skills)
      ? itemData.skills.join(', ')
      : itemData.skills || '';
    const proficiency = itemData.proficiency
      ? ` (${itemData.proficiency})`
      : '';
    return `${itemData.category}: ${skills}${proficiency}`;
  });

  // Projects context builders
  registry.registerContextBuilder('project-name', (data) => {
    const itemData = data as Record<string, unknown>;
    return `Project: ${itemData.name || 'Untitled Project'}`;
  });

  registry.registerContextBuilder('project-description', (data) => {
    const itemData = data as Record<string, unknown>;
    const tech = Array.isArray(itemData.technologies)
      ? itemData.technologies.join(', ')
      : itemData.technologies || '';
    return `Project: ${itemData.name}, Technologies: ${tech}\nDescription: ${itemData.description || ''}`;
  });

  registry.registerContextBuilder('project-technologies', (data) => {
    const itemData = data as { technologies?: string[] | string };
    return Array.isArray(itemData.technologies)
      ? itemData.technologies.join(', ')
      : itemData.technologies || '';
  });

  registry.registerContextBuilder('projects-summary', (data) => {
    const section = data as DynamicResumeSection;
    const projects =
      section.items
        ?.map((item) => {
          const itemData = item.data;
          return `${itemData.name}: ${itemData.description || ''}`;
        })
        .join('; ') || '';
    return `## Projects\n${projects}`;
  });

  registry.registerContextBuilder('projects-item', (data) => {
    const itemData = data as {
      name?: string;
      technologies?: string[] | string;
    };
    const tech = Array.isArray(itemData.technologies)
      ? itemData.technologies.join(', ')
      : itemData.technologies || '';
    return `Project: ${itemData.name}, Tech: ${tech}`;
  });

  // Certifications context builders (for test schema)
  registry.registerContextBuilder('certification-name', (data) => {
    const itemData = data as { name?: string };
    return `Certification: ${itemData.name || 'Unnamed Certification'}`;
  });

  registry.registerContextBuilder('certification-issuer', (data) => {
    const itemData = data as { issuer?: string };
    return `Issuer: ${itemData.issuer || 'Unknown Issuer'}`;
  });

  registry.registerContextBuilder('certification-description', (data) => {
    const itemData = data as {
      name?: string;
      issuer?: string;
      description?: string;
    };
    return `Certification: ${itemData.name} from ${itemData.issuer}\nDescription: ${itemData.description || ''}`;
  });

  registry.registerContextBuilder('certifications-summary', (data) => {
    const section = data as DynamicResumeSection;
    const certs =
      section.items
        ?.map((item) => {
          const itemData = item.data;
          return `${itemData.name} (${itemData.issuer})`;
        })
        .join(', ') || '';
    return `## Certifications\n${certs}`;
  });

  registry.registerContextBuilder('certifications-item', (data) => {
    const itemData = data as {
      name?: string;
      issuer?: string;
      date?: string;
    };
    return `${itemData.name} from ${itemData.issuer}${itemData.date ? ` (${itemData.date})` : ''}`;
  });
}
