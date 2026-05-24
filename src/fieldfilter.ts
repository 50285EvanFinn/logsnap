/**
 * fieldfilter.ts
 * Filters log lines based on extracted field values.
 */

import { extractFields, ExtractedFields } from './fieldextractor';

export type FieldCondition =
  | { op: 'eq'; key: string; value: string | number | boolean | null }
  | { op: 'neq'; key: string; value: string | number | boolean | null }
  | { op: 'contains'; key: string; value: string }
  | { op: 'exists'; key: string }
  | { op: 'gt'; key: string; value: number }
  | { op: 'lt'; key: string; value: number };

export function evaluateCondition(
  fields: ExtractedFields,
  condition: FieldCondition
): boolean {
  const fieldValue = fields[condition.key];
  switch (condition.op) {
    case 'eq':
      return fieldValue === condition.value;
    case 'neq':
      return fieldValue !== condition.value;
    case 'contains':
      return typeof fieldValue === 'string' &&
        fieldValue.includes(condition.value);
    case 'exists':
      return Object.prototype.hasOwnProperty.call(fields, condition.key);
    case 'gt':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
    case 'lt':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
    default:
      return false;
  }
}

export function buildFieldFilter(
  conditions: FieldCondition[],
  mode: 'all' | 'any' = 'all'
): (line: string) => boolean {
  return (line: string): boolean => {
    const fields = extractFields(line);
    if (mode === 'all') {
      return conditions.every(c => evaluateCondition(fields, c));
    }
    return conditions.some(c => evaluateCondition(fields, c));
  };
}

export function filterLinesByField(
  lines: string[],
  conditions: FieldCondition[],
  mode: 'all' | 'any' = 'all'
): string[] {
  const predicate = buildFieldFilter(conditions, mode);
  return lines.filter(predicate);
}
