package com.talentmatch.controller.api;

import com.talentmatch.model.*;
import com.talentmatch.repository.JobQuestionRepository;
import com.talentmatch.service.JobService;
import com.talentmatch.service.UserService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/jobs")
public class ApiJobController {

    private static final List<String> WORK_TYPES = List.of("REMOTE", "HYBRID", "ONSITE");
    private static final List<String> LEVELS = List.of("INTERN", "FRESHER", "JUNIOR", "MIDDLE", "SENIOR");
    private static final List<String> CATEGORIES = List.of(
            "Hành chính & Nhân sự", "Khác", "Kỹ thuật & Kiến trúc", "Luật & Pháp lý",
            "Lập trình & CNTT", "Marketing & Bán hàng", "Thiết kế & Sáng tạo",
            "Tài chính & Kế toán", "Viết lách & Nội dung", "Đào tạo & Giáo dục"
    );

    private final JobService jobs;
    private final UserService users;
    private final JobQuestionRepository questions;

    public ApiJobController(JobService jobs, UserService users, JobQuestionRepository questions) {
        this.jobs = jobs;
        this.users = users;
        this.questions = questions;
    }

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate deadline,
            @RequestParam(required = false) List<String> workType,
            @RequestParam(required = false) List<String> level,
            @RequestParam(required = false) String duration,
            @RequestParam(defaultValue = "false") boolean featuredOnly,
            @RequestParam(defaultValue = "false") boolean verifiedOnly,
            @RequestParam(defaultValue = "false") boolean escrowOnly,
            @RequestParam(defaultValue = "false") boolean savedOnly,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {

        String chosenSort = normalizeSort(sort);
        List<String> selectedWorkTypes = sanitize(workType, WORK_TYPES);
        List<String> selectedLevels = sanitize(level, LEVELS);

        Set<Long> savedIds = new HashSet<>();
        Map<Long, String> applicationStates = new HashMap<>();
        User currentUser = null;
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            currentUser = users.byEmail(auth.getName());
            if (currentUser.getRole() == Role.FREELANCER) {
                jobs.saved(currentUser).forEach(s -> savedIds.add(s.getJob().getId()));
                jobs.applications(currentUser).forEach(a -> applicationStates.put(a.getJob().getId(), a.getStatus().name()));
            }
        }
        final User freelancer = currentUser != null && currentUser.getRole() == Role.FREELANCER ? currentUser : null;

        List<Job> allOpen = jobs.searchAdvanced(null, null, null, null, null, null, List.of(), List.of(), "latest");
        List<Job> filtered = new ArrayList<>(jobs.searchAdvanced(q, category, skill, minBudget, maxBudget,
                deadline, selectedWorkTypes, selectedLevels, chosenSort));

        filtered.removeIf(j -> (featuredOnly && !j.isFeatured()) || (verifiedOnly && !j.isVerified())
                || (escrowOnly && !j.isEscrowFunded()) || (savedOnly && !savedIds.contains(j.getId()))
                || !matchesDuration(j.getEstimatedDurationDays(), duration));

        if ("match_desc".equals(chosenSort) && freelancer != null) {
            filtered.sort(Comparator.comparingInt((Job j) -> matchScore(freelancer, j)).reversed()
                    .thenComparing(Job::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        int totalItems = filtered.size();
        int totalPages = Math.max(1, (int) Math.ceil((double) totalItems / size));
        int currentPage = Math.min(totalPages, Math.max(1, page));
        int from = Math.min((currentPage - 1) * size, totalItems);
        List<Job> pageJobs = filtered.subList(from, Math.min(from + size, totalItems));

        List<Map<String, Object>> items = new ArrayList<>();
        for (Job j : pageJobs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", j.getId());
            item.put("title", j.getTitle());
            item.put("category", j.getCategory());
            item.put("description", j.getDescription());
            item.put("requiredSkills", j.getRequiredSkills());
            item.put("budget", j.getBudget());
            item.put("priceType", j.getPriceType());
            item.put("deadline", j.getDeadline());
            item.put("estimatedDurationDays", j.getEstimatedDurationDays());
            item.put("featured", j.isFeatured());
            item.put("verified", j.isVerified());
            item.put("workType", j.getWorkType());
            item.put("experienceLevel", j.getExperienceLevel());
            item.put("escrowFunded", j.isEscrowFunded());
            item.put("status", j.getStatus().name());
            item.put("createdAt", j.getCreatedAt());
            item.put("postedAgo", relativeTime(j.getCreatedAt()));
            item.put("proposalCount", jobs.applicationCount(j));
            item.put("daysLeft", j.getDeadline() == null ? 0 : Math.max(0,
                    java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), j.getDeadline())));
            item.put("matchScore", freelancer == null ? 0 : matchScore(freelancer, j));
            item.put("isSaved", savedIds.contains(j.getId()));
            item.put("applicationStatus", applicationStates.get(j.getId()));
            if (j.getCustomer() != null) {
                item.put("customerName", j.getCustomer().getCompanyName() != null ? j.getCustomer().getCompanyName() : j.getCustomer().getFullName());
                item.put("customerLocation", j.getCustomer().getLocation());
            }
            items.add(item);
        }

        Map<String, Long> categoryCounts = new LinkedHashMap<>();
        for (String c : CATEGORIES) {
            categoryCounts.put(c, allOpen.stream().filter(j -> c.equals(j.getCategory())).count());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("items", items);
        response.put("currentPage", currentPage);
        response.put("totalPages", totalPages);
        response.put("totalItems", totalItems);
        response.put("allJobsCount", allOpen.size());
        response.put("categories", CATEGORIES);
        response.put("categoryCounts", categoryCounts);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable Long id, Authentication auth) {
        Job job = jobs.get(id);

        boolean isSaved = false;
        boolean hasApplied = false;
        JobApplication currentApp = null;
        int score = 0;

        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            User u = users.byEmail(auth.getName());
            if (u.getRole() == Role.FREELANCER) {
                isSaved = jobs.isSaved(job, u);
                Optional<JobApplication> app = jobs.findApplication(job, u);
                if (app.isPresent()) {
                    hasApplied = true;
                    currentApp = app.get();
                }
                score = matchScore(u, job);
            }
        }

        List<Job> similarJobs = jobs.searchAdvanced(
                        null, job.getCategory(), null, null, null, null,
                        List.of(), List.of(), "latest")
                .stream()
                .filter(item -> !Objects.equals(item.getId(), job.getId()))
                .limit(3)
                .toList();

        Map<String, Object> res = new HashMap<>();
        res.put("job", job);
        res.put("isSaved", isSaved);
        res.put("hasApplied", hasApplied);
        res.put("currentApplication", currentApp);
        res.put("proposalCount", jobs.applicationCount(job));
        res.put("postedAgo", relativeTime(job.getCreatedAt()));
        res.put("daysLeft", job.getDeadline() == null ? 0 : Math.max(0,
                java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), job.getDeadline())));
        res.put("matchScore", score);
        res.put("similarJobs", similarJobs);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<?> saveJob(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để lưu công việc."));
        }
        User u = users.byEmail(auth.getName());
        boolean now = jobs.toggleSaved(jobs.get(id), u);
        return ResponseEntity.ok(Map.of("saved", now, "message", now ? "Đã lưu công việc." : "Đã bỏ lưu công việc."));
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> apply(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để ứng tuyển."));
        }
        try {
            User u = users.byEmail(auth.getName());
            String proposal = (String) body.get("proposal");
            BigDecimal price = new BigDecimal(body.get("proposedPrice").toString());
            Integer estimatedDays = Integer.parseInt(body.get("estimatedDays").toString());
            String portfolioLink = (String) body.get("portfolioLink");

            JobApplication app = jobs.apply(jobs.get(id), u, proposal, price, estimatedDays, portfolioLink);
            return ResponseEntity.ok(Map.of("message", "Ứng tuyển thành công.", "applicationId", app.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/discussion")
    public ResponseEntity<?> getDiscussion(@PathVariable Long id) {
        Job job = jobs.get(id);
        List<JobQuestion> list = questions.findByJobOrderByCreatedAtDesc(job);
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/discussion")
    public ResponseEntity<?> askQuestion(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Vui lòng đăng nhập để gửi câu hỏi."));
        }
        User u = users.byEmail(auth.getName());
        Job job = jobs.get(id);
        if (u.getRole() != Role.FREELANCER || job.getStatus() != JobStatus.OPEN) {
            return ResponseEntity.badRequest().body(Map.of("message", "Chỉ Freelancer được hỏi về công việc đang tuyển."));
        }
        String text = body.get("text");
        if (text == null || text.trim().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Câu hỏi cần ít nhất 8 ký tự."));
        }
        JobQuestion q = new JobQuestion();
        q.setJob(job);
        q.setAuthor(u);
        q.setQuestion(text.trim());
        questions.save(q);
        return ResponseEntity.ok(Map.of("message", "Đã gửi câu hỏi.", "question", q));
    }

    private boolean matchesDuration(Integer days, String duration) {
        if (duration == null || duration.isBlank()) return true;
        if (days == null || days <= 0) return false;
        return switch (duration) {
            case "under7" -> days <= 7;
            case "7to14" -> days >= 8 && days <= 14;
            case "15to30" -> days >= 15 && days <= 30;
            case "over30" -> days > 30;
            default -> true;
        };
    }

    private List<String> sanitize(List<String> input, List<String> allowed) {
        if (input == null) return List.of();
        return input.stream().filter(allowed::contains).distinct().toList();
    }

    private String normalizeSort(String sort) {
        return switch (sort == null ? "" : sort) {
            case "budget_desc", "budget_asc", "competition_asc", "deadline_asc", "match_desc" -> sort;
            default -> "latest";
        };
    }

    private int matchScore(User freelancer, Job job) {
        if (freelancer == null || job == null) return 0;
        int score = 0;
        if (freelancer.getField() != null && job.getCategory() != null
                && freelancer.getField().trim().equalsIgnoreCase(job.getCategory().trim())) {
            score += 35;
        }
        Set<String> freelancerSkills = skillTokens(freelancer.getSkills());
        Set<String> jobSkills = skillTokens(job.getRequiredSkills());
        int overlap = 0;
        for (String skill : freelancerSkills) if (jobSkills.contains(skill)) overlap++;
        score += Math.min(45, overlap * 15);

        int years = freelancer.getExperienceYears() == null ? 0 : freelancer.getExperienceYears();
        String level = job.getExperienceLevel() == null ? "" : job.getExperienceLevel().toUpperCase(Locale.ROOT);
        boolean experienceFits = switch (level) {
            case "INTERN", "FRESHER" -> true;
            case "JUNIOR" -> years >= 1;
            case "MIDDLE", "INTERMEDIATE" -> years >= 3;
            case "SENIOR", "EXPERT" -> years >= 5;
            default -> true;
        };
        if (experienceFits) score += 10;
        if ("REMOTE".equalsIgnoreCase(job.getWorkType())) score += 5;
        return Math.min(95, Math.max(0, score));
    }

    private Set<String> skillTokens(String raw) {
        if (raw == null || raw.isBlank()) return Set.of();
        Set<String> result = new HashSet<>();
        for (String token : raw.split("[,;/]")) {
            String norm = token.trim().toLowerCase(Locale.ROOT);
            if (!norm.isBlank()) result.add(norm);
        }
        return result;
    }

    private String relativeTime(LocalDateTime createdAt) {
        if (createdAt == null) return "Vừa đăng";
        long minutes = Math.max(0, java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes());
        if (minutes < 1) return "Vừa đăng";
        if (minutes < 60) return minutes + " phút trước";
        long hours = minutes / 60;
        if (hours < 24) return hours + " giờ trước";
        long days = hours / 24;
        if (days < 30) return days + " ngày trước";
        return (days / 30) + " tháng trước";
    }
}
