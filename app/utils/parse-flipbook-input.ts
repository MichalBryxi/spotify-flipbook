import type { ParsedEntry } from 'spotify-flipbook/types/flipbook';

export function parseFlipbookInput(input: string): ParsedEntry[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [url = '', ...customTextParts] = line.split(',');

      return {
        url: url.trim(),
        customText: customTextParts.join(',').trim(),
      };
    });
}
