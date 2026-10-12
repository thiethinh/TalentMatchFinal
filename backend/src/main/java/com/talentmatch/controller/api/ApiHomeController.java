package com.talentmatch.controller.api;

import com.talentmatch.model.JobStatus;
import com.talentmatch.model.Role;
import com.talentmatch.model.User;
import com.talentmatch.repository.JobRepository;
import com.talentmatch.repository.UserRepository;
import com.talentmatch.service.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiHomeController {

    private final JobService jobService;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public ApiHomeController(JobService jobService, UserRepository userRepository, JobRepository jobRepository) {
        this.jobService = jobService;
        this.userRepository = userRepository;
        this.jobRepository = jobRepository;
    }

    @GetMapping("/home/overview")
    public ResponseEntity<?> overview() {
        var featuredJobs = jobService.search(null, null, null, null, null, null, null).stream().limit(4).toList();
        Map<Long, Long> proposalCounts = new HashMap<>();
        featuredJobs.forEach(job -> proposalCounts.put(job.getId(), (long) jobService.applicants(job).size()));

        Map<String, Object> res = new HashMap<>();
        res.put("featuredJobs", featuredJobs);
        res.put("proposalCounts", proposalCounts);
        res.put("featuredFreelancers", jobService.freelancers(null).stream().limit(4).toList());
        res.put("freelancerCount", userRepository.findByRoleOrderByCreatedAtDesc(Role.FREELANCER).size());
        res.put("customerCount", userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER).size());
        res.put("openJobCount", jobRepository.countByStatus(JobStatus.OPEN));
        return ResponseEntity.ok(res);
    }

    @GetMapping("/freelancers")
    public ResponseEntity<?> freelancers(@RequestParam(required = false) String q) {
        List<User> list = jobService.freelancers(q);
        Map<String, Object> res = new HashMap<>();
        res.put("freelancers", list);
        res.put("total", list.size());
        res.put("q", q);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/freelancers/{id}")
    public ResponseEntity<?> freelancerProfile(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Freelancer."));
        if (u.getRole() != Role.FREELANCER || Boolean.TRUE.equals(u.getLocked())) {
            throw new IllegalArgumentException("Hồ sơ Freelancer không khả dụng.");
        }
        return ResponseEntity.ok(u);
    }
}
