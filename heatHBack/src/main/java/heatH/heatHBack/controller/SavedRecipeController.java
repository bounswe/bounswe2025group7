package heatH.heatHBack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import heatH.heatHBack.model.SavedRecipe;
import heatH.heatHBack.model.request.SavedRecipeRequest;
import heatH.heatHBack.model.response.SavedRecipeResponse;
import heatH.heatHBack.service.implementation.SavedRecipeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/saved-recipes")
@RequiredArgsConstructor
public class SavedRecipeController {
    private final SavedRecipeService savedRecipeService;

    @PostMapping("/save")
    public ResponseEntity<String> saveRecipe(@RequestBody SavedRecipeRequest request) {
        savedRecipeService.saveRecipe(request);
        return ResponseEntity.ok("Recipe saved");
    }

    @PostMapping("/unsave")
    public ResponseEntity<String> unsaveRecipe(@RequestBody SavedRecipeRequest request) {
        savedRecipeService.unsaveRecipe(request);
        return ResponseEntity.ok("Recipe unsaved");
    }

    @GetMapping("/get")
    public List<SavedRecipeResponse> getSavedRecipes() {
        return savedRecipeService.getSavedRecipesForCurrentUser();
    }

}
