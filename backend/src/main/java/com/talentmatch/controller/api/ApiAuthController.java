package com.talentmatch.controller.api;

import com.talentmatch.model.Role;
import com.talentmatch.model.User;
import com.talentmatch.service.MailService;
import com.talentmatch.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ApiAuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final MailService mailService;

    public ApiAuthController(AuthenticationManager authenticationManager, UserService userService, MailService mailService) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.mailService = mailService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletRequest request) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vui lòng nhập email và mật khẩu."));
        }

        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email.trim().toLowerCase(), password)
            );
            SecurityContext sc = SecurityContextHolder.getContext();
            sc.setAuthentication(auth);
            HttpSession session = request.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, sc);

            User user = userService.byEmail(auth.getName());
            return ResponseEntity.ok(userDto(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "Email hoặc mật khẩu không chính xác hoặc tài khoản chưa kích hoạt."));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công."));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
        try {
            User user = userService.byEmail(auth.getName());
            Map<String, Object> dto = userDto(user);
            dto.put("authenticated", true);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        try {
            String fullName = (String) body.get("fullName");
            String email = (String) body.get("email");
            String password = (String) body.get("password");
            String confirmPassword = (String) body.get("confirmPassword");
            String roleStr = (String) body.get("role");
            Boolean agreeTerms = (Boolean) body.get("agreeTerms");

            if (!Boolean.TRUE.equals(agreeTerms)) {
                throw new IllegalArgumentException("Bạn cần đồng ý điều khoản trước khi đăng ký.");
            }
            if (password == null || !password.equals(confirmPassword)) {
                throw new IllegalArgumentException("Mật khẩu xác nhận không khớp.");
            }
            Role role = Role.valueOf(roleStr);

            String token = userService.register(fullName, email, password, role);
            mailService.sendVerification(email, token);

            return ResponseEntity.ok(Map.of("message", "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verify(@RequestParam String token) {
        try {
            userService.verify(token);
            return ResponseEntity.ok(Map.of("message", "Xác nhận email thành công. Bạn có thể đăng nhập."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        try {
            String token = userService.createResetToken(email);
            mailService.sendResetPassword(email, token);
        } catch (Exception ignored) {
            // Không để lộ thông tin email tồn tại hay không
        }
        return ResponseEntity.ok(Map.of("message", "Nếu email tồn tại, hệ thống đã gửi liên kết đặt lại mật khẩu."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");
        String confirmPassword = body.get("confirmPassword");

        if (password == null || !password.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu xác nhận không khớp."));
        }
        try {
            userService.resetPassword(token, password);
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công. Hãy đăng nhập."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private Map<String, Object> userDto(User user) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", user.getId());
        dto.put("email", user.getEmail());
        dto.put("fullName", user.getFullName());
        dto.put("role", user.getRole().name());
        dto.put("avatar", user.getAvatar());
        dto.put("phone", user.getPhone());
        dto.put("location", user.getLocation());
        dto.put("bio", user.getBio());
        dto.put("skills", user.getSkills());
        dto.put("field", user.getField());
        dto.put("hourlyRate", user.getHourlyRate());
        dto.put("professionalTitle", user.getProfessionalTitle());
        dto.put("companyName", user.getCompanyName());
        dto.put("companySize", user.getCompanySize());
        dto.put("talentCreditBalance", user.getTalentCreditBalance());
        dto.put("rating", user.getRating());
        return dto;
    }
}
