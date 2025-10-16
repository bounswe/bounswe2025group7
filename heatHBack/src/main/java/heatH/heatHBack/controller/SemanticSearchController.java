package heatH.heatHBack.controller;

import heatH.heatHBack.service.implementation.SemanticSearchService;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.SemanticSearchRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SemanticSearchController {
    private final SemanticSearchService semanticSearchService;
    @PostMapping
    public ResponseEntity<List<Recipe>> search(@RequestBody SemanticSearchRequest request) {
        List<Recipe> results = semanticSearchService.search(request.getQuery(), request.getTopK());
        
        return ResponseEntity.ok(results);
    }
    
}
