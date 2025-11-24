package heatH.heatHBack.service.implementation;

import heatH.heatHBack.model.CalorieTracking;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.response.CalorieResponse;
import heatH.heatHBack.repository.CalorieTrackingRepository;
import heatH.heatHBack.repository.RecipeRepository;
import heatH.heatHBack.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CalorieTrackingServiceTest {

    @Mock
    private CalorieTrackingRepository calorieTrackingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private CalorieTrackingService calorieTrackingService;

    private final Long MOCK_USER_ID = 42L;
    private final String MOCK_USER_EMAIL = "test@example.com";
    private final Date MOCK_DATE = new Date();
    private final User MOCK_USER = new User();

    @BeforeEach
    void setupSecurityContext() {
        // Setup MOCK_USER using setters
        MOCK_USER.setId(MOCK_USER_ID);
        MOCK_USER.setUsername(MOCK_USER_EMAIL);

        // Setup the security context
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
        when(authentication.getName()).thenReturn(MOCK_USER_EMAIL);
        when(userRepository.findByUsername(MOCK_USER_EMAIL)).thenReturn(Optional.of(MOCK_USER));
    }

    // --- toggleCalorieTracking Tests ---

    @Test
    void toggleCalorieTracking_ShouldDeleteExistingTracking() {
        // Arrange
        Long recipeIdLong = 10L;
        String recipeIdString = "10";
        Double portion = 0.5;

        CalorieTracking existingTracking = new CalorieTracking();
        existingTracking.setUserId(MOCK_USER_ID);
        existingTracking.setRecipeId(recipeIdLong);

        when(calorieTrackingRepository.findByUserIdAndRecipeIdAndEatenDateIgnoringTime(
                eq(MOCK_USER_ID), eq(recipeIdLong), eq(MOCK_DATE)))
                .thenReturn(Optional.of(existingTracking));

        // Act
        calorieTrackingService.toggleCalorieTracking(recipeIdString, MOCK_DATE, portion);

        // Assert
        verify(calorieTrackingRepository, times(1)).delete(eq(existingTracking));
        verify(calorieTrackingRepository, never()).save(any(CalorieTracking.class));
    }

    @Test
    void toggleCalorieTracking_ShouldCreateNewTracking() {
        // Arrange
        Long recipeIdLong = 20L;
        String recipeIdString = "20";
        Double portion = 1.5;

        when(calorieTrackingRepository.findByUserIdAndRecipeIdAndEatenDateIgnoringTime(
                eq(MOCK_USER_ID), eq(recipeIdLong), eq(MOCK_DATE)))
                .thenReturn(Optional.empty());

        // Act
        calorieTrackingService.toggleCalorieTracking(recipeIdString, MOCK_DATE, portion);

        // Assert
        // Verify that the saved object has the correct fields set
        verify(calorieTrackingRepository, times(1)).save(argThat(tracking ->
                tracking.getUserId().equals(MOCK_USER_ID) &&
                        tracking.getRecipeId().equals(recipeIdLong) &&
                        tracking.getPortion().equals(portion)
        ));
        verify(calorieTrackingRepository, never()).delete(any(CalorieTracking.class));
    }

    @Test
    void toggleCalorieTracking_ShouldThrowException_WhenUserNotFound() {
        // Arrange
        when(userRepository.findByUsername(MOCK_USER_EMAIL)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class,
                () -> calorieTrackingService.toggleCalorieTracking("1", MOCK_DATE, 1.0),
                "User not found");

        verify(calorieTrackingRepository, never()).findByUserIdAndRecipeIdAndEatenDateIgnoringTime(any(), any(), any());
    }

    // --- getUserCalorieTracking Tests ---

    @Test
    void getUserCalorieTracking_ShouldReturnMappedResponses() {
        // Arrange
        Long recipeId1 = 100L;
        Long recipeId2 = 200L;

        // Mock Calorie Tracking Records
        CalorieTracking ct1 = new CalorieTracking();
        ct1.setRecipeId(recipeId1); ct1.setPortion(1.0);
        CalorieTracking ct2 = new CalorieTracking();
        ct2.setRecipeId(recipeId2); ct2.setPortion(0.5);

        when(calorieTrackingRepository.findAllByUserIdAndEatenDateIgnoringTime(MOCK_USER_ID, MOCK_DATE))
                .thenReturn(List.of(ct1, ct2));

        // Mock Recipe Data using setters
        Recipe recipe1 = new Recipe();
        recipe1.setId(recipeId1);
        recipe1.setTotalCalorie(500);
        recipe1.setTitle("Spaghetti");
        recipe1.setPhoto("spag.jpg");

        Recipe recipe2 = new Recipe();
        recipe2.setId(recipeId2);
        recipe2.setTotalCalorie(300);
        recipe2.setTitle("Salad");
        recipe2.setPhoto("salad.jpg");


        when(recipeRepository.findById(recipeId1)).thenReturn(Optional.of(recipe1));
        when(recipeRepository.findById(recipeId2)).thenReturn(Optional.of(recipe2));

        // Act
        List<CalorieResponse> result = calorieTrackingService.getUserCalorieTracking(MOCK_DATE);

        // Assert
        assertEquals(2, result.size());

        // Check first response (1.0 portion of 500 cal = 500 cal)
        assertEquals(recipeId1.intValue(), result.get(0).getRecipeId());
        assertEquals(500, result.get(0).getCalorie());
        assertEquals("Spaghetti", result.get(0).getName());

        // Check second response (0.5 portion of 300 cal = 150 cal)
        assertEquals(recipeId2.intValue(), result.get(1).getRecipeId());
        assertEquals(150, result.get(1).getCalorie());
    }

    @Test
    void getUserCalorieTracking_ShouldFilterOutMissingRecipes() {
        // Arrange
        Long recipeId1 = 100L;
        Long recipeIdMissing = 999L;

        CalorieTracking ct1 = new CalorieTracking();
        ct1.setRecipeId(recipeId1); ct1.setPortion(1.0);
        CalorieTracking ctMissing = new CalorieTracking();
        ctMissing.setRecipeId(recipeIdMissing); ctMissing.setPortion(1.0);

        when(calorieTrackingRepository.findAllByUserIdAndEatenDateIgnoringTime(MOCK_USER_ID, MOCK_DATE))
                .thenReturn(List.of(ct1, ctMissing));

        // Mock Recipe Data using setters
        Recipe recipe1 = new Recipe();
        recipe1.setId(recipeId1);
        recipe1.setTotalCalorie(500);
        recipe1.setTitle("Spaghetti");
        recipe1.setPhoto("spag.jpg");

        when(recipeRepository.findById(recipeId1)).thenReturn(Optional.of(recipe1));
        when(recipeRepository.findById(recipeIdMissing)).thenReturn(Optional.empty()); // Mock missing recipe

        // Act
        List<CalorieResponse> result = calorieTrackingService.getUserCalorieTracking(MOCK_DATE);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Spaghetti", result.get(0).getName()); // Only the found recipe remains
    }

    @Test
    void getUserCalorieTracking_ShouldHandleEmptyTrackingList() {
        // Arrange
        when(calorieTrackingRepository.findAllByUserIdAndEatenDateIgnoringTime(MOCK_USER_ID, MOCK_DATE))
                .thenReturn(Collections.emptyList());

        // Act
        List<CalorieResponse> result = calorieTrackingService.getUserCalorieTracking(MOCK_DATE);

        // Assert
        assertTrue(result.isEmpty());
        verify(recipeRepository, never()).findById(any()); // No recipe lookups should occur
    }
}