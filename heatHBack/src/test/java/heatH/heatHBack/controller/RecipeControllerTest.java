package heatH.heatHBack.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import heatH.heatHBack.model.Recipe;
import heatH.heatHBack.model.request.RecipeRequest;
import heatH.heatHBack.service.implementation.RecipeService;
import heatH.heatHBack.config.JwtAuthenticationFilter;
import heatH.heatHBack.service.implementation.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = RecipeController.class)
@AutoConfigureMockMvc(addFilters = false)
class RecipeControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@MockBean
	private RecipeService recipeService;

	// Mock security beans to prevent context from creating real filters/services
	@MockBean
	private JwtAuthenticationFilter jwtAuthenticationFilter;

	@MockBean
	private JwtService jwtService;

	@Test
	void createRecipe_shouldReturnOkAndInvokeService() throws Exception {
		RecipeRequest request = new RecipeRequest();
		request.setTitle("Pasta");
		request.setInstructions(List.of("Boil water", "Cook pasta"));
		request.setIngredients(List.of("Pasta", "Salt", "Water"));
		request.setTag("Italian");
		request.setType("Dinner");
		request.setPhoto(null);
		request.setTotalCalorie(500);
		request.setPrice(9.99);

		when(recipeService.saveRecipe(any())).thenReturn(new Recipe());

		mockMvc.perform(
						post("/api/recipe/create")
								.contentType(MediaType.APPLICATION_JSON)
								.content(objectMapper.writeValueAsString(request))
				)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("OK"));

		ArgumentCaptor<RecipeRequest> captor = ArgumentCaptor.forClass(RecipeRequest.class);
		verify(recipeService, times(1)).saveRecipe(captor.capture());
		RecipeRequest passed = captor.getValue();
		assertThat(passed.getTitle()).isEqualTo(request.getTitle());
		assertThat(passed.getInstructions()).containsExactlyElementsOf(request.getInstructions());
		assertThat(passed.getIngredients()).containsExactlyElementsOf(request.getIngredients());
		assertThat(passed.getTag()).isEqualTo(request.getTag());
		assertThat(passed.getType()).isEqualTo(request.getType());
		assertThat(passed.getPhoto()).isNull();
		assertThat(passed.getTotalCalorie()).isEqualTo(500);
		assertThat(passed.getPrice()).isEqualTo(9.99);
	}

	@Test
	void createRecipe_whenBodyMissing_shouldReturnBadRequest() throws Exception {
		mockMvc.perform(
						post("/api/recipe/create")
								.contentType(MediaType.APPLICATION_JSON)
				)
				.andExpect(status().isBadRequest());
	}
}


