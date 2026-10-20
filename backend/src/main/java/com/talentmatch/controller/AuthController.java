package com.talentmatch.controller;

import com.talentmatch.model.Role;
import com.talentmatch.model.User;
import com.talentmatch.service.MailService;
import com.talentmatch.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {
    private final UserService users;
    private final MailService mail;

    public AuthController(UserService users, MailService mail) {
        this.users = users;
        this.mail = mail;
    }

    @GetMapping("/login")
    public String login() {
        return "auth/login";
    }

    @GetMapping("/register")
    public String register(@RequestParam(required = false) String role, Model model) {
        model.addAttribute("preselectedRole", role);
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(@RequestParam(required = false) String fullName,
                           @RequestParam(required = false) String firstName,
                           @RequestParam(required = false) String lastName,
                           @RequestParam String email,
                           @RequestParam String password,
                           @RequestParam String confirmPassword,
                           @RequestParam Role role,
                           @RequestParam(required = false) Boolean agreeTerms,
                           RedirectAttributes ra) {
        try {
            String finalName = buildName(fullName, firstName, lastName);
            if (!Boolean.TRUE.equals(agreeTerms)) {
                throw new IllegalArgumentException("Bạn cần đồng ý điều khoản trước khi đăng ký.");
            }
            if (!password.equals(confirmPassword)) {
                throw new IllegalArgumentException("Mật khẩu xác nhận không khớp.");
            }
            users.register(finalName, email, password, role);
            ra.addFlashAttribute("success", "Đăng ký thành công. Hãy kiểm tra email để xác nhận tài khoản trước khi đăng nhập.");
            return "redirect:/login";
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        }
    }

    @GetMapping("/verify")
    public String verify(@RequestParam(required = false) String token,
                         @RequestParam(required = false) String email,
                         @RequestParam(required = false) String otp,
                         RedirectAttributes ra) {
        try {
            if (token != null && !token.isBlank()) {
                users.verifyByLink(token);
            } else if (email != null && otp != null) {
                users.verifyOtp(email, otp);
            } else {
                throw new IllegalArgumentException("Thiếu thông tin xác thực.");
            }
            ra.addFlashAttribute("success", "Xác nhận email thành công. Bạn có thể đăng nhập.");
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/login";
    }

    @GetMapping("/forgot-password")
    public String forgot() {
        return "auth/forgot-password";
    }

    @PostMapping("/forgot-password")
    public String forgot(@RequestParam String email, RedirectAttributes ra) {
        try {
            users.sendForgotPasswordOtp(email);
        } catch (Exception ignored) {
            // Không tiết lộ email có tồn tại hay không
        }
        ra.addFlashAttribute("success", "Nếu email tồn tại, hệ thống đã gửi mã OTP đặt lại mật khẩu về hòm thư.");
        return "redirect:/forgot-password";
    }

    @GetMapping("/reset-password")
    public String reset(@RequestParam(required = false) String token, Model model) {
        model.addAttribute("token", token);
        return "auth/reset-password";
    }

    @PostMapping("/reset-password")
    public String reset(@RequestParam String email,
                        @RequestParam(required = false) String token,
                        @RequestParam(required = false) String otp,
                        @RequestParam String password,
                        @RequestParam String confirmPassword,
                        RedirectAttributes ra) {
        try {
            if (!password.equals(confirmPassword)) {
                throw new IllegalArgumentException("Mật khẩu xác nhận không khớp.");
            }
            String code = (otp != null && !otp.isBlank()) ? otp : token;
            users.resetPasswordWithOtpOrToken(email, code, password);
            ra.addFlashAttribute("success", "Đặt lại mật khẩu thành công. Hãy đăng nhập.");
            return "redirect:/login";
        } catch (Exception e) {
            ra.addFlashAttribute("error", e.getMessage());
            return "redirect:/reset-password" + (token != null ? "?token=" + token : "");
        }
    }

    private String buildName(String fullName, String firstName, String lastName) {
        if (fullName != null && !fullName.trim().isBlank()) return fullName.trim();
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (last + " " + first).trim();
    }
}
