package com.talentmatch.controller.api;

import com.talentmatch.model.*;
import com.talentmatch.service.PaymentService;
import com.talentmatch.service.ProjectService;
import com.talentmatch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class ApiPaymentController {

    private final ProjectService projects;
    private final PaymentService payments;
    private final UserService users;

    public ApiPaymentController(ProjectService projects, PaymentService payments, UserService users) {
        this.projects = projects;
        this.payments = payments;
        this.users = users;
    }

    private User me(Authentication auth) {
        return users.byEmail(auth.getName());
    }

    @GetMapping("/project/{id}")
    public ResponseEntity<?> checkoutInfo(
            @PathVariable Long id,
            @RequestParam(required = false) Long milestoneId,
            Authentication auth) {
        User u = me(auth);
        Project p = projects.get(id);
        if (u.getRole() != Role.CUSTOMER || !p.getCustomer().getId().equals(u.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Chỉ khách hàng của dự án mới được thanh toán."));
        }
        Milestone m = null;
        if (milestoneId != null) {
            m = projects.milestones(p).stream()
                    .filter(x -> x.getId().equals(milestoneId))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Milestone."));
        }
        BigDecimal amount = payments.checkoutAmount(p, milestoneId);

        Map<String, Object> res = new HashMap<>();
        res.put("project", p);
        res.put("milestone", m);
        res.put("amount", amount);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/project/{id}")
    public ResponseEntity<?> pay(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            Long milestoneId = body.get("milestoneId") != null ? Long.valueOf(body.get("milestoneId").toString()) : null;
            String method = (String) body.get("method");
            if (method == null || method.isBlank()) method = "ESCROW_DEMO";

            Payment p = payments.pay(projects.get(id), milestoneId, me(auth), method);
            return ResponseEntity.ok(Map.of(
                    "message", "Thanh toán thành công. Mã giao dịch: " + p.getTransactionCode(),
                    "transactionCode", p.getTransactionCode(),
                    "paymentId", p.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
