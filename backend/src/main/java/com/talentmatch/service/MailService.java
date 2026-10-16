package com.talentmatch.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class MailService {
    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean enabled;
    private final String baseUrl;
    private final String fromAddress;

    public MailService(ObjectProvider<JavaMailSender> mailSenderProvider,
                       @Value("${app.mail.enabled:true}") boolean enabled,
                       @Value("${app.base-url:http://localhost:5173}") String baseUrl,
                       @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSenderProvider = mailSenderProvider;
        this.enabled = enabled;
        this.baseUrl = baseUrl;
        this.fromAddress = fromAddress == null ? "" : fromAddress.trim();
    }

    public boolean sendVerificationOtp(String email, String otp, String token) {
        String verifyLink = baseUrl + "/verify?token=" + token + "&email=" + email;
        String subject = "[TalentMatch] Mã xác thực tài khoản của bạn: " + otp;
        
        String html = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #2563eb; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">TalentMatch Platform</h1>
                    <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 14px;">Xác thực tài khoản & Kích hoạt trải nghiệm</p>
                </div>
                <div style="padding: 32px 28px;">
                    <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0;">Xin chào,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                        Bạn vừa đăng ký tài khoản tại <strong>TalentMatch</strong>. Dưới đây là mã xác thực OTP 6 số của bạn:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <div style="display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; background: #eff6ff; padding: 14px 28px; border-radius: 10px; border: 2px dashed #93c5fd;">
                            %s
                        </div>
                        <p style="font-size: 13px; color: #64748b; margin-top: 10px;">(Mã có hiệu lực trong vòng <strong>15 phút</strong>)</p>
                    </div>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 24px 0 16px 0;">
                        Hoặc bạn có thể bấm trực tiếp vào liên kết bên dưới để xác thực nhanh:
                    </p>
                    <div style="text-align: center; margin-bottom: 28px;">
                        <a href="%s" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold;">
                            Xác thực tài khoản ngay &rarr;
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                        Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Tài khoản chưa xác thực sẽ không thể thực hiện các giao dịch trên sàn.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    &copy; 2026 TalentMatch. Mọi quyền được bảo lưu.
                </div>
            </div>
            """.formatted(otp, verifyLink);

        return sendHtml(email, subject, html, otp);
    }

    public boolean sendResetPasswordOtp(String email, String otp, String token) {
        String resetLink = baseUrl + "/reset-password?token=" + token + "&email=" + email;
        String subject = "[TalentMatch] Mã xác thực đặt lại mật khẩu: " + otp;

        String html = """
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <div style="background: #dc2626; padding: 24px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">TalentMatch Platform</h1>
                    <p style="color: #fecaca; margin: 6px 0 0 0; font-size: 14px;">Yêu cầu đặt lại mật khẩu</p>
                </div>
                <div style="padding: 32px 28px;">
                    <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0;">Xin chào,</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6; margin: 0 0 24px 0;">
                        Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>%s</strong>. Dưới đây là mã OTP xác thực:
                    </p>
                    <div style="text-align: center; margin: 28px 0;">
                        <div style="display: inline-block; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #b91c1c; background: #fef2f2; padding: 14px 28px; border-radius: 10px; border: 2px dashed #fca5a5;">
                            %s
                        </div>
                        <p style="font-size: 13px; color: #64748b; margin-top: 10px;">(Mã có hiệu lực trong vòng <strong>15 phút</strong>)</p>
                    </div>
                    <div style="text-align: center; margin-bottom: 28px;">
                        <a href="%s" style="display: inline-block; background: #dc2626; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: bold;">
                            Đặt lại mật khẩu &rarr;
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0;">
                        Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại của bạn vẫn được giữ an toàn tuyệt đối.
                    </p>
                </div>
                <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
                    &copy; 2026 TalentMatch. Mọi quyền được bảo lưu.
                </div>
            </div>
            """.formatted(email, otp, resetLink);

        return sendHtml(email, subject, html, otp);
    }

    private boolean sendHtml(String to, String subject, String htmlContent, String otp) {
        log.info("📩 [MÃ OTP] Gửi tới: {} | MÃ OTP: {} | Tiêu đề: {}", to, otp, subject);
        
        if (!enabled || fromAddress.isBlank()) {
            log.warn("⚠️ [MailService] Chưa cấu hình spring.mail.username trong application-mail.properties. Mã OTP ({}) đã được lưu vào CSDL.", otp);
            return false;
        }

        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null) {
            log.warn("⚠️ [MailService] JavaMailSender không khả dụng. Mã OTP ({}) đã được lưu vào CSDL.", otp);
            return false;
        }

        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            sender.send(message);
            log.info("✅ [MailService] Đã gửi email thành công tới {}", to);
            return true;
        } catch (Exception e) {
            log.warn("⚠️ [MailService] Gửi email qua Gmail SMTP thất bại ({}: {}). Dữ liệu người dùng và mã OTP ({}) vẫn được lưu vào MySQL an toàn.",
                    e.getClass().getSimpleName(), e.getMessage(), otp);
            return false;
        }
    }

    public boolean isEnabled() {
        return enabled;
    }
}
