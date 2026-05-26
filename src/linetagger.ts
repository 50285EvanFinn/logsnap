/**
 * linetagger.ts
 * Attaches arbitrary string tags to log lines for downstream filtering or grouping.
 */

export interface TaggerConfig {
  tags: string[];
  separator: string;
  prefix: string;
}

export interface TaggedLine {
  original: string;
  tags: string[];
  rendered: string;
}

export function buildTaggerConfig(
  tags: string[],
  separator = ",",
  prefix = "[tag:"
): TaggerConfig {
  if (tags.some((t) => t.trim() === "")) {
    throw new Error("Tags must not be empty strings");
  }
  return { tags: tags.map((t) => t.trim()), separator, prefix };
}

export function tagLine(line: string, config: TaggerConfig): TaggedLine {
  const tagStr = config.tags
    .map((t) => `${config.prefix}${t}]`)
    .join(config.separator);
  const rendered = `${tagStr} ${line}`;
  return { original: line, tags: config.tags, rendered };
}

export function tagLines(lines: string[], config: TaggerConfig): TaggedLine[] {
  return lines.map((l) => tagLine(l, config));
}

export function hasTag(tagged: TaggedLine, tag: string): boolean {
  return tagged.tags.includes(tag);
}

export function filterByTag(tagged: TaggedLine[], tag: string): TaggedLine[] {
  return tagged.filter((t) => hasTag(t, tag));
}

export function stripTags(tagged: TaggedLine): string {
  return tagged.original;
}

export function formatTagged(tagged: TaggedLine[]): string[] {
  return tagged.map((t) => t.rendered);
}
