// src/models/Recipe.js
// Domain model for Recipe matching UML diagram
class Recipe {
  constructor({
    id,
    totalCalory,
    ingredients,
    tag,
    price,
    title,
    type,
    instructions,
    photo,
    healthinessScore,
    easinessScore,
    whoShared,
  }) {
    this.id = id;
    this.totalCalory = totalCalory;
    this.ingredients = ingredients; // Array of AmountedItem objects
    this.tag = tag;
    this.price = price;
    this.title = title;
    this.type = type;
    this.instructions = instructions; // Array of strings
    this.photo = photo; // Base64-encoded string
    this.healthinessScore = healthinessScore;
    this.easinessScore = easinessScore;
    this.whoShared = whoShared; // User object
  }

  // Getters
  getId() { return this.id; }
  getTotalCalory() { return this.totalCalory; }
  getIngredients() { return this.ingredients; }
  getTag() { return this.tag; }
  getPrice() { return this.price; }
  getTitle() { return this.title; }
  getType() { return this.type; }
  getInstructions() { return this.instructions; }
  getPhoto() { return this.photo; }
  getHealthinessScore() { return this.healthinessScore; }
  getEasinessScore() { return this.easinessScore; }
  getWhoShared() { return this.whoShared; }

  // Setters
  setId(id) { this.id = id; }
  setTotalCalory(totalCalory) { this.totalCalory = totalCalory; }
  setIngredients(ingredients) { this.ingredients = ingredients; }
  setTag(tag) { this.tag = tag; }
  setPrice(price) { this.price = price; }
  setTitle(title) { this.title = title; }
  setType(type) { this.type = type; }
  setInstructions(instructions) { this.instructions = instructions; }
  setPhoto(photo) { this.photo = photo; }
  setHealthinessScore(score) { this.healthinessScore = score; }
  setEasinessScore(score) { this.easinessScore = score; }
  setWhoShared(user) { this.whoShared = user; }
}

export default Recipe; 