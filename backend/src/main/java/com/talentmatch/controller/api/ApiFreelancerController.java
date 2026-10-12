package com.talentmatch.controller.api;

import com.talentmatch.dto.ChartPoint;
import com.talentmatch.dto.PieSlice;
import com.talentmatch.model.*;
import com.talentmatch.repository.JobInvitationRepository;
import com.talentmatch.service.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/freelancer")
public class ApiFreelancerController {

    private final UserService users;
    private final JobService jobs;
    private final ProjectService projects;
    private final PaymentService payments;
    private final DashboardService dashboard;
    private final JobInvitationRepository invites;

    public ApiFreelancerController(
            UserService users, JobService jobs, ProjectService projects,
            PaymentService payments, DashboardService dashboard,
            JobInvitationRepository invites) {
        this.users = users;
        this.jobs = jobs;
        this.projects = projects;
        this.payments = payments;
        this.dashboard = dashboard;
        this.invites = invites;
    }

    private User me(Authentication auth) {
        return users.byEmail(auth.getName());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "projects") String metric,
            @RequestParam(defaultValue = "status") String pieMode) {
        User u = me(auth);
        DashboardService.ChartRange range = dashboard.normalizeRange(from, to);
        List<ChartPoint> bars = dashboard.bar(u, range.from(), range.to(), metric);
        List<PieSlice> pie = dashboard.pie(u, range.from(), range.to(), pieMode);

        Map<String, Object> res = new HashMap<>();
        res.put("stats", dashboard.freelancerStats(u));
        res.put("recentApplications", jobs.applications(u).stream().limit(5).toList());
        res.put("recentProjects", projects.forFreelancer(u).stream().limit(5).toList());
        res.put("barData", bars);
        res.put("pieData", pie);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        User u = me(auth);
        List<Project> profileProjects = projects.forFreelancer(u);

        List<Map<String, Object>> checks = List.of(
                Map.of("label", "Họ & Tên", "done", hasText(u.getFullName())),
                Map.of("label", "Thông tin liên hệ", "done", hasText(u.getEmail()) && hasText(u.getPhone())),
                Map.of("label", "Ảnh đại diện", "done", hasText(u.getAvatar())),
                Map.of("label", "Giới thiệu bản thân", "done", hasText(u.getBio())),
                Map.of("label", "Địa chỉ", "done", hasText(u.getLocation())),
                Map.of("label", "Kỹ năng chính", "done", hasText(u.getSkills())),
                Map.of("label", "Kinh nghiệm làm việc", "done", u.getExperienceYears() != null && u.getExperienceYears() > 0),
                Map.of("label", "Vị trí mong muốn", "done", hasText(u.getProfessionalTitle())),
                Map.of("label", "Đơn giá theo giờ", "done", u.getHourlyRate() != null && u.getHourlyRate().signum() > 0),
                Map.of("label", "Portfolio / Website", "done", hasText(u.getWebsite()))
        );

        long done = checks.stream().filter(c -> Boolean.TRUE.equals(c.get("done"))).count();
        int completion = (int) Math.round(done * 100.0 / checks.size());

        List<String> skillList = hasText(u.getSkills())
                ? Arrays.stream(u.getSkills().split(",")).map(String::trim).filter(x -> !x.isBlank()).toList()
                : List.of();

        Map<String, Object> res = new HashMap<>();
        res.put("profile", u);
        res.put("projects", profileProjects);
        res.put("completedProjectCount", profileProjects.stream().filter(p -> p.getStatus() == ProjectStatus.COMPLETED).count());
        res.put("profileChecks", checks);
        res.put("profileCompletion", completion);
        res.put("skillList", skillList);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody User profile) {
        try {
            User updated = users.updateProfile(auth.getName(), profile);
            return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ Freelancer thành công.", "user", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/profile/statistics")
    public ResponseEntity<?> profileStatistics(
            Authentication auth,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "projects") String metric,
            @RequestParam(defaultValue = "status") String pieMode) {
        User u = me(auth);
        DashboardService.ChartRange range = dashboard.normalizeRange(from, to);
        List<ChartPoint> bars = dashboard.bar(u, range.from(), range.to(), metric);
        List<PieSlice> pie = dashboard.pie(u, range.from(), range.to(), pieMode);

        Map<String, Object> response = new HashMap<>();
        response.put("barData", bars);
        response.put("pieData", pie);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<?> savedJobs(Authentication auth) {
        return ResponseEntity.ok(jobs.saved(me(auth)));
    }

    @PostMapping("/saved-jobs/{jobId}/remove")
    public ResponseEntity<?> removeSaved(@PathVariable Long jobId, Authentication auth) {
        try {
            jobs.toggleSaved(jobs.get(jobId), me(auth));
            return ResponseEntity.ok(Map.of("message", "Đã bỏ công việc khỏi danh sách quan tâm."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<?> applications(Authentication auth) {
        List<JobApplication> all = jobs.applications(me(auth));
        return ResponseEntity.ok(all);
    }

    @PostMapping("/applications/{id}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable Long id, Authentication auth) {
        try {
            jobs.withdraw(id, me(auth));
            return ResponseEntity.ok(Map.of("message", "Đã rút đơn ứng tuyển."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/projects")
    public ResponseEntity<?> myProjects(Authentication auth) {
        User u = me(auth);
        List<Project> list = projects.forFreelancer(u);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/invitations")
    public ResponseEntity<?> myInvites(Authentication auth) {
        return ResponseEntity.ok(invites.findByFreelancerOrderByCreatedAtDesc(me(auth)));
    }

    @PostMapping("/invitations/{id}/answer")
    public ResponseEntity<?> answerInvite(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication auth) {
        try {
            User u = me(auth);
            JobInvitation i = invites.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lời mời."));
            if (!i.getFreelancer().getId().equals(u.getId())) {
                throw new IllegalArgumentException("Bạn không nhận được lời mời này.");
            }
            if (!"SENT".equals(i.getStatus())) {
                throw new IllegalArgumentException("Lời mời đã được xử lý.");
            }
            if (!Set.of("ACCEPTED", "DECLINED").contains(status)) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ.");
            }
            i.setStatus(status);
            invites.save(i);
            return ResponseEntity.ok(Map.of("message", "Đã phản hồi lời mời."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(Authentication auth) {
        User u = me(auth);
        Map<String, Object> res = new HashMap<>();
        res.put("applications", jobs.applications(u));
        res.put("projects", projects.forFreelancer(u));
        res.put("payments", payments.history(u));
        return ResponseEntity.ok(res);
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
