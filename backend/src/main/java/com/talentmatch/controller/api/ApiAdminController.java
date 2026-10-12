package com.talentmatch.controller.api;

import com.talentmatch.dto.ChartPoint;
import com.talentmatch.dto.PieSlice;
import com.talentmatch.model.*;
import com.talentmatch.repository.*;
import com.talentmatch.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Predicate;

@RestController
@RequestMapping("/api/admin")
public class ApiAdminController {

    private final UserRepository users;
    private final JobRepository jobs;
    private final ProjectRepository projects;
    private final PaymentRepository payments;
    private final TalentReportRepository reports;
    private final AdminAuditLogRepository audits;
    private final DashboardService dashboard;

    public ApiAdminController(
            UserRepository users, JobRepository jobs, ProjectRepository projects,
            PaymentRepository payments, TalentReportRepository reports,
            AdminAuditLogRepository audits, DashboardService dashboard) {
        this.users = users;
        this.jobs = jobs;
        this.projects = projects;
        this.payments = payments;
        this.reports = reports;
        this.audits = audits;
        this.dashboard = dashboard;
    }

    private void audit(Authentication actor, String action, String target, Long id, String details) {
        User admin = users.findByEmailIgnoreCase(actor.getName()).orElseThrow();
        if (admin.getRole() != Role.ADMIN) throw new IllegalArgumentException("Chỉ Admin có quyền kiểm duyệt.");
        AdminAuditLog log = new AdminAuditLog();
        log.setActorId(admin.getId());
        log.setActorEmail(admin.getEmail());
        log.setAction(action);
        log.setTargetType(target);
        log.setTargetId(id);
        log.setDetails(details == null ? "" : details.substring(0, Math.min(details.length(), 600)));
        audits.save(log);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "projects") String metric,
            @RequestParam(defaultValue = "status") String pieMode) {
        var range = dashboard.normalizeRange(from, to);
        User admin = users.findByRoleOrderByCreatedAtDesc(Role.ADMIN).stream().findFirst().orElse(null);
        List<ChartPoint> bars = dashboard.bar(admin, range.from(), range.to(), metric);
        List<PieSlice> pie = dashboard.pie(admin, range.from(), range.to(), pieMode);

        Map<String, Object> stats = new LinkedHashMap<>(dashboard.adminStats());
        stats.put("freelancers", users.findByRoleOrderByCreatedAtDesc(Role.FREELANCER).size());
        stats.put("customers", users.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER).size());
        stats.put("openJobs", jobs.countByStatus(JobStatus.OPEN));
        stats.put("disputes", projects.countByStatus(ProjectStatus.DISPUTED));
        stats.put("pendingReports", reports.findAll().stream().filter(r -> "PENDING".equals(r.getStatus())).count());
        stats.put("completed", projects.countByStatus(ProjectStatus.COMPLETED));
        stats.put("locked", users.findAll().stream().filter(u -> Boolean.TRUE.equals(u.getLocked())).count());

        Map<String, Object> res = new HashMap<>();
        res.put("stats", stats);
        res.put("latestUsers", users.findAll().stream().filter(u -> u.getCreatedAt() != null)
                .sorted(Comparator.comparing(User::getCreatedAt).reversed()).limit(7).toList());
        res.put("latestReports", reports.findAllByOrderByCreatedAtDesc().stream().limit(5).toList());
        res.put("barData", bars);
        res.put("pieData", pie);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/users")
    public ResponseEntity<?> users(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "all") String state) {
        String nq = q == null ? "" : q.strip().toLowerCase(Locale.ROOT);
        Predicate<User> byState = u -> switch (state) {
            case "locked" -> Boolean.TRUE.equals(u.getLocked());
            case "active" -> Boolean.TRUE.equals(u.getEnabled()) && !Boolean.TRUE.equals(u.getLocked());
            case "unverified" -> !Boolean.TRUE.equals(u.getEnabled());
            default -> true;
        };
        var all = users.findAll().stream()
                .filter(u -> role == null || u.getRole() == role)
                .filter(byState)
                .filter(u -> nq.isEmpty() || (u.getFullName() + " " + u.getEmail() + " " + u.getCompanyName()).toLowerCase(Locale.ROOT).contains(nq))
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(all);
    }

    @Transactional
    @PostMapping("/users/{id}/lock")
    public ResponseEntity<?> lockUser(
            @PathVariable Long id,
            @RequestParam boolean locked,
            Authentication actor) {
        User u = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng."));
        if (u.getRole() == Role.ADMIN) throw new IllegalArgumentException("Không thể khóa tài khoản Admin.");
        u.setLocked(locked);
        users.save(u);
        audit(actor, locked ? "LOCK_USER" : "UNLOCK_USER", "USER", id, u.getEmail());
        return ResponseEntity.ok(Map.of("message", locked ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản."));
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> jobs(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) JobStatus status) {
        String nq = q == null ? "" : q.strip().toLowerCase(Locale.ROOT);
        var all = jobs.findAll().stream()
                .filter(j -> status == null || j.getStatus() == status)
                .filter(j -> nq.isEmpty() || (j.getTitle() + " " + j.getCategory() + " " + j.getCustomer().getFullName()).toLowerCase(Locale.ROOT).contains(nq))
                .sorted(Comparator.comparing(Job::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(all);
    }

    @Transactional
    @PostMapping("/jobs/{id}/status")
    public ResponseEntity<?> changeJobStatus(
            @PathVariable Long id,
            @RequestParam JobStatus status,
            Authentication actor) {
        Job j = jobs.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy công việc."));
        JobStatus old = j.getStatus();
        if (status == JobStatus.PAUSED && old != JobStatus.OPEN) throw new IllegalArgumentException("Chỉ tạm ẩn công việc đang mở.");
        if (status == JobStatus.OPEN && old != JobStatus.PAUSED) throw new IllegalArgumentException("Chỉ mở lại công việc tạm ẩn.");
        j.setStatus(status);
        if (status == JobStatus.PAUSED) j.setFeatured(false);
        jobs.save(j);
        audit(actor, "JOB_STATUS", "JOB", id, old + " -> " + status);
        return ResponseEntity.ok(Map.of("message", status == JobStatus.PAUSED ? "Đã tạm ẩn tin tuyển dụng." : "Đã mở lại tin tuyển dụng."));
    }

    @Transactional
    @PostMapping("/jobs/{id}/flags")
    public ResponseEntity<?> jobFlags(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean featured,
            @RequestParam(defaultValue = "false") boolean verified,
            Authentication actor) {
        Job job = jobs.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tin."));
        if (job.getStatus() != JobStatus.OPEN && featured) throw new IllegalArgumentException("Tin nổi bật phải đang mở.");
        job.setFeatured(featured);
        job.setVerified(verified);
        jobs.save(job);
        audit(actor, "JOB_MODERATION", "JOB", id, "Nổi bật: " + featured + ", duyệt nội dung: " + verified);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái kiểm duyệt tin."));
    }

    @GetMapping("/projects")
    public ResponseEntity<?> projects(@RequestParam(required = false) ProjectStatus status) {
        var all = projects.findAll().stream()
                .filter(p -> status == null || p.getStatus() == status)
                .sorted(Comparator.comparing(Project::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/payments")
    public ResponseEntity<?> payments() {
        var all = payments.findAll().stream()
                .sorted(Comparator.comparing(Payment::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        BigDecimal paid = all.stream().filter(p -> p.getStatus() == PaymentStatus.PAID || p.getStatus() == PaymentStatus.DISBURSED)
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal disbursed = all.stream().filter(p -> p.getStatus() == PaymentStatus.DISBURSED)
                .map(Payment::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> res = new HashMap<>();
        res.put("payments", all);
        res.put("paidTotal", paid);
        res.put("disbursedTotal", disbursed);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/reports")
    public ResponseEntity<?> reports(@RequestParam(defaultValue = "all") String status) {
        var all = reports.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> "all".equals(status) || r.getStatus().equals(status))
                .toList();
        return ResponseEntity.ok(all);
    }

    @Transactional
    @PostMapping("/reports/{id}/review")
    public ResponseEntity<?> reviewReport(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String note,
            Authentication actor) {
        if (!Set.of("REVIEWED", "RESOLVED", "REJECTED").contains(status)) {
            throw new IllegalArgumentException("Trạng thái xử lý không hợp lệ.");
        }
        TalentReport r = reports.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy báo cáo."));
        r.setStatus(status);
        r.setAdminNote(note == null ? null : note.strip());
        reports.save(r);
        audit(actor, "REPORT_REVIEW", "REPORT", id, status + ": " + note);
        return ResponseEntity.ok(Map.of("message", "Đã lưu kết quả xử lý báo cáo."));
    }

    @GetMapping("/disputes")
    public ResponseEntity<?> disputes() {
        var disputeList = projects.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.DISPUTED)
                .sorted(Comparator.comparing(Project::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(disputeList);
    }

    @Transactional
    @PostMapping("/disputes/{id}/resolve")
    public ResponseEntity<?> resolveDispute(
            @PathVariable Long id,
            @RequestParam boolean approveDemoRefund,
            @RequestParam String note,
            Authentication actor) {
        Project p = projects.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy dự án."));
        if (p.getStatus() != ProjectStatus.DISPUTED) {
            throw new IllegalArgumentException("Dự án không còn tranh chấp đang xử lý.");
        }
        var related = payments.findByProjectOrderByCreatedAtDesc(p);
        if (approveDemoRefund) {
            for (Payment pay : related) {
                if (pay.getStatus() == PaymentStatus.PAID) {
                    pay.setStatus(PaymentStatus.REFUNDED);
                    payments.save(pay);
                }
            }
            p.setStatus(ProjectStatus.CANCELLED);
        } else {
            p.setStatus(ProjectStatus.IN_PROGRESS);
        }
        projects.save(p);
        audit(actor, approveDemoRefund ? "DISPUTE_CANCEL_REFUND_DEMO" : "DISPUTE_CONTINUE", "PROJECT", id, note);
        return ResponseEntity.ok(Map.of("message", "Đã kết luận xử lý tranh chấp."));
    }

    @GetMapping("/audit")
    public ResponseEntity<?> auditLog() {
        var all = audits.findAll().stream()
                .sorted(Comparator.comparing(AdminAuditLog::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        return ResponseEntity.ok(all);
    }
}
