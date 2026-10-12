package com.talentmatch.controller.api;

import com.talentmatch.dto.ChartPoint;
import com.talentmatch.dto.PieSlice;
import com.talentmatch.model.*;
import com.talentmatch.repository.*;
import com.talentmatch.service.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/customer")
public class ApiCustomerController {

    private final UserService users;
    private final JobService jobs;
    private final ProjectService projects;
    private final PaymentService payments;
    private final DashboardService dashboard;
    private final JobRepository jobRepository;
    private final UserRepository userRepo;
    private final JobInvitationRepository invites;
    private final JobQuestionRepository questions;

    public ApiCustomerController(
            UserService users, JobService jobs, ProjectService projects,
            PaymentService payments, DashboardService dashboard,
            JobRepository jobRepository, UserRepository userRepo,
            JobInvitationRepository invites, JobQuestionRepository questions) {
        this.users = users;
        this.jobs = jobs;
        this.projects = projects;
        this.payments = payments;
        this.dashboard = dashboard;
        this.jobRepository = jobRepository;
        this.userRepo = userRepo;
        this.invites = invites;
        this.questions = questions;
    }

    private User me(Authentication auth) {
        return users.byEmail(auth.getName());
    }

    private Job ownedJob(Long id, User u) {
        Job j = jobs.get(id);
        if (!j.getCustomer().getId().equals(u.getId())) {
            throw new IllegalArgumentException("Bạn không sở hữu công việc này.");
        }
        return j;
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
        res.put("stats", dashboard.customerStats(u));
        res.put("recentJobs", jobRepository.findByCustomerOrderByCreatedAtDesc(u).stream().limit(5).toList());
        res.put("recentProjects", projects.forCustomer(u).stream().limit(5).toList());
        res.put("barData", bars);
        res.put("pieData", pie);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication auth) {
        return ResponseEntity.ok(me(auth));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Authentication auth, @RequestBody User profile) {
        try {
            User updated = users.updateProfile(auth.getName(), profile);
            return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ thành công.", "user", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> jobs(Authentication auth, @RequestParam(defaultValue = "ALL") String status) {
        User u = me(auth);
        List<Job> all = jobRepository.findByCustomerOrderByCreatedAtDesc(u);
        List<Job> filtered = all;
        if (!"ALL".equalsIgnoreCase(status)) {
            try {
                JobStatus target = JobStatus.valueOf(status.toUpperCase());
                filtered = all.stream().filter(j -> j.getStatus() == target).toList();
            } catch (Exception ignored) {}
        }

        Map<Long, Long> applicantCounts = new HashMap<>();
        all.forEach(j -> applicantCounts.put(j.getId(), (long) jobs.applicants(j).size()));

        Map<String, Object> res = new HashMap<>();
        res.put("jobs", filtered);
        res.put("applicantCounts", applicantCounts);
        res.put("allCount", all.size());
        res.put("openCount", all.stream().filter(j -> j.getStatus() == JobStatus.OPEN).count());
        res.put("pausedCount", all.stream().filter(j -> j.getStatus() == JobStatus.PAUSED).count());
        res.put("closedCount", all.stream().filter(j -> j.getStatus() == JobStatus.CLOSED).count());
        res.put("cancelledCount", all.stream().filter(j -> j.getStatus() == JobStatus.CANCELLED).count());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<?> getJob(@PathVariable Long id, Authentication auth) {
        Job j = ownedJob(id, me(auth));
        return ResponseEntity.ok(j);
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> createJob(Authentication auth, @RequestBody Job form) {
        try {
            User u = me(auth);
            form.setId(null);
            form.setCustomer(u);
            form.setStatus(JobStatus.OPEN);
            validateJob(form);
            Job saved = jobs.save(form);
            return ResponseEntity.ok(Map.of("message", "Đăng công việc thành công.", "jobId", saved.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, Authentication auth, @RequestBody Job form) {
        try {
            Job j = ownedJob(id, me(auth));
            if (j.getStatus() == JobStatus.CLOSED || j.getStatus() == JobStatus.CANCELLED) {
                throw new IllegalArgumentException("Không thể sửa công việc đã đóng hoặc hủy.");
            }
            j.setTitle(form.getTitle());
            j.setCategory(form.getCategory());
            j.setDescription(form.getDescription());
            j.setRequiredSkills(form.getRequiredSkills());
            j.setBudget(form.getBudget());
            j.setPriceType(form.getPriceType());
            j.setDeadline(form.getDeadline());
            j.setWorkType(form.getWorkType());
            j.setExperienceLevel(form.getExperienceLevel());
            j.setAcceptanceCriteria(form.getAcceptanceCriteria());
            j.setEstimatedDurationDays(form.getEstimatedDurationDays());
            validateJob(j);
            jobs.save(j);
            return ResponseEntity.ok(Map.of("message", "Cập nhật công việc thành công."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/jobs/{id}/status")
    public ResponseEntity<?> changeJobStatus(@PathVariable Long id, @RequestParam JobStatus status, Authentication auth) {
        try {
            Job j = ownedJob(id, me(auth));
            if (status == JobStatus.CLOSED && jobs.applicants(j).stream().noneMatch(a -> a.getStatus() == ApplicationStatus.ACCEPTED)) {
                throw new IllegalArgumentException("Hãy chọn Freelancer trước khi đóng tuyển theo luồng dự án, hoặc dùng PAUSED/CANCELLED.");
            }
            j.setStatus(status);
            jobs.save(j);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái công việc."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/jobs/{id}/applicants")
    public ResponseEntity<?> jobApplicants(@PathVariable Long id, Authentication auth) {
        Job j = ownedJob(id, me(auth));
        List<JobApplication> apps = jobs.applicants(j);
        return ResponseEntity.ok(Map.of("job", j, "applications", apps));
    }

    @GetMapping("/applicants")
    public ResponseEntity<?> allApplicants(Authentication auth) {
        User u = me(auth);
        List<Job> all = jobRepository.findByCustomerOrderByCreatedAtDesc(u);
        List<JobApplication> rows = all.stream()
                .flatMap(job -> jobs.applicants(job).stream())
                .sorted(Comparator.comparing(JobApplication::getCreatedAt).reversed())
                .toList();
        return ResponseEntity.ok(Map.of("applications", rows, "jobs", all));
    }

    @PostMapping("/applications/{id}/shortlist")
    public ResponseEntity<?> shortlist(@PathVariable Long id, @RequestParam boolean value, Authentication auth) {
        try {
            projects.shortlist(id, me(auth), value);
            return ResponseEntity.ok(Map.of("message", value ? "Đã đưa ứng viên vào danh sách ưu tiên." : "Đã từ chối ứng viên."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/applications/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id, Authentication auth) {
        try {
            Project p = projects.acceptApplication(id, me(auth));
            return ResponseEntity.ok(Map.of("message", "Đã chọn Freelancer. Dự án đã được tạo thành công.", "projectId", p.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/talent")
    public ResponseEntity<?> talent(
            Authentication auth,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String field,
            @RequestParam(required = false) Integer minExperience,
            @RequestParam(required = false) Long jobId) {
        User u = me(auth);
        List<Job> mine = jobRepository.findByCustomerOrderByCreatedAtDesc(u);
        Job selected = jobId == null ? null : ownedJob(jobId, u);

        List<Map<String, Object>> options = new ArrayList<>();
        String nq = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        String nf = field == null ? "" : field.trim().toLowerCase(Locale.ROOT);

        for (User f : userRepo.findByRoleAndLockedFalseOrderByCreatedAtDesc(Role.FREELANCER)) {
            if (!Boolean.TRUE.equals(f.getEnabled())) continue;
            String text = (f.getFullName() + " " + f.getSkills() + " " + f.getProfessionalTitle()).toLowerCase(Locale.ROOT);
            if (!nq.isEmpty() && !text.contains(nq)) continue;
            if (!nf.isEmpty() && (f.getField() == null || !f.getField().toLowerCase(Locale.ROOT).contains(nf))) continue;
            if (minExperience != null && (f.getExperienceYears() == null || f.getExperienceYears() < minExperience)) continue;

            int score = 0;
            List<String> why = new ArrayList<>();
            if (selected != null) {
                Set<String> target = new HashSet<>();
                if (selected.getRequiredSkills() != null) {
                    for (String s : selected.getRequiredSkills().split(",")) if (!s.trim().isEmpty()) target.add(s.trim().toLowerCase(Locale.ROOT));
                }
                String skills = f.getSkills() == null ? "" : f.getSkills().toLowerCase(Locale.ROOT);
                int matches = 0;
                for (String sk : target) if (skills.contains(sk)) matches++;
                if (matches > 0) {
                    score += Math.min(55, (int) Math.round(55.0 * matches / Math.max(1, target.size())));
                    why.add("Khớp " + matches + "/" + target.size() + " kỹ năng");
                }
                if (selected.getCategory() != null && selected.getCategory().equalsIgnoreCase(f.getField())) {
                    score += 20;
                    why.add("Đúng lĩnh vực");
                }
                int years = f.getExperienceYears() == null ? 0 : f.getExperienceYears();
                if (years >= 5) { score += 10; why.add("Từ 5 năm kinh nghiệm"); }
                else if (years >= 2) { score += 6; why.add("Kinh nghiệm phù hợp"); }
                if (Boolean.TRUE.equals(f.getAvailable())) { score += 5; why.add("Sẵn sàng nhận việc"); }
            } else {
                score = (Boolean.TRUE.equals(f.getAvailable()) ? 20 : 0) + (int) Math.min(40, Math.max(0, Optional.ofNullable(f.getExperienceYears()).orElse(0)) * 8);
                why.add("Chọn công việc để có điểm phù hợp cụ thể");
            }

            Map<String, Object> row = new HashMap<>();
            row.put("user", f);
            row.put("score", score);
            row.put("reason", String.join(" · ", why));
            options.add(row);
        }
        options.sort((x, y) -> Integer.compare((int) y.get("score"), (int) x.get("score")));

        Map<String, Object> res = new HashMap<>();
        res.put("suggestions", options);
        res.put("jobs", mine);
        res.put("selectedJob", selected);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/invitations")
    public ResponseEntity<?> invite(
            Authentication auth,
            @RequestBody Map<String, Object> body) {
        try {
            User u = me(auth);
            Long jobId = Long.valueOf(body.get("jobId").toString());
            Long freelancerId = Long.valueOf(body.get("freelancerId").toString());
            String message = (String) body.get("message");

            Job job = ownedJob(jobId, u);
            if (job.getStatus() != JobStatus.OPEN) {
                throw new IllegalArgumentException("Chỉ được mời vào công việc đang tuyển.");
            }
            User f = userRepo.findById(freelancerId).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Freelancer."));
            if (f.getRole() != Role.FREELANCER || Boolean.TRUE.equals(f.getLocked())) {
                throw new IllegalArgumentException("Freelancer không khả dụng.");
            }
            JobInvitation i = invites.findByJobAndFreelancer(job, f).orElseGet(JobInvitation::new);
            if (i.getId() != null && "ACCEPTED".equals(i.getStatus())) {
                throw new IllegalArgumentException("Freelancer đã đồng ý lời mời.");
            }
            i.setJob(job);
            i.setCustomer(u);
            i.setFreelancer(f);
            i.setStatus("SENT");
            i.setMessage(message == null ? "Mời bạn xem công việc và gửi Proposal." : message.trim());
            invites.save(i);
            return ResponseEntity.ok(Map.of("message", "Đã gửi lời mời đến " + f.getFullName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/invitations")
    public ResponseEntity<?> myInvites(Authentication auth) {
        return ResponseEntity.ok(invites.findByCustomerOrderByCreatedAtDesc(me(auth)));
    }

    @GetMapping("/projects")
    public ResponseEntity<?> myProjects(Authentication auth) {
        return ResponseEntity.ok(projects.forCustomer(me(auth)));
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(Authentication auth) {
        User u = me(auth);
        Map<String, Object> res = new HashMap<>();
        res.put("jobs", jobRepository.findByCustomerOrderByCreatedAtDesc(u));
        res.put("projects", projects.forCustomer(u));
        res.put("payments", payments.history(u));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/questions/{id}/answer")
    public ResponseEntity<?> answerQuestion(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        JobQuestion q = questions.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy câu hỏi."));
        try {
            ownedJob(q.getJob().getId(), me(auth));
            String text = body.get("text");
            if (text == null || text.trim().length() < 5) {
                throw new IllegalArgumentException("Câu trả lời cần ít nhất 5 ký tự.");
            }
            q.setAnswer(text.trim());
            q.setAnsweredAt(LocalDateTime.now());
            questions.save(q);
            return ResponseEntity.ok(Map.of("message", "Đã trả lời công khai.", "question", q));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private void validateJob(Job j) {
        if (j.getTitle() == null || j.getTitle().trim().length() < 5)
            throw new IllegalArgumentException("Tên công việc phải có ít nhất 5 ký tự.");
        if (j.getCategory() == null || j.getCategory().isBlank())
            throw new IllegalArgumentException("Vui lòng chọn lĩnh vực.");
        if (j.getDescription() == null || j.getDescription().trim().length() < 30)
            throw new IllegalArgumentException("Mô tả công việc nên có ít nhất 30 ký tự.");
        if (j.getBudget() == null || j.getBudget().signum() <= 0)
            throw new IllegalArgumentException("Ngân sách phải lớn hơn 0.");
        if (j.getDeadline() != null && j.getDeadline().isBefore(LocalDate.now()))
            throw new IllegalArgumentException("Deadline không được ở quá khứ.");
    }
}
