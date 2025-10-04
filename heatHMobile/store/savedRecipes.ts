export type SavedRecipe = { id: string; title: string };

let saved: SavedRecipe[] = [];

export function getSavedRecipes() {
  return saved;
}

export function addSavedRecipe(item: SavedRecipe) {
  saved = [...saved, item];
}

export function removeSavedRecipe(id: string) {
  saved = saved.filter((r) => r.id !== id);
}


