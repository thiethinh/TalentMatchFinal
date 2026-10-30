package com.talentmatch.controller.api;

import com.talentmatch.model.Notification;
import com.talentmatch.model.User;
import com.talentmatch.service.NotificationService;
import com.talentmatch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class ApiNotificationController {

    private final NotificationService notifications;
    private final UserService users;

    public ApiNotificationController(NotificationService notifications, UserService users) {
        this.notifications = notifications;
        this.users = users;
    }

    private User me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return null;
        return users.byEmail(auth.getName());
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        User user = me(auth);
        if (user == null) {
            return ResponseEntity.ok(List.of());
        }
        List<Notification> list = notifications.inbox(user);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Notification n : list) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("recipientId", n.getRecipient() != null ? n.getRecipient().getId() : null);
            map.put("title", n.getTitle());
            map.put("message", n.getMessage());
            map.put("content", n.getMessage());
            map.put("targetUrl", n.getTargetUrl());
            map.put("link", n.getTargetUrl());
            map.put("isRead", n.isRead());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt() != null ? n.getCreatedAt().toString() : "");
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Authentication auth) {
        try {
            String recipientStr = body.get("recipientId") != null ? body.get("recipientId").toString() : "";
            String numOnly = recipientStr.replaceAll("\\D+", "");
            if (numOnly.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Thiếu recipientId"));
            }
            Long recipientId = Long.parseLong(numOnly);
            User recipient = users.get(recipientId);
            if (recipient == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Người nhận không tồn tại"));
            }

            String title = (String) body.get("title");
            String message = (String) body.get("message");
            String targetUrl = body.get("targetUrl") != null ? (String) body.get("targetUrl") : (String) body.get("link");
            notifications.send(recipient, title, message, targetUrl);
            return ResponseEntity.ok(Map.of("message", "Đã lưu thông báo vào CSDL MySQL."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> read(@PathVariable Long id, Authentication auth) {
        User user = me(auth);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập."));
        }
        String targetUrl = notifications.read(id, user);
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu đã đọc.", "targetUrl", targetUrl));
    }
}
