export type Recipe = {
  id: string;
  totalCalory: number;
  ingredients: any[];
  tag: string;
  price: number;
  title: string;
  type: string;
  instructions: string[];
  photo: string;
  healthinessScore: number;
  easinessScore: number;
  whoShared: any;
  saved?: boolean;
  liked?: boolean;
  shared?: boolean;
};

export class RecipeModel {
  private data: Recipe;

  constructor(data: Recipe) {
    this.data = data;
  }

  // Getters
  getId() { return this.data.id; }
  getTotalCalory() { return this.data.totalCalory; }
  getIngredients() { return this.data.ingredients; }
  getTag() { return this.data.tag; }
  getPrice() { return this.data.price; }
  getTitle() { return this.data.title; }
  getType() { return this.data.type; }
  getInstructions() { return this.data.instructions; }
  getPhoto() { return this.data.photo; }
  getHealthinessScore() { return this.data.healthinessScore; }
  getEasinessScore() { return this.data.easinessScore; }
  getWhoShared() { return this.data.whoShared; }
  getSaved() { return this.data.saved || false; }
  getLiked() { return this.data.liked || false; }
  getShared() { return this.data.shared || false; }

  // Setters
  setId(id: string) { this.data.id = id; }
  setTotalCalory(totalCalory: number) { this.data.totalCalory = totalCalory; }
  setIngredients(ingredients: any[]) { this.data.ingredients = ingredients; }
  setTag(tag: string) { this.data.tag = tag; }
  setPrice(price: number) { this.data.price = price; }
  setTitle(title: string) { this.data.title = title; }
  setType(type: string) { this.data.type = type; }
  setInstructions(instructions: string[]) { this.data.instructions = instructions; }
  setPhoto(photo: string) { this.data.photo = photo; }
  setHealthinessScore(score: number) { this.data.healthinessScore = score; }
  setEasinessScore(score: number) { this.data.easinessScore = score; }
  setWhoShared(user: any) { this.data.whoShared = user; }
  setSaved(saved: boolean) { this.data.saved = saved; }
  setLiked(liked: boolean) { this.data.liked = liked; }
  setShared(shared: boolean) { this.data.shared = shared; }
}


