package org.revature.revconnect.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private MimeMessage mimeMessage;

    private EmailService emailService;

    @BeforeEach
    void setUp() {
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        emailService = new EmailService(mailSender);
    }

    @Test
    void sendVerificationEmail_callsMailSender() {
        emailService.sendVerificationEmail("test@example.com", "123456");
        verify(mailSender, atLeastOnce()).createMimeMessage();
    }

    @Test
    void sendPasswordResetEmail_callsMailSender() {
        emailService.sendPasswordResetEmail("test@example.com", "654321");
        verify(mailSender, atLeastOnce()).createMimeMessage();
    }
}
