import type {
  RenderableItem,
  RenderableField,
  FieldRole,
  RoleMap,
} from '@/types/schema';

// Legacy field name mappings for backward compatibility
const LEGACY_FIELD_MAPPINGS: Record<FieldRole, string[]> = {
  title: ['jobTitle', 'position', 'role', 'degree', 'name'],
  organization: ['company', 'employer', 'institution', 'school'],
  description: [
    'description',
    'summary',
    'details',
    'content',
    'accomplishments',
  ],
  startDate: ['startDate', 'from', 'start'],
  endDate: ['endDate', 'to', 'end'],
  location: ['location', 'address', 'city'],
  dateRange: ['dateRange', 'period', 'duration'],
  url: ['url', 'link', 'website', 'portfolio'],
  skills: ['skills', 'technologies', 'tools', 'languages'],
  level: ['level', 'proficiency', 'graduationYear'],
  identifier: ['identifier', 'credentialId', 'certificateId'],
  other: [],
};

/**
 * Pick a field from an item by its semantic role
 * @param item The renderable item containing fields
 * @param role The semantic role to search for
 * @param roleMap Optional role map for the schema
 * @returns The field matching the role, or undefined
 */
export function pickFieldByRole(
  item: RenderableItem,
  role: FieldRole,
  roleMap?: RoleMap
): RenderableField | undefined {
  if (!item.fields || item.fields.length === 0) {
    return undefined;
  }

  // First, try to use the role map if available
  if (roleMap) {
    for (const field of item.fields) {
      const mappedRole = roleMap.fieldMappings[field.key];
      if (mappedRole) {
        // Check if the mapped role matches (handle both single and multiple roles)
        if (Array.isArray(mappedRole)) {
          if (mappedRole.includes(role)) {
            return field;
          }
        } else if (mappedRole === role) {
          return field;
        }
      }
    }
  }

  // Fallback to legacy heuristics
  const legacyFieldNames = LEGACY_FIELD_MAPPINGS[role] || [];
  for (const field of item.fields) {
    if (legacyFieldNames.includes(field.key)) {
      return field;
    }
  }

  // If still not found and role is 'other', return the first unmatched field
  if (role === 'other') {
    const matchedRoles = new Set<string>();

    // Collect all fields that have been matched to other roles
    if (roleMap) {
      for (const [fieldKey, mappedRole] of Object.entries(
        roleMap.fieldMappings
      )) {
        if (mappedRole !== 'other') {
          matchedRoles.add(fieldKey);
        }
      }
    }

    // Also mark legacy fields
    for (const [, fieldNames] of Object.entries(LEGACY_FIELD_MAPPINGS)) {
      fieldNames.forEach((name) => matchedRoles.add(name));
    }

    // Return first unmatched field
    return item.fields.find((field) => !matchedRoles.has(field.key));
  }

  return undefined;
}

/**
 * Pick multiple fields by role (useful for roles that might map to multiple fields)
 * @param item The renderable item containing fields
 * @param role The semantic role to search for
 * @param roleMap Optional role map for the schema
 * @returns Array of fields matching the role
 */
export function pickFieldsByRole(
  item: RenderableItem,
  role: FieldRole,
  roleMap?: RoleMap
): RenderableField[] {
  const fields: RenderableField[] = [];

  if (!item.fields || item.fields.length === 0) {
    return fields;
  }

  // First, use the role map if available
  if (roleMap) {
    for (const field of item.fields) {
      const mappedRole = roleMap.fieldMappings[field.key];
      if (mappedRole) {
        if (Array.isArray(mappedRole)) {
          if (mappedRole.includes(role)) {
            fields.push(field);
          }
        } else if (mappedRole === role) {
          fields.push(field);
        }
      }
    }
  }

  // If no fields found via role map, fallback to legacy
  if (fields.length === 0) {
    const legacyFieldNames = LEGACY_FIELD_MAPPINGS[role] || [];
    for (const field of item.fields) {
      if (legacyFieldNames.includes(field.key)) {
        fields.push(field);
      }
    }
  }

  return fields;
}

/**
 * Get the primary title field from an item
 * This is a convenience function for the most common use case
 */
export function getItemTitle(item: RenderableItem, roleMap?: RoleMap): string {
  const titleField = pickFieldByRole(item, 'title', roleMap);
  return titleField?.value?.toString() || '';
}

/**
 * Get the organization/company field from an item
 */
export function getItemOrganization(
  item: RenderableItem,
  roleMap?: RoleMap
): string {
  const orgField = pickFieldByRole(item, 'organization', roleMap);
  return orgField?.value?.toString() || '';
}

/**
 * Get the date range for an item (either as a combined field or start/end)
 */
export function getItemDateRange(
  item: RenderableItem,
  roleMap?: RoleMap
): string {
  // First try to find a combined date range field
  const dateRangeField = pickFieldByRole(item, 'dateRange', roleMap);
  if (dateRangeField?.value) {
    return dateRangeField.value.toString();
  }

  // Otherwise, combine start and end dates
  const startField = pickFieldByRole(item, 'startDate', roleMap);
  const endField = pickFieldByRole(item, 'endDate', roleMap);

  if (startField?.value || endField?.value) {
    const start = startField?.value?.toString() || '';
    const end = endField?.value?.toString() || '';

    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `${start} - Present`;
    } else if (end) {
      return end;
    }
  }

  return '';
}
