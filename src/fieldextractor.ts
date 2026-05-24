/**
 * fieldextractor.ts
 * Extracts named fields from structured log lines (JSON or key=value).
 */

export interface ExtractedFields {
  [key: string]: string | number | boolean | null;
}

export function extractFieldsFromJson(line: string): ExtractedFields | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as ExtractedFields;
    }
    return null;
  } catch {
    return null;
  }
}

export function extractFieldsFromKV(line: string): ExtractedFields {
  const fields: ExtractedFields = {};
  const pattern = /(\w+)=("[^"]*"|'[^']*'|\S+)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line)) !== null) {
    const key = match[1];
    let value: string = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    const num = Number(value);
    if (!isNaN(num) && value !== '') {
      fields[key] = num;
    } else if (value === 'true') {
      fields[key] = true;
    } else if (value === 'false') {
      fields[key] = false;
    } else if (value === 'null') {
      fields[key] = null;
    } else {
      fields[key] = value;
    }
  }
  return fields;
}

export function extractFields(line: string): ExtractedFields {
  const jsonFields = extractFieldsFromJson(line);
  if (jsonFields !== null) return jsonFields;
  return extractFieldsFromKV(line);
}

export function pickFields(
  fields: ExtractedFields,
  keys: string[]
): ExtractedFields {
  const result: ExtractedFields = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      result[key] = fields[key];
    }
  }
  return result;
}

export function formatFields(fields: ExtractedFields): string {
  return Object.entries(fields)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' ');
}
