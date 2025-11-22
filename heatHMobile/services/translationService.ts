type RecipeContent = {
  title?: string;
  ingredients?: Array<string | { name: string; amount?: string | number; quantity?: number }>;
  instructions?: string[];
  description?: string;
};

// Simple in-memory cache per session
const cache = new Map<string, RecipeContent>();

function detectSource(text: string): 'en' | 'tr' | 'zh-CN' {
  if (/[一-龯\u3400-\u9FBF\uF900-\uFAFF]/.test(text)) return 'zh-CN';
  if (/[ğüşöçıİĞÜŞÖÇ]/i.test(text)) return 'tr';
  return 'en';
}

async function translateText(text: string, target: 'en' | 'tr' | 'zh'): Promise<string> {
  if (!text) return text;
  const mappedTarget = target === 'zh' ? 'zh-CN' : target;
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
  target: 'en' | 'tr' | 'zh'
): Promise<RecipeContent> {
  const k = `${key}:${target}`;
  if (cache.has(k)) return cache.get(k)!;

  const title = content.title ? await translateText(content.title, target) : undefined;
  const description = content.description ? await translateText(content.description, target) : undefined;

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

  const result = { title, description, ingredients, instructions };
  cache.set(k, result);
  return result;
}


