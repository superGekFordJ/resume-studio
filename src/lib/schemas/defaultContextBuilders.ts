import { DynamicResumeSection, ISchemaRegistry } from '@/types/schema';
import { SchemaRegistry } from '../schemaRegistry'; // Import to access the token

const renderField = (
  value: unknown,
  defaultValue: string | number | null = 'N/A'
): string => {
  if (value === SchemaRegistry.CURRENTLY_EDITING_TOKEN) {
    return '[*currently being modified*]';
  }
  if (Array.isArray(value)) {
    const joined = value.join(', ');
    if (joined) {
      return joined;
    }
  } else if (value) {
    return String(value);
  }

  return String(defaultValue ?? ''); // Use nullish coalescing and ensure string
};

/**
 * Registers all the default AI context builders with the schema registry.
 * @param registry The schema registry instance.
 */
export function registerDefaultContextBuilders(registry: ISchemaRegistry) {
  // Summary builders
  registry.registerContextBuilder('summary-content', (data) => {
    if (!data) return '';
    if (typeof data === 'string')
      return renderField(`Summary content: ${data}`, '');
    const itemData = data as Record<string, unknown>;
    return renderField(`Summary content: ${itemData.content}`, '');
  });

  registry.registerContextBuilder('summary-section', (data) => {
    const section = data as DynamicResumeSection;
    const itemData = section.items?.[0]?.data;
    const content = itemData?.content || '';
    return `## Summary\n${renderField(content, '')}`;
  });

  // Experience builders
  registry.registerContextBuilder('job-title', (d) => {
    const itemData = d as { jobTitle?: string };
    return `Job Title: ${renderField(itemData.jobTitle, 'Untitled Job')}`;
  });

  registry.registerContextBuilder('company-name', (d) => {
    const itemData = d as { company?: string };
    return `Company: ${renderField(itemData.company, 'Unnamed Company')}`;
  });

  registry.registerContextBuilder('job-description', (d) => {
    const itemData = d as {
      jobTitle?: string;
      company?: string;
      description?: string;
    };
    return `jobTitle: ${renderField(itemData.jobTitle, 'Untitled Job')}\ncompany: ${renderField(itemData.company, 'Unnamed Company')}\ndescription: ${renderField(itemData.description, '')}`;
  });

  registry.registerContextBuilder('experience-item', (d) => {
    const itemData = d as {
      jobTitle?: string;
      company?: string;
      description?: string;
    };
    return `jobTitle: ${renderField(itemData.jobTitle, 'Untitled Job')}\ncompany: ${renderField(itemData.company, 'Unnamed Company')}\ndescription: ${renderField(itemData.description, '')}`;
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
        .join('\n---\n') || '';
    return `## Experience\n${itemsSummary}`;
  });

  // Education builders
  registry.registerContextBuilder('degree-name', (data) => {
    const itemData = data as { degree?: string };
    return `Degree: ${renderField(itemData.degree, 'Untitled Degree')}`;
  });

  registry.registerContextBuilder('institution-name', (data) => {
    const itemData = data as { institution?: string };
    return `Institution: ${renderField(itemData.institution, 'Unnamed Institution')}`;
  });

  registry.registerContextBuilder('education-details', (data) => {
    const itemData = data as {
      degree?: string;
      institution?: string;
      details?: string;
    };
    return `degree: ${renderField(itemData.degree, 'Untitled Degree')}\ninstitution: ${renderField(itemData.institution, 'Unnamed Institution')}\ndetails: ${renderField(itemData.details, '')}`;
  });

  registry.registerContextBuilder('education-item', (data) => {
    const itemData = data as {
      degree?: string;
      institution?: string;
      details?: string;
    };
    return `degree: ${renderField(itemData.degree, 'Untitled Degree')} | institution: ${renderField(itemData.institution, 'Unnamed Institution')}\ndetails: ${renderField(itemData.details, '')}`;
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
        .join('\n---\n') || '';
    return `## Education\n${itemsSummary}`;
  });

  // Skills builders
  registry.registerContextBuilder('skill-name', (data) => {
    const itemData = data as { name?: string };
    return `Skill: ${renderField(itemData.name, 'Unnamed Skill')}`;
  });

  registry.registerContextBuilder('skill-item', (data) => {
    const itemData = data as { name?: string };
    return renderField(itemData.name, 'Unnamed Skill');
  });

  registry.registerContextBuilder('skills-summary', (data) => {
    const section = data as DynamicResumeSection;
    const skills =
      section.items
        ?.map((item) => renderField(item.data.name, 'Unnamed Skill'))
        .join(', ') || '';
    return `## Skills\n${skills}`;
  });

  // Custom content builders
  registry.registerContextBuilder('custom-content', (data) => {
    if (!data) return '';
    if (typeof data === 'string')
      return renderField('userCustomContent:' + data, '');
    const itemData = data as Record<string, unknown>;
    return renderField('userCustomContent:' + itemData.content, '');
  });

  registry.registerContextBuilder('custom-summary', (data) => {
    const section = data as DynamicResumeSection;
    const content = section.items?.[0]?.data?.content || '';
    return `## ${section.title || 'Custom Section'}\n${renderField(content, '')}`;
  });

  // Advanced Skills context builders
  registry.registerContextBuilder('skill-category', (data) => {
    const itemData = data as Record<string, unknown>;
    return `category: ${renderField(itemData.category, 'Uncategorized')}`;
  });

  registry.registerContextBuilder('skill-list', (data) => {
    const itemData = data as { skills?: string[] | string };
    return `skills: ${renderField(itemData.skills, '')}`;
  });

  registry.registerContextBuilder('skill-proficiency', (data) => {
    const itemData = data as { proficiency?: string };
    return `proficiency: ${renderField(itemData.proficiency, 'Not specified')}`;
  });

  registry.registerContextBuilder('skill-experience', (data) => {
    const itemData = data as { yearsOfExperience?: string | number };
    return `yearsOfExperience: ${renderField(itemData.yearsOfExperience, 'Not specified')}`;
  });

  registry.registerContextBuilder(
    'advanced-skills-summary',
    (data, allData) => {
      const section = data as DynamicResumeSection;
      const categories =
        section.items
          ?.map((item) =>
            registry.buildContext('advanced-skills-item', item.data, allData)
          )
          .join('; ') || '';
      return `## Advanced Skills\n${categories}`;
    }
  );

  registry.registerContextBuilder('advanced-skills-item', (data) => {
    const itemData = data as {
      category?: string;
      skills?: string[] | string;
      proficiency?: string;
    };
    const proficiency = itemData.proficiency
      ? ` (${renderField(itemData.proficiency)})`
      : '';
    return `${renderField(itemData.category, 'Uncategorized')}: ${renderField(itemData.skills, '')}${proficiency}`;
  });

  // Projects context builders
  registry.registerContextBuilder('project-name', (data) => {
    const itemData = data as {
      name?: string;
      technologies?: string[] | string;
    };
    return `**Project Name**: ${renderField(itemData.name, 'Untitled Project')} | technologies: ${renderField(itemData.technologies, 'Non-provided')}`;
  });

  registry.registerContextBuilder('project-description', (data) => {
    const itemData = data as Record<string, unknown>;
    return `name: ${renderField(itemData.name, 'Untitled Project')}\ntechnologies: ${renderField(itemData.technologies, '')}\n**Description**: ${renderField(itemData.description, '')}`;
  });

  registry.registerContextBuilder('project-technologies', (data) => {
    const itemData = data as { technologies?: string[] | string };
    return `technologies: ${renderField(itemData.technologies, 'Non-provided')}`;
  });

  registry.registerContextBuilder('projects-summary', (data, allData) => {
    const section = data as DynamicResumeSection;
    const projects =
      section.items
        ?.map((item) =>
          registry.buildContext('projects-item', item.data, allData)
        )
        .join('\n---\n') || '';
    return `## Projects\n${projects}`;
  });

  registry.registerContextBuilder('projects-item', (data) => {
    const itemData = data as {
      name?: string;
      technologies?: string[] | string;
      description?: string;
    };
    return `name: ${renderField(itemData.name, 'Untitled Project')}|technologies: ${renderField(itemData.technologies)}\ndescription: ${renderField(itemData.description, '')}`;
  });

  // Certifications context builders (for test schema)
  registry.registerContextBuilder('certification-name', (data) => {
    const itemData = data as { name?: string };
    return `Certification Name: ${renderField(itemData.name, 'Unnamed Certification')}`;
  });

  registry.registerContextBuilder('certification-issuer', (data) => {
    const itemData = data as { issuer?: string };
    return `Issuer: ${renderField(itemData.issuer, 'Unknown Issuer')}`;
  });

  registry.registerContextBuilder('certification-description', (data) => {
    const itemData = data as {
      name?: string;
      issuer?: string;
      description?: string;
    };
    return `name: ${renderField(itemData.name, 'Unnamed Certification')}\nissuer: ${renderField(itemData.issuer, 'Unknown Issuer')}\ndescription: ${renderField(itemData.description, '')}`;
  });

  registry.registerContextBuilder('certifications-summary', (data, allData) => {
    const section = data as DynamicResumeSection;
    const certs =
      section.items
        ?.map((item) =>
          registry.buildContext('certifications-item', item.data, allData)
        )
        .join('\n---\n') || '';
    return `## Certifications\n${certs}`;
  });

  registry.registerContextBuilder('certifications-item', (data) => {
    const itemData = data as {
      name?: string;
      issuer?: string;
      date?: string;
    };
    return `name: ${renderField(itemData.name, 'Unnamed')}\nissuer: ${renderField(itemData.issuer, 'N/A')}\ndate: ${renderField(itemData.date, 'N/A')}`;
  });

  // Volunteer Experience builders
  registry.registerContextBuilder('volunteer-position', (d) => {
    const itemData = d as { position?: string };
    return `Position: ${renderField(itemData.position, 'Untitled Position')}`;
  });
  registry.registerContextBuilder('volunteer-org', (d) => {
    const itemData = d as { organization?: string };
    return `Organization: ${renderField(itemData.organization, 'Unnamed Org')}`;
  });
  registry.registerContextBuilder('volunteer-impact', (d) => {
    const itemData = d as {
      position?: string;
      organization?: string;
      impact?: string;
    };
    return `position: ${renderField(itemData.position)}\norganization: ${renderField(itemData.organization)}\nimpact: ${renderField(itemData.impact, '')}`;
  });
  registry.registerContextBuilder('volunteer-item', (d) => {
    const itemData = d as {
      position?: string;
      organization?: string;
      impact?: string;
    };
    return `position: ${renderField(itemData.position)}\norganization: ${renderField(itemData.organization)}\nimpact: ${renderField(itemData.impact, '')}`;
  });
  registry.registerContextBuilder('volunteer-summary', (data, allData) => {
    const section = data as DynamicResumeSection;
    const itemsSummary =
      section.items
        ?.map((item) =>
          registry.buildContext('volunteer-item', item.data, allData)
        )
        .join('\n---\n') || '';
    return `## ${section.title || 'Volunteer Experience'}\n${itemsSummary}`;
  });
}
