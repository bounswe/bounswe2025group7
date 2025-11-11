import { Platform } from 'react-native';
import { config } from '@/constants/config';

type RecipeContent = {
  title?: string;
  ingredients?: Array<string | { name: string; amount?: string | number; quantity?: number }>;
  instructions?: string[];
  description?: string;
};

// Very small in-memory cache to avoid repeated translations during a session
const cache = new Map<string, RecipeContent>();

// Try multiple public LibreTranslate instances to improve reliability
const ENDPOINTS = [
  'https://libretranslate.com/translate',
  'https://libretranslate.de/translate',
  'https://translate.astian.org/translate',
];

function withCorsProxy(url: string): string {
  // When running on web, some public instances may block CORS. Use allorigins as a simple proxy.
  // Note: Only for development; prefer a backend proxy in production.
  if (Platform.OS === 'web' && config.hasCorsRestrictions) {
    return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
  }
  return url;
}

async function postJson(url: string, body: any, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(withCorsProxy(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!resp.ok) {
      // Some proxies return 200 with error JSON; still try to parse for details
      const text = await resp.text().catch(() => '');
      throw new Error(`Translate failed: ${resp.status} ${text}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(t);
  }
}

async function translateText(text: string, target: 'en' | 'tr' | 'zh'): Promise<string> {
  if (!text) return text;
  const payload = {
    q: text,
    source: 'auto',
    target,
    format: 'text',
  };

  // Try each endpoint until one succeeds
  let lastError: any = null;
  for (const ep of ENDPOINTS) {
    try {
      const data = await postJson(ep, payload);
      const translated = data?.translatedText ?? data?.translation ?? null;
      if (translated && typeof translated === 'string') {
        return translated;
      }
      // Some instances can return arrays or different field names; fallback
      if (Array.isArray(data) && typeof data[0] === 'string') {
        return data[0];
      }
      // If shape unexpected, continue to next endpoint
      lastError = new Error('Unexpected translate response shape');
    } catch (e) {
      lastError = e;
      // try next endpoint
    }
  }

  // Fallback: MyMemory API (generous free tier, CORS-friendly)
  try {
    const mapped = target === 'zh' ? 'zh-CN' : target;
    const detectSource = (t: string): 'en' | 'tr' | 'zh-CN' => {
      // Rough detection: Chinese character range
      if (/[一-龯\u3400-\u9FBF\uF900-\uFAFF]/.test(t)) return 'zh-CN';
      // Turkish-specific letters
      if (/[ğüşöçıİĞÜŞÖÇ]/i.test(t)) return 'tr';
      return 'en';
    };
    const source = detectSource(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source + '|' + mapped)}`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) {
      throw new Error(`MyMemory failed: ${resp.status}`);
    }
    const data = await resp.json();
    const mmText = data?.responseData?.translatedText;
    if (typeof mmText === 'string' && mmText.length > 0) {
      return mmText;
    }
  } catch (e) {
    lastError = e;
  }

  // If none succeeded, throw last error
  throw (lastError ?? new Error('Translation failed'));
}

export async function translateRecipeContent(
  key: string, // recipe id or unique key
  content: RecipeContent,
  target: 'en' | 'tr' | 'zh'
): Promise<RecipeContent> {
  const cacheKey = `${key}:${target}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const title = content.title ? await translateText(content.title, target) : undefined;
  const description = content.description ? await translateText(content.description, target) : undefined;

  const ingredients = content.ingredients
    ? await Promise.all(
        content.ingredients.map(async (ing) => {
          if (typeof ing === 'string') {
            return await translateText(ing, target);
          }
          const base = ing.name ? await translateText(ing.name, target) : '';
          return { ...ing, name: base };
        })
      )
    : undefined;

  const instructions = content.instructions
    ? await Promise.all(content.instructions.map((i) => translateText(i, target)))
    : undefined;

  const translated = { title, description, ingredients, instructions };
  cache.set(cacheKey, translated);
  return translated;
}


