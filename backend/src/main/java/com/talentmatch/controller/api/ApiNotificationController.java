package com.talentmatch.controller.api;

import com.talentmatch.model.User;
import com.talentmatch.service.NotificationService;
import com.talentmatch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        return users.byEmail(auth.getName());
    }

    @GetMapping
    public ResponseEntity<?> list(Authentication auth) {
        return ResponseEntity.ok(notifications.inbox(me(auth)));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> read(@PathVariable Long id, Authentication auth) {
        String targetUrl = notifications.read(id, me(auth));
        return ResponseEntity.ok(Map.of("message", "Đã đánh dấu đã đọc.", "targetUrl", targetUrl));
    }
}
