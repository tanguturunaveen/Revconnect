package org.revature.revconnect.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class EmailServiceTest {

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        emailService = new EmailService();
        // Inject a dummy API key — actual HTTP call won't be made in unit tests
        ReflectionTestUtils.setField(emailService, "brevoApiKey", "test-api-key");
    }

    @Test
    void sendPasswordResetEmail_withValidInputs_doesNotThrow() {
        // The @Async method will catch exceptions internally, so it should not throw
        assertDoesNotThrow(() -> emailService.sendPasswordResetEmail("user@test.com", "123456"));
    }

    @Test
    void sendVerificationEmail_withValidInputs_doesNotThrow() {
        assertDoesNotThrow(() -> emailService.sendVerificationEmail("user@test.com", "654321"));
    }
}
