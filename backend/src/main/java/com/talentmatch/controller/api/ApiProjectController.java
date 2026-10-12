package com.talentmatch.controller.api;

import com.talentmatch.model.*;
import com.talentmatch.repository.*;
import com.talentmatch.service.*;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/projects")
public class ApiProjectController {

    private final ProjectService projects;
    private final PaymentService payments;
    private final UserService users;
    private final DeliveryService delivery;
    private final TalentReviewRepository reviews;
    private final TalentReportRepository reports;
    private final UserRepository userRepo;

    public ApiProjectController(
            ProjectService projects, PaymentService payments, UserService users,
            DeliveryService delivery, TalentReviewRepository reviews,
            TalentReportRepository reports, UserRepository userRepo) {
        this.projects = projects;
        this.payments = payments;
        this.users = users;
        this.delivery = delivery;
        this.reviews = reviews;
        this.reports = reports;
        this.userRepo = userRepo;
    }

    private User me(Authentication auth) {
        return users.byEmail(auth.getName());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id, Authentication auth) {
        User u = me(auth);
        Project p = projects.get(id);
        projects.ensureParticipant(p, u);

        Map<String, Object> res = new HashMap<>();
        res.put("project", p);
        res.put("milestones", projects.milestones(p));
        res.put("payments", payments.forProject(p));
        res.put("reviews", reviews.findByProjectOrderByCreatedAtDesc(p));
        res.put("alreadyReviewed", reviews.existsByProjectAndAuthor(p, u));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/milestones")
    public ResponseEntity<?> addMilestone(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        try {
            String title = (String) body.get("title");
            String description = (String) body.get("description");
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            LocalDate deadline = body.get("deadline") != null ? LocalDate.parse((String) body.get("deadline")) : null;

            Milestone m = projects.addMilestone(projects.get(id), me(auth), title, description, amount, deadline);
            return ResponseEntity.ok(Map.of("message", "Đã tạo Milestone.", "milestone", m));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/milestones/{milestoneId}/status")
    public ResponseEntity<?> updateMilestoneStatus(
            @PathVariable Long id,
            @PathVariable Long milestoneId,
            @RequestParam MilestoneStatus status,
            Authentication auth) {
        try {
            Project p = projects.get(id);
            if (projects.milestones(p).stream().noneMatch(m -> m.getId().equals(milestoneId))) {
                throw new IllegalArgumentException("Milestone không thuộc dự án này.");
            }
            projects.markMilestone(milestoneId, me(auth), status);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái Milestone."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/agreement/sign")
    public ResponseEntity<?> sign(@PathVariable Long id, Authentication auth) {
        try {
            projects.signAgreement(projects.get(id), me(auth));
            return ResponseEntity.ok(Map.of("message", "Đã xác nhận hợp đồng."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            String reason = body.get("reason");
            projects.requestCancellation(projects.get(id), me(auth), reason);
            return ResponseEntity.ok(Map.of("message", "Đã ghi nhận yêu cầu hủy hợp đồng. Admin sẽ xem xét giải quyết."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/milestones/{mid}/revision")
    public ResponseEntity<?> revision(@PathVariable Long id, @PathVariable Long mid, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            Project p = projects.get(id);
            if (projects.milestones(p).stream().noneMatch(m -> m.getId().equals(mid))) {
                throw new IllegalArgumentException("Milestone không thuộc dự án.");
            }
            String note = body.get("note");
            projects.requestRevision(mid, me(auth), note);
            return ResponseEntity.ok(Map.of("message", "Đã gửi yêu cầu chỉnh sửa cho Freelancer."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, Authentication auth) {
        try {
            projects.completeProjectWithoutMilestones(projects.get(id), me(auth));
            return ResponseEntity.ok(Map.of("message", "Dự án đã nghiệm thu và hoàn thành."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<?> review(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        try {
            Project p = projects.get(id);
            User u = me(auth);
            projects.ensureParticipant(p, u);
            if (p.getStatus() != ProjectStatus.COMPLETED) {
                throw new IllegalArgumentException("Chỉ đánh giá sau khi dự án hoàn thành.");
            }
            if (reviews.existsByProjectAndAuthor(p, u)) {
                throw new IllegalArgumentException("Bạn đã đánh giá dự án này.");
            }
            Integer rating = Integer.valueOf(body.get("rating").toString());
            String comment = (String) body.get("comment");
            if (rating < 1 || rating > 5 || comment == null || comment.trim().length() < 10) {
                throw new IllegalArgumentException("Đánh giá 1–5 sao và nhận xét tối thiểu 10 ký tự.");
            }
            User target = p.getCustomer().getId().equals(u.getId()) ? p.getFreelancer() : p.getCustomer();
            TalentReview rev = new TalentReview();
            rev.setProject(p);
            rev.setAuthor(u);
            rev.setTarget(target);
            rev.setRating(rating);
            rev.setComment(comment.trim());
            reviews.save(rev);

            List<TalentReview> all = reviews.findByTarget(target);
            target.setRating(all.stream().mapToInt(TalentReview::getRating).average().orElse(5));
            userRepo.save(target);

            return ResponseEntity.ok(Map.of("message", "Đã lưu đánh giá chất lượng."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reports")
    public ResponseEntity<?> report(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            Project p = projects.get(id);
            User u = me(auth);
            projects.ensureParticipant(p, u);
            String reason = body.get("reason");
            String description = body.get("description");
            if (reason == null || reason.isBlank() || description == null || description.trim().length() < 15) {
                throw new IllegalArgumentException("Vui lòng cung cấp lý do và mô tả tối thiểu 15 ký tự.");
            }
            TalentReport tr = new TalentReport();
            tr.setProject(p);
            tr.setReporter(u);
            tr.setReportedUser(p.getCustomer().getId().equals(u.getId()) ? p.getFreelancer() : p.getCustomer());
            tr.setReason(reason);
            tr.setDescription(description.trim());
            reports.save(tr);
            return ResponseEntity.ok(Map.of("message", "Báo cáo đã được gửi tới Admin."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deliveries")
    public ResponseEntity<?> submitDelivery(
            @PathVariable Long id,
            @RequestParam(required = false) Long milestoneId,
            @RequestParam(required = false) String externalUrl,
            @RequestParam(required = false) String note,
            @RequestParam(required = false, name = "file") MultipartFile file,
            Authentication auth) {
        try {
            ProjectDelivery d = delivery.submit(projects.get(id), milestoneId, me(auth), externalUrl, note, file);
            return ResponseEntity.ok(Map.of("message", "Đã bàn giao sản phẩm.", "deliveryId", d.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/deliveries/{deliveryId}/download")
    public ResponseEntity<UrlResource> downloadDelivery(@PathVariable Long deliveryId, Authentication auth) throws Exception {
        ProjectDelivery d = delivery.getOwnedFile(deliveryId, me(auth));
        Path file = delivery.file(d);
        if (!Files.isRegularFile(file)) return ResponseEntity.notFound().build();
        UrlResource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .contentLength(Files.size(file))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(d.getFileName(), StandardCharsets.UTF_8).build().toString())
                .body(resource);
    }
}
