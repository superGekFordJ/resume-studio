// src/lib/markdownTextTransforms.ts
// Pure text transforms for markdown formatting. No framework or editor deps.

const TRAILING_PUNCTUATION_RE = /[)\]\}.,;:!?'"%，。；：！？、）】」』％]+$/u;

function splitWhitespace(text: string) {
  const leading = text.match(/^\s*/)?.[0] ?? '';
  const trailing = text.match(/\s*$/)?.[0] ?? '';
  const core = text.slice(leading.length, text.length - trailing.length);
  return { leading, core, trailing };
}

export function toggleWrap(text: string, wrapper: string): string {
  const { leading, core, trailing } = splitWhitespace(text);

  if (
    core.startsWith(wrapper) &&
    core.endsWith(wrapper) &&
    core.length >= 2 * wrapper.length
  ) {
    const inner = core.slice(wrapper.length, core.length - wrapper.length);
    return leading + inner + trailing;
  }

  // Move trailing punctuation out of the wrapper
  const punctMatch = core.match(TRAILING_PUNCTUATION_RE);
  const punct = punctMatch ? punctMatch[0] : '';
  const inner = punct ? core.slice(0, core.length - punct.length) : core;

  return leading + wrapper + inner + wrapper + punct + trailing;
}

export function toggleLink(
  text: string,
  promptFn: () => string | null = () =>
    typeof window !== 'undefined'
      ? window.prompt('Enter URL', 'https://')
      : null
): string | void {
  const { leading, core, trailing } = splitWhitespace(text);

  const linkRe = /^\[([^\]]+)\]\(([^)]+)\)$/;
  const match = core.match(linkRe);
  if (match) {
    // unwrap to label
    return leading + match[1] + trailing;
  }

  const url = promptFn()?.trim();
  if (!url) return; // cancelled

  const label = core || 'link';
  return leading + `[${label}](${url})` + trailing;
}

export function toggleBulletedList(text: string): string {
  const lines = text.split(/\r?\n/);

  type Kind = 'bullet' | 'number' | 'plain';
  function parseLine(l: string): {
    indent: string;
    content: string;
    kind: Kind;
    blank: boolean;
  } {
    if (l.trim().length === 0)
      return { indent: '', content: '', kind: 'plain', blank: true };
    const indent = l.match(/^(\s*)/)?.[1] ?? '';
    const rest = l.slice(indent.length);
    if (/^\-\s+/.test(rest))
      return {
        indent,
        content: rest.replace(/^\-\s+/, ''),
        kind: 'bullet',
        blank: false,
      };
    if (/^\d+[.)]\s+/.test(rest))
      return {
        indent,
        content: rest.replace(/^\d+[.)]\s+/, ''),
        kind: 'number',
        blank: false,
      };
    return { indent, content: rest, kind: 'plain', blank: false };
  }

  const parsed = lines.map(parseLine);
  const contentLines = parsed.filter((p) => !p.blank);
  const allBulleted =
    contentLines.length > 0 && contentLines.every((p) => p.kind === 'bullet');

  return parsed
    .map((p, i) => {
      if (p.blank) return lines[i];
      if (allBulleted) return `${p.indent}${p.content}`; // remove bullets
      // set to bullets (convert numbers and plain)
      return `${p.indent}- ${p.content}`;
    })
    .join('\n');
}

export function toggleNumberedList(text: string): string {
  const lines = text.split(/\r?\n/);

  type Kind = 'bullet' | 'number' | 'plain';
  function parseLine(l: string): {
    indent: string;
    content: string;
    kind: Kind;
    blank: boolean;
  } {
    if (l.trim().length === 0)
      return { indent: '', content: '', kind: 'plain', blank: true };
    const indent = l.match(/^(\s*)/)?.[1] ?? '';
    const rest = l.slice(indent.length);
    if (/^\-\s+/.test(rest))
      return {
        indent,
        content: rest.replace(/^\-\s+/, ''),
        kind: 'bullet',
        blank: false,
      };
    if (/^\d+[.)]\s+/.test(rest))
      return {
        indent,
        content: rest.replace(/^\d+[.)]\s+/, ''),
        kind: 'number',
        blank: false,
      };
    return { indent, content: rest, kind: 'plain', blank: false };
  }

  const parsed = lines.map(parseLine);
  const contentLines = parsed.filter((p) => !p.blank);
  const allNumbered =
    contentLines.length > 0 && contentLines.every((p) => p.kind === 'number');

  if (allNumbered) {
    return parsed
      .map((p, i) => (p.blank ? lines[i] : `${p.indent}${p.content}`))
      .join('\n');
  }

  let n = 1;
  return parsed
    .map((p, i) => {
      if (p.blank) return lines[i];
      return `${p.indent}${n++}. ${p.content}`;
    })
    .join('\n');
}
