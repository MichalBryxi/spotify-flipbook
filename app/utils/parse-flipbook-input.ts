import type { ParsedEntry } from 'spotify-flipbook/types/flipbook';

export function parseFlipbookInput(input: string): ParsedEntry[] {
  return input
    .split('\n')
    .map((line, index) => ({
      line,
      lineNumber: index + 1,
    }))
    .filter(({ line }) => line.trim().length > 0)
    .map(({ line, lineNumber }) => {
      const [url = '', ...customTextParts] = line.trim().split(',');

      return {
        lineNumber,
        rawLine: line,
        excerpt: line.trim(),
        url: url.trim(),
        customText: customTextParts.join(',').trim(),
      };
    });
}
