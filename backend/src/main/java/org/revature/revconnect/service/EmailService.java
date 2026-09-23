package org.revature.revconnect.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * EmailService — sends transactional emails via AWS SES SMTP.
 * Works on Elastic Beanstalk (EC2 does not block outbound SMTP port 587).
 */
@Service
@Slf4j
public class EmailService {

    private static final String FROM_NAME    = "RevConnect";
    private static final String FROM_EMAIL   = "tanguturunaveen2002@gmail.com";

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:tanguturunaveen2002@gmail.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send a password reset OTP email.
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String otp) {
        log.info("Attempting to send password reset OTP to: {}", toEmail);
        String subject  = "Your RevConnect Password Reset Code";
        String htmlBody = buildHtmlEmail(
                "Password Reset Request",
                "You have requested to reset your password. Use the code below to proceed:",
                otp,
                "This code is valid for 24 hours. If you did not request this, please ignore this email."
        );
        sendEmail(toEmail, subject, htmlBody, otp);
    }

    /**
     * Send an account verification OTP email.
     */
    @Async
    public void sendVerificationEmail(String toEmail, String otp) {
        log.info("Attempting to send verification OTP to: {}", toEmail);
        String subject  = "Verify Your RevConnect Account";
        String htmlBody = buildHtmlEmail(
                "Welcome to RevConnect!",
                "To complete your registration, please enter the verification code below:",
                otp,
                "This code is valid for 24 hours. If you did not create an account, please ignore this email."
        );
        sendEmail(toEmail, subject, htmlBody, otp);
    }

    private void sendEmail(String toEmail, String subject, String htmlBody, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(FROM_EMAIL, FROM_NAME);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email successfully sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("CRITICAL ERROR: Failed to send email to {}: {}", toEmail, e.getMessage());
            log.info("========================================");
            log.info("FALLBACK OTP (Console): {}", otp);
            log.info("========================================");
        }
    }

    private String buildHtmlEmail(String heading, String message, String otp, String footer) {
        return "<!DOCTYPE html>" +
                "<html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'></head>" +
                "<body style='margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background-color:#0f0a1a;'>" +
                "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0f0a1a;padding:40px 0;'>" +
                "<tr><td align='center'>" +

                "<table width='520' cellpadding='0' cellspacing='0' style='margin-bottom:0;'>" +
                "<tr><td style='text-align:center;padding:24px 0 20px;'>" +
                "<div style='display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6);width:56px;height:56px;border-radius:16px;line-height:56px;text-align:center;box-shadow:0 8px 32px rgba(139,92,246,0.4);'>" +
                "<span style='font-size:28px;font-weight:900;color:#ffffff;font-family:Arial,sans-serif;'>R</span>" +
                "</div>" +
                "<p style='margin:12px 0 0;font-size:20px;font-weight:800;letter-spacing:-0.5px;'>" +
                "<span style='color:#8b5cf6;'>Rev</span><span style='color:#ffffff;'>Connect</span></p>" +
                "</td></tr></table>" +

                "<table width='520' cellpadding='0' cellspacing='0' style='background:#1a1425;border-radius:20px;border:1px solid rgba(139,92,246,0.15);box-shadow:0 20px 60px rgba(0,0,0,0.5);overflow:hidden;'>" +
                "<tr><td style='background:linear-gradient(135deg,#8b5cf6,#6366f1,#3b82f6);height:4px;font-size:0;line-height:0;'>&nbsp;</td></tr>" +
                "<tr><td style='padding:36px 40px 0;text-align:center;'>" +
                "<h1 style='margin:0 0 8px;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;'>" + heading + "</h1>" +
                "<div style='width:48px;height:3px;background:linear-gradient(90deg,#8b5cf6,#3b82f6);margin:0 auto;border-radius:2px;'></div>" +
                "</td></tr>" +
                "<tr><td style='padding:28px 40px 12px;'>" +
                "<p style='margin:0 0 24px;color:#c4b5d4;font-size:15px;line-height:1.7;text-align:center;'>" + message + "</p>" +
                "<div style='text-align:center;margin:0 0 28px;'>" +
                "<div style='display:inline-block;background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08));border:1px solid rgba(139,92,246,0.25);border-radius:16px;padding:20px 48px;'>" +
                "<span style='font-size:36px;font-weight:900;letter-spacing:10px;color:#a78bfa;font-family:monospace;'>" + otp + "</span>" +
                "</div></div>" +
                "<div style='background:rgba(139,92,246,0.06);border-radius:12px;border:1px solid rgba(139,92,246,0.1);padding:16px 20px;margin-bottom:8px;'>" +
                "<p style='margin:0;color:#9586a8;font-size:13px;line-height:1.6;text-align:center;'>&#128274; " + footer + "</p>" +
                "</div>" +
                "</td></tr>" +
                "<tr><td style='padding:0 40px;'><div style='height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.2),transparent);'></div></td></tr>" +
                "<tr><td style='padding:24px 40px 32px;text-align:center;'>" +
                "<p style='margin:0 0 8px;color:#6b5b7b;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;'>Powered by RevConnect</p>" +
                "<p style='margin:0;color:#4a3d5c;font-size:11px;line-height:1.5;'>Professional Networking &bull; Business Growth &bull; Creator Platform</p>" +
                "</td></tr></table>" +

                "<table width='520' cellpadding='0' cellspacing='0'>" +
                "<tr><td style='text-align:center;padding:20px 0;'>" +
                "<p style='margin:0;color:#3d2e50;font-size:11px;'>&copy; 2025 RevConnect. All rights reserved.</p>" +
                "</td></tr></table>" +

                "</td></tr></table></body></html>";
    }
}
