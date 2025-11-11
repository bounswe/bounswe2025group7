package heatH.heatHBack.service.implementation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.SavedRecipe;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.SavedRecipeRequest;
import heatH.heatHBack.repository.RecipeRepository;
import heatH.heatHBack.repository.SavedRecipeRepository;
import heatH.heatHBack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class SavedRecipeServiceTest {

    @Mock
    private SavedRecipeRepository savedRecipeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RecipeRepository recipeRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private SavedRecipeService savedRecipeService;

    private User testUser;
    private Recipe testRecipe;
    private SavedRecipeRequest savedRecipeRequest;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("test@example.com");

        // Setup test recipe
        testRecipe = new Recipe();
        testRecipe.setId(1L);
        testRecipe.setTitle("Test Recipe");
        testRecipe.setPhoto("test-photo-url");

        // Setup request
        savedRecipeRequest = new SavedRecipeRequest();
        savedRecipeRequest.setRecipeId(1L);

        // Setup SecurityContext
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    @Test
    void testSaveRecipe_Success() {
        // Given
        when(userRepository.findByUsername("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(recipeRepository.findById(1L))
                .thenReturn(Optional.of(testRecipe));
        when(savedRecipeRepository.save(any(SavedRecipe.class)))
                .thenAnswer(invocation -> {
                    SavedRecipe savedRecipe = invocation.getArgument(0);
                    savedRecipe.setId(1L);
                    return savedRecipe;
                });

        // When
        assertDoesNotThrow(() -> savedRecipeService.saveRecipe(savedRecipeRequest));

        // Then
        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(recipeRepository, times(1)).findById(1L);
        verify(savedRecipeRepository, times(1)).save(any(SavedRecipe.class));
    }

    @Test
    void testSaveRecipe_UserNotFound() {
        // Given
        when(userRepository.findByUsername("test@example.com"))
                .thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savedRecipeService.saveRecipe(savedRecipeRequest);
        });

        assertEquals("User not found", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(recipeRepository, never()).findById(any());
        verify(savedRecipeRepository, never()).save(any());
    }

    @Test
    void testSaveRecipe_RecipeNotFound() {
        // Given
        when(userRepository.findByUsername("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(recipeRepository.findById(1L))
                .thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            savedRecipeService.saveRecipe(savedRecipeRequest);
        });

        assertEquals("Recipe not found", exception.getMessage());
        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(recipeRepository, times(1)).findById(1L);
        verify(savedRecipeRepository, never()).save(any());
    }

    @Test
    void testSaveRecipe_SetsCorrectFields() {
        // Given
        when(userRepository.findByUsername("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(recipeRepository.findById(1L))
                .thenReturn(Optional.of(testRecipe));
        when(savedRecipeRepository.save(any(SavedRecipe.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // When
        savedRecipeService.saveRecipe(savedRecipeRequest);

        // Then
        verify(savedRecipeRepository).save(argThat(savedRecipe -> {
            return savedRecipe.getUser().equals(testUser) &&
                   savedRecipe.getRecipe().equals(testRecipe) &&
                   savedRecipe.getTitle().equals("Test Recipe") &&
                   savedRecipe.getPhoto().equals("test-photo-url");
        }));
    }
}

