/**
 * Translate MCP — wraps LibreTranslate API (https://libretranslate.com/)
 *
 * Tools:
 * - translate: Translate text from one language to another
 * - detect_language: Detect the language of a text string
 * - list_languages: List all supported language codes and names
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://libretranslate.com';

// --- Raw API types ---

type RawTranslateResponse = {
  translatedText: string;
};

type RawDetectEntry = {
  language: string;
  confidence: number;
};

type RawLanguage = {
  code: string;
  name: string;
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'translate',
    description:
      'Translate text from a source language to a target language. Returns the translated text.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'The text to translate' },
        source: {
          type: 'string',
          description: 'Source language code (e.g. "en" for English, "es" for Spanish)',
        },
        target: {
          type: 'string',
          description: 'Target language code (e.g. "es" for Spanish, "fr" for French)',
        },
      },
      required: ['text', 'source', 'target'],
    },
  },
  {
    name: 'detect_language',
    description:
      'Detect the language of a text string. Returns an array of detected languages with confidence scores.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'The text whose language should be detected' },
      },
      required: ['text'],
    },
  },
  {
    name: 'list_languages',
    description:
      'List all languages supported by the translation API. Returns language codes and names.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'translate':
      return translate(args.text as string, args.source as string, args.target as string);
    case 'detect_language':
      return detectLanguage(args.text as string);
    case 'list_languages':
      return listLanguages();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function translate(text: string, source: string, target: string) {
  const res = await fetch(`${BASE_URL}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, source, target }),
  });
  if (!res.ok) throw new Error(`LibreTranslate error: ${res.status}`);

  const data = (await res.json()) as RawTranslateResponse;
  return {
    source,
    target,
    original_text: text,
    translated_text: data.translatedText,
  };
}

async function detectLanguage(text: string) {
  const res = await fetch(`${BASE_URL}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text }),
  });
  if (!res.ok) throw new Error(`LibreTranslate error: ${res.status}`);

  const data = (await res.json()) as RawDetectEntry[];
  return {
    text,
    detections: data.map((entry) => ({
      language: entry.language,
      confidence: entry.confidence,
    })),
  };
}

async function listLanguages() {
  const res = await fetch(`${BASE_URL}/languages`);
  if (!res.ok) throw new Error(`LibreTranslate error: ${res.status}`);

  const data = (await res.json()) as RawLanguage[];
  return {
    total: data.length,
    languages: data.map((lang) => ({
      code: lang.code,
      name: lang.name,
    })),
  };
}

export default { tools, callTool } satisfies McpToolExport;
