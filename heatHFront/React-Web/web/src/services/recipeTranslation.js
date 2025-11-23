/**
 * Utility helpers for translating recipe content via the MyMemory API.
 * Provides small in-memory caching to avoid re-translating the same recipe
 * when the user toggles between languages in a single session.
 */

const cache = new Map();

/**
 * Detect the likely source language using a handful of unicode ranges.
 * @param {string} text
 * @returns {'en' | 'tr' | 'ja'}
 */
export function detectSource(text) {
  if (!text) {
    return 'en';
  }
  if (/[ぁ-んァ-ン]/.test(text)) return 'ja';
  if (/[一-龯\u3400-\u9FBF\uF900-\uFAFF]/.test(text)) return 'ja';
  if (/[ğüşöçıİĞÜŞÖÇ]/i.test(text)) return 'tr';
  return 'en';
}

/**
 * Transliterate API target short codes to what the API expects.
 * @param {string} targetLang
 * @returns {'en' | 'tr' | 'ja'}
 */
function toApiTarget(targetLang) {
  if (targetLang === 'ja' || targetLang === 'ja-JP') return 'ja';
  if (targetLang === 'tr') return 'tr';
  return 'en';
}

/**
 * Translate generic text snippets using MyMemory.
 * @param {string} text
 * @param {'en' | 'tr' | 'ja'} target
 * @returns {Promise<string>}
 */
export async function translateText(text, target) {
  if (!text) return text;
  const mappedTarget = toApiTarget(target);
  const source = detectSource(text);
  if (source === mappedTarget) {
    return text;
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${encodeURIComponent(`${source}|${mappedTarget}`)}`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) {
    throw new Error(`Translation failed: ${resp.status}`);
  }

  const data = await resp.json();
  const translated = data?.responseData?.translatedText;
  if (typeof translated === 'string' && translated.length > 0) {
    return translated;
  }
  throw new Error('Translation failed');
}

/**
 * @typedef {Object} RecipeIngredient
 * @property {string} [name]
 * @property {string | number} [amount]
 * @property {number} [quantity]
 *
 * @typedef {Object} RecipeContent
 * @property {string} [title]
  * @property {string} [tag]
  * @property {string} [type]
  * @property {Array<string | RecipeIngredient>} [ingredients]
  * @property {string[]} [instructions]
  * @property {string} [description]
 */

/**
 * Translate recipe content and cache the result for the active session.
 * @param {string} key unique recipe identifier (e.g. recipe-<id>)
 * @param {RecipeContent} content
 * @param {'en' | 'tr' | 'ja'} target
 * @returns {Promise<RecipeContent>}
 */
export async function translateRecipeContent(key, content, target) {
  const cacheKey = `${key}:${target}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const ingredients = content.ingredients
    ? await Promise.all(
        content.ingredients.map(async (ingredient) => {
          if (typeof ingredient === 'string') {
            return translateText(ingredient, target);
          }
          const name = ingredient.name
            ? await translateText(ingredient.name, target)
            : '';
          return { ...ingredient, name };
        })
      )
    : undefined;

  const instructions = content.instructions
    ? await Promise.all(content.instructions.map((step) => translateText(step, target)))
    : undefined;

  const tag = content.tag ? await translateText(content.tag, target) : undefined;
  const type = content.type ? await translateText(content.type, target) : undefined;

  const result = {
    title: content.title ? await translateText(content.title, target) : undefined,
    description: content.description ? await translateText(content.description, target) : undefined,
    tag,
    type,
    ingredients,
    instructions,
  };

  cache.set(cacheKey, result);
  return result;
}

/**
 * Helper to clear cached entries (useful for tests).
 * @param {string} [keyPrefix]
 */
export function clearRecipeTranslationCache(keyPrefix) {
  if (!keyPrefix) {
    cache.clear();
    return;
  }
  Array.from(cache.keys()).forEach((key) => {
    if (key.startsWith(keyPrefix)) {
      cache.delete(key);
    }
  });
}

/**
 * Map i18next language codes to the supported translation languages.
 * @param {string} lng
 * @returns {'en' | 'tr' | 'ja'}
 */
export function mapLanguageToRecipeTarget(lng) {
  if (!lng) return 'en';
  if (lng.startsWith('tr')) return 'tr';
  if (lng.startsWith('ja')) return 'ja';
  return 'en';
}

export const SUPPORTED_RECIPE_LANGUAGES = ['en', 'tr', 'ja'];
