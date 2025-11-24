package heatH.heatHBack.service.implementation;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContext;
import org.junit.jupiter.api.Test;
import heatH.heatHBack.model.InterestForm;
import heatH.heatHBack.repository.InterestFormRepository;
import heatH.heatHBack.repository.UserRepository;
import heatH.heatHBack.model.User;
import heatH.heatHBack.model.request.InterestFormRequest;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.junit.jupiter.api.BeforeEach;
import java.util.Optional;



@ExtendWith(MockitoExtension.class)
class InterestFormServiceTest {

    @Mock
    private InterestFormRepository interestFormRepository;

    @Mock
    private UserRepository userRepository;


    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;
    

    @InjectMocks
    private InterestFormService interestFormService;

    private User testUser;
    private InterestForm testInterestForm;
    private InterestFormRequest testInterestFormRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("test@example.com");

        testInterestForm = new InterestForm();
        testInterestForm.setId(1L);
        testInterestForm.setName("test");
        testInterestForm.setSurname("null");
        testInterestForm.setHeight(170);
        
        testInterestFormRequest = new InterestFormRequest();
        testInterestFormRequest.setName("test");
        testInterestFormRequest.setSurname("null");
        testInterestFormRequest.setHeight(170);
        
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");

    }

    @Test
    void testSubmitForm_Success() {
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(interestFormRepository.save(any(InterestForm.class))).thenReturn(testInterestForm);

        // When
        InterestForm result = interestFormService.submitForm(testInterestFormRequest);

        // Then
        assertNotNull(result);
        assertEquals(testInterestForm, result);

        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(userRepository, times(1)).save(testUser);
        verify(interestFormRepository, times(1)).save(any(InterestForm.class));
    }

    @Test
    void testSubmitForm_UserNotFound() {
        when(userRepository.findByUsername("test@example.com")).thenReturn(Optional.empty());
        
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            interestFormService.submitForm(testInterestFormRequest);
        });

        assertEquals("User not found", exception.getMessage());

        verify(userRepository, times(1)).findByUsername("test@example.com");
        verify(interestFormRepository, never()).save(any(InterestForm.class));  
    }

    
}
                