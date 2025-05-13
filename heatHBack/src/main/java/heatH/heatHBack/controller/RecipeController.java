package heatH.heatHBack.controller;

import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.DeleteRecipeRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.model.response.RecipeResponse;
import heatH.heatHBack.service.implementation.RecipeService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@Controller
@RestController
@RequestMapping("/api/recipe")
@RequiredArgsConstructor
public class RecipeController {
    private final RecipeService recipeService;

    @PostMapping("/create")
    public ResponseEntity<RecipeResponse> createRecipe(@RequestBody RecipeRequest request) {
        recipeService.saveRecipe(request);
        return ResponseEntity.ok(new RecipeResponse("OK"));
    }
    
    @GetMapping("/get")
    public ResponseEntity<?> getRecipeDetails(@RequestParam Long recipeId) {
        return recipeService.getRecipeById(recipeId)
                .<ResponseEntity<?>>map(recipe -> ResponseEntity.ok(recipe))
                .orElse(ResponseEntity
                        .status(404)
                        .body(new RecipeResponse("ERROR")));
    }

    @GetMapping("/get-all")
    public ResponseEntity<List<Recipe>> getAllRecipes() {
        return recipeService.getAllRecipes()
                .<ResponseEntity<List<Recipe>>>map(recipes -> ResponseEntity.ok(recipes))
                .orElse(ResponseEntity
                        .status(404)
                        .body(null));
    }

    @DeleteMapping("/delete-recipe")
    public ResponseEntity<String> deleteRecipe(@RequestBody DeleteRecipeRequest deleteRecipeRequest){
         recipeService.deleteRecipeById(deleteRecipeRequest.getId());
         return  ResponseEntity.ok("Recipe deleted.");
    }
}
