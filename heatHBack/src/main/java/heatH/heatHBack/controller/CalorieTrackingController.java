package heatH.heatHBack.controller;

import heatH.heatHBack.model.response.CalorieResponse;
import heatH.heatHBack.service.implementation.CalorieTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/calorie")
@RequiredArgsConstructor
public class CalorieTrackingController {

    private final CalorieTrackingService calorieTrackingService;

    @GetMapping("/get-user-tracking")
    public ResponseEntity<List<CalorieResponse>> getUserCalorie(@RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date checkDate) {
        List<CalorieResponse> trackingList = calorieTrackingService.getUserCalorieTracking(checkDate);
        return ResponseEntity.ok(trackingList);
    }

    @PostMapping("/toggle-calorie-tracking")
    public ResponseEntity<String> toggleCalorieTracking(@RequestParam String recipeId, @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date eatenDate, @RequestParam Double portion) {
        calorieTrackingService.toggleCalorieTracking(recipeId, eatenDate, portion);
        return ResponseEntity.ok("Calorie tracking status toggled successfully.");
    }

    @PutMapping("/update-calorie-tracking")
    public ResponseEntity<String> updateCalorieTracking(@RequestParam String recipeId, @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date eatenDate, @RequestParam Double portion) {
        calorieTrackingService.updateCalorieTracking(recipeId, eatenDate, portion);
        return ResponseEntity.ok("Calorie tracking status updated successfully.");
    }
}