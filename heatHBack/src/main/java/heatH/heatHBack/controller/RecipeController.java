package heatH.heatHBack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.model.response.RecipeResponse;
import heatH.heatHBack.service.implementation.RecipeService;
import lombok.RequiredArgsConstructor;

@Controller
@RestController
@RequestMapping("/api/recipe")
@RequiredArgsConstructor
public class RecipeController {
    private final RecipeService recipeService;

    @PostMapping
    public ResponseEntity<RecipeResponse> createRecipe(@RequestBody RecipeRequest request) {
        recipeService.saveRecipe(request);
        return ResponseEntity.ok(new RecipeResponse("OK"));
    }
    
    @GetMapping
    public ResponseEntity<?> getRecipeDetails(@RequestParam Long recipeId) {
        return recipeService.getRecipeById(recipeId)
                .<ResponseEntity<?>>map(recipe -> ResponseEntity.ok(recipe))
                .orElse(ResponseEntity
                        .status(404)
                        .body(new RecipeResponse("ERROR")));
    }
}
