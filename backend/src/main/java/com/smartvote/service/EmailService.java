package com.smartvote.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@smartvote.ai}")
    private String fromEmail;

    @Async
    public void sendOtpEmail(String toEmail, String otpCode, int expirySeconds) {
        String subject = "SmartVote AI - Biometric Login Verification Code: " + otpCode;
        String htmlContent = buildOtpEmailTemplate(toEmail, otpCode, expirySeconds);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendRegistrationSuccessEmail(String toEmail, String fullName, String voterIdNumber) {
        String subject = "SmartVote AI - Digital Identity Enrolled Successfully";
        String htmlContent = buildRegistrationEmailTemplate(fullName, voterIdNumber);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    @Async
    public void sendVoteConfirmationEmail(String toEmail, String fullName, String electionTitle,
                                          String candidateName, String receiptId, String receiptHash) {
        String subject = "SmartVote AI - Official Voting Receipt: " + receiptId;
        String htmlContent = buildVoteConfirmationTemplate(fullName, electionTitle, candidateName, receiptId, receiptHash);
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (mailSender == null) {
            log.info("MAIL SENDER NOT AVAILABLE. Simulating email to [{}]: Subject: '{}'", toEmail, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, "SmartVote AI Cryptographic Voting");
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to [{}] with subject: '{}'", toEmail, subject);
        } catch (Exception e) {
            log.warn("Failed to send email via SMTP to [{}]. (Fallback: check server console): {}", toEmail, e.getMessage());
        }
    }

    private String buildOtpEmailTemplate(String email, String otpCode, int expirySeconds) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: #0b0f19; border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 0 40px rgba(0, 240, 255, 0.1); }
            .header { background: linear-gradient(135deg, #0f172a 0%%, #1e1b4b 100%%); padding: 32px 24px; text-align: center; border-bottom: 1px solid rgba(138, 43, 226, 0.2); }
            .logo { font-size: 26px; font-weight: 800; background: linear-gradient(90deg, #00f0ff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { padding: 36px 32px; text-align: center; }
            .title { font-size: 20px; font-weight: 600; margin-bottom: 12px; color: #ffffff; }
            .otp-box { background: rgba(0, 240, 255, 0.05); border: 2px dashed #00f0ff; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 24px 0; letter-spacing: 10px; font-size: 34px; font-weight: 800; color: #00f0ff; }
            .desc { color: #9ca3af; font-size: 14px; line-height: 1.6; }
            .footer { background: #070a12; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid rgba(255, 255, 255, 0.05); }
            .badge { display: inline-block; background: rgba(0, 255, 163, 0.1); color: #00ffa3; border: 1px solid rgba(0, 255, 163, 0.3); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SMARTVOTE AI</div>
              <p style="margin: 4px 0 0; color: #94a3b8; font-size: 13px;">Next-Gen Biometric Democratic Voting Engine</p>
            </div>
            <div class="content">
              <div class="badge">Biometric Liveness Verified</div>
              <div class="title">Two-Factor Authentication Code</div>
              <p class="desc">Your facial biometric verification passed. Use the 6-digit one-time authorization code below to complete your secure session sign-in.</p>
              <div class="otp-box">%s</div>
              <p class="desc">This code expires in <strong>%d seconds</strong>.<br>If you did not initiate this authentication request, secure your account immediately.</p>
            </div>
            <div class="footer">
              &copy; 2026 SmartVote AI Inc. Cryptographic Zero-Knowledge Election Protocol.
            </div>
          </div>
        </body>
        </html>
        """.formatted(otpCode, expirySeconds);
    }

    private String buildRegistrationEmailTemplate(String fullName, String voterIdNumber) {
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: #0b0f19; border: 1px solid rgba(138, 43, 226, 0.3); border-radius: 16px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #0f172a 0%%, #2e1065 100%%); padding: 32px 24px; text-align: center; }
            .logo { font-size: 26px; font-weight: 800; background: linear-gradient(90deg, #00f0ff, #8a2be2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
            .content { padding: 32px; }
            .id-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .label { color: #9ca3af; }
            .val { color: #00f0ff; font-weight: 600; }
            .footer { background: #070a12; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">SMARTVOTE AI</div>
              <p style="margin: 4px 0 0; color: #c084fc; font-size: 13px;">Digital Identity Enrollment Confirmation</p>
            </div>
            <div class="content">
              <h2 style="color: #fff; margin-top: 0;">Welcome, %s!</h2>
              <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
                Your biometric identity profile has been enrolled and verified on the SmartVote AI platform.
              </p>
              <div class="id-card">
                <div class="row"><span class="label">Voter ID:</span><span class="val">%s</span></div>
                <div class="row"><span class="label">Status:</span><span class="val" style="color: #00ffa3;">ACTIVE & ELIGIBLE</span></div>
                <div class="row"><span class="label">Biometrics:</span><span class="val">128-D Face Vector Saved</span></div>
              </div>
              <p style="color: #9ca3af; font-size: 14px;">
                You can now browse active elections, view candidate manifestos, and cast cryptographically verifiable votes.
              </p>
            </div>
            <div class="footer">&copy; 2026 SmartVote AI Inc. Demo Identity Simulation.</div>
          </div>
        </body>
        </html>
        """.formatted(fullName, voterIdNumber);
    }

    private String buildVoteConfirmationTemplate(String fullName, String electionTitle,
                                                 String candidateName, String receiptId, String receiptHash) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm:ss"));
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: #0b0f19; border: 1px solid rgba(0, 255, 163, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 0 40px rgba(0, 255, 163, 0.1); }
            .header { background: linear-gradient(135deg, #064e3b 0%%, #0f172a 100%%); padding: 32px 24px; text-align: center; }
            .logo { font-size: 26px; font-weight: 800; color: #00ffa3; }
            .content { padding: 32px; }
            .receipt-box { background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(0, 255, 163, 0.2); border-radius: 12px; padding: 20px; margin: 20px 0; font-family: monospace; font-size: 13px; }
            .hash { word-break: break-all; color: #00f0ff; background: rgba(0, 240, 255, 0.05); padding: 8px; border-radius: 6px; font-size: 11px; margin-top: 8px; }
            .footer { background: #070a12; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">VOTE CONFIRMED</div>
              <p style="margin: 4px 0 0; color: #6ee7b7; font-size: 13px;">Official Cryptographic Digital Receipt</p>
            </div>
            <div class="content">
              <p style="color: #9ca3af; font-size: 14px;">Dear %s, your vote has been sealed into the cryptographic ledger.</p>
              <div class="receipt-box">
                <div><strong>RECEIPT ID:</strong> <span style="color: #00ffa3;">%s</span></div>
                <div style="margin-top: 6px;"><strong>ELECTION:</strong> %s</div>
                <div style="margin-top: 6px;"><strong>SELECTION:</strong> %s</div>
                <div style="margin-top: 6px;"><strong>TIMESTAMP:</strong> %s</div>
                <div style="margin-top: 10px;"><strong>SHA-256 DIGITAL SEAL:</strong></div>
                <div class="hash">%s</div>
              </div>
              <p style="color: #9ca3af; font-size: 13px;">You can independently verify this receipt anytime on the SmartVote public verification portal.</p>
            </div>
            <div class="footer">&copy; 2026 SmartVote AI Inc. End-to-End Cryptographic Auditability.</div>
          </div>
        </body>
        </html>
        """.formatted(fullName, receiptId, electionTitle, candidateName, timestamp, receiptHash);
    }
}
