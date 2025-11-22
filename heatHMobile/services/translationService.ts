type RecipeContent = {
  title?: string;
  tag?: string;
  type?: string;
  ingredients?: Array<string | { name: string; amount?: string | number; quantity?: number }>;
  instructions?: string[];
  description?: string;
};

// Simple in-memory cache per session
const cache = new Map<string, RecipeContent>();

function detectSource(text: string): 'en' | 'tr' | 'ja' {
  if (!text) return 'en';
  // Japanese detection (Hiragana, Katakana, Kanji)
  if (/[ぁ-んァ-ン]/.test(text)) return 'ja';
  if (/[一-龯\u3400-\u9FBF\uF900-\uFAFF]/.test(text)) return 'ja';
  // Turkish detection
  if (/[ğüşöçıİĞÜŞÖÇ]/i.test(text)) return 'tr';
  return 'en';
}

function toApiTarget(targetLang: 'en' | 'tr' | 'ja'): 'en' | 'tr' | 'ja' {
  if (targetLang === 'ja') return 'ja';
  if (targetLang === 'tr') return 'tr';
  return 'en';
}

async function translateText(text: string, target: 'en' | 'tr' | 'ja'): Promise<string> {
  if (!text) return text;
  const mappedTarget = toApiTarget(target);
  const source = detectSource(text);
  // If source and target are the same, no translation needed
  if (source === mappedTarget) {
    return text;
  }
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(source + '|' + mappedTarget)}`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) {
    throw new Error(`Translation failed: ${resp.status}`);
  }
  const data = await resp.json();
  const t = data?.responseData?.translatedText;
  if (typeof t === 'string' && t.length > 0) return t;
  throw new Error('Translation failed');
}

export async function translateRecipeContent(
  key: string,
  content: RecipeContent,
  target: 'en' | 'tr' | 'ja'
): Promise<RecipeContent> {
  const k = `${key}:${target}`;
  if (cache.has(k)) return cache.get(k)!;

  const title = content.title ? await translateText(content.title, target) : undefined;
  const description = content.description ? await translateText(content.description, target) : undefined;
  const tag = content.tag ? await translateText(content.tag, target) : undefined;
  const type = content.type ? await translateText(content.type, target) : undefined;

  const ingredients = content.ingredients
    ? await Promise.all(
        content.ingredients.map(async (ing) => {
          if (typeof ing === 'string') return translateText(ing, target);
          const name = ing.name ? await translateText(ing.name, target) : '';
          return { ...ing, name };
        })
      )
    : undefined;

  const instructions = content.instructions
    ? await Promise.all(content.instructions.map((i) => translateText(i, target)))
    : undefined;

  const result = { title, description, tag, type, ingredients, instructions };
  cache.set(k, result);
  return result;
}

/**
 * Map i18next language codes to the supported translation languages.
 */
export function mapLanguageToRecipeTarget(lng: string): 'en' | 'tr' | 'ja' {
  if (!lng) return 'en';
  if (lng.startsWith('tr')) return 'tr';
  if (lng.startsWith('ja')) return 'ja';
  return 'en';
}

export const SUPPORTED_RECIPE_LANGUAGES = ['en', 'tr', 'ja'] as const;


