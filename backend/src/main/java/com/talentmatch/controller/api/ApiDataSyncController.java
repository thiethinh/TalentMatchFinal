package com.talentmatch.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ApiDataSyncController {

    private final JdbcTemplate jdbc;

    public ApiDataSyncController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * 1. GET /api/users: Lấy toàn bộ người dùng từ bảng users kèm tài khoản ngân hàng từ DB
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        String userSql = "SELECT * FROM users ORDER BY id ASC";
        List<Map<String, Object>> userRows = jdbc.queryForList(userSql);

        String bankSql = "SELECT * FROM user_bank_accounts ORDER BY id ASC";
        List<Map<String, Object>> bankRows = jdbc.queryForList(bankSql);

        Map<Long, List<Map<String, Object>>> banksByUser = new HashMap<>();
        for (Map<String, Object> b : bankRows) {
            Long uid = ((Number) b.get("user_id")).longValue();
            banksByUser.computeIfAbsent(uid, k -> new ArrayList<>()).add(Map.of(
                    "id", "ba-" + b.get("id"),
                    "bankName", b.get("bank_name") != null ? b.get("bank_name") : "",
                    "bankCode", b.get("bank_code") != null ? b.get("bank_code") : "",
                    "accountNumber", b.get("account_number") != null ? b.get("account_number") : "",
                    "accountHolder", b.get("account_holder") != null ? b.get("account_holder") : "",
                    "isDefault", Boolean.TRUE.equals(b.get("is_default")) || (b.get("is_default") instanceof byte[] bytes && bytes.length > 0 && bytes[0] == 1)
            ));
        }

        List<Map<String, Object>> users = new ArrayList<>();
        for (Map<String, Object> u : userRows) {
            Long id = ((Number) u.get("id")).longValue();
            String roleStr = (String) u.get("role");
            String clientRole = "freelancer";
            if ("ADMIN".equalsIgnoreCase(roleStr)) clientRole = "admin";
            else if ("CUSTOMER".equalsIgnoreCase(roleStr)) clientRole = "employer";

            boolean emailVerified = isBitTrue(u.get("email_verified"));
            boolean isVerified = isBitTrue(u.get("is_verified"));

            Map<String, Object> userDto = new HashMap<>();
            userDto.put("id", "usr-" + (clientRole.equals("employer") ? "emp-" : (clientRole.equals("admin") ? "admin" : "free-")) + id);
            userDto.put("dbId", id);
            userDto.put("name", u.get("full_name"));
            userDto.put("email", u.get("email"));
            String rawAvatar = (String) u.get("avatar");
            String avatarVal = rawAvatar != null ? rawAvatar : "https://api.dicebear.com/7.x/identicon/svg?seed=" + u.get("email");
            String avatarUrl = (avatarVal.startsWith("http://") || avatarVal.startsWith("https://"))
                    ? avatarVal
                    : com.talentmatch.config.CloudinaryConfig.IMAGE_BASE_URL + avatarVal;
            userDto.put("avatar", avatarVal);
            userDto.put("avatarUrl", avatarUrl);
            userDto.put("role", clientRole);
            userDto.put("phone", u.get("phone") != null ? u.get("phone") : "");
            userDto.put("companyName", u.get("company_name"));
            userDto.put("taxCode", u.get("tax_code"));
            userDto.put("isVerified", isVerified);
            userDto.put("emailVerified", emailVerified);
            userDto.put("accountStatus", u.get("account_status") != null ? u.get("account_status") : "ACTIVE");
            userDto.put("kycStatus", u.get("kyc_status") != null ? u.get("kyc_status") : "NOT_SUBMITTED");
            userDto.put("balance", u.get("balance") != null ? ((Number) u.get("balance")).doubleValue() : 0.0);
            userDto.put("escrowBalance", u.get("escrow_balance") != null ? ((Number) u.get("escrow_balance")).doubleValue() : 0.0);
            userDto.put("talentCreditScore", u.get("talent_credit_score") != null ? ((Number) u.get("talent_credit_score")).intValue() : 850);
            userDto.put("talentCreditBadge", u.get("talent_credit_badge") != null ? u.get("talent_credit_badge") : "Bronze");
            userDto.put("rating", u.get("rating") != null ? ((Number) u.get("rating")).doubleValue() : 5.0);
            userDto.put("completedOrders", u.get("completed_projects") != null ? ((Number) u.get("completed_projects")).intValue() : 0);
            userDto.put("bankAccounts", banksByUser.getOrDefault(id, List.of()));
            userDto.put("createdAt", u.get("created_at") != null ? u.get("created_at").toString().split(" ")[0] : "2026-10-01");

            users.add(userDto);
        }

        return ResponseEntity.ok(users);
    }

    /**
     * 2. GET /api/proposals: Lấy toàn bộ đề xuất (job_applications) từ DB
     */
    @GetMapping("/proposals")
    public ResponseEntity<?> getAllProposals() {
        String sql = """
            SELECT a.*, j.title as job_title, u.full_name as freelancer_name, u.avatar as freelancer_avatar,
                   u.professional_title as freelancer_title, u.rating as freelancer_rating,
                   u.completed_projects as freelancer_completed, u.bio as freelancer_bio
            FROM job_applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN users u ON a.freelancer_id = u.id
            ORDER BY a.id ASC
        """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        List<Map<String, Object>> proposals = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> p = new HashMap<>();
            p.put("id", "prop-" + r.get("id"));
            p.put("projectId", "prj-" + r.get("job_id"));
            p.put("projectTitle", r.get("job_title"));
            p.put("freelancerId", "free-" + r.get("freelancer_id"));
            p.put("freelancerName", r.get("freelancer_name"));
            p.put("freelancerAvatar", r.get("freelancer_avatar"));
            p.put("freelancerTitle", r.get("freelancer_title") != null ? r.get("freelancer_title") : "Chuyên gia");
            p.put("freelancerRating", r.get("freelancer_rating") != null ? ((Number) r.get("freelancer_rating")).doubleValue() : 4.9);
            p.put("freelancerCompletedCount", r.get("freelancer_completed") != null ? ((Number) r.get("freelancer_completed")).intValue() : 20);
            p.put("freelancerBio", r.get("freelancer_bio") != null ? r.get("freelancer_bio") : "");
            p.put("freelancerPortfolioUrl", r.get("portfolio_link") != null ? r.get("portfolio_link") : "https://github.com");
            p.put("bidAmount", r.get("proposed_price") != null ? ((Number) r.get("proposed_price")).doubleValue() : 10000000.0);
            p.put("estimatedDays", r.get("estimated_days") != null ? ((Number) r.get("estimated_days")).intValue() : 14);
            p.put("coverLetter", r.get("proposal"));
            String rawStatus = r.get("status") != null ? r.get("status").toString() : "PENDING";
            if ("SUBMITTED".equalsIgnoreCase(rawStatus)) {
                rawStatus = "PENDING";
            }
            p.put("status", rawStatus);
            p.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString().split(" ")[0] : "2026-10-01");

            proposals.add(p);
        }
        return ResponseEntity.ok(proposals);
    }

    /**
     * 3. GET /api/orders: Lấy toàn bộ Hợp đồng / Dự án (projects) từ DB kèm Milestones và Deliveries
     */
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        String projectSql = """
            SELECT p.*, c.full_name as customer_name, c.avatar as customer_avatar,
                   f.full_name as freelancer_name, f.avatar as freelancer_avatar,
                   a.job_id as job_id
            FROM projects p
            JOIN users c ON p.customer_id = c.id
            JOIN users f ON p.freelancer_id = f.id
            JOIN job_applications a ON p.application_id = a.id
            ORDER BY p.id ASC
        """;
        List<Map<String, Object>> projectRows = jdbc.queryForList(projectSql);

        String msSql = "SELECT * FROM milestones ORDER BY id ASC";
        List<Map<String, Object>> msRows = jdbc.queryForList(msSql);
        Map<Long, List<Map<String, Object>>> msByProj = new HashMap<>();
        for (Map<String, Object> m : msRows) {
            Long pid = ((Number) m.get("project_id")).longValue();
            msByProj.computeIfAbsent(pid, k -> new ArrayList<>()).add(Map.of(
                    "id", "ms-" + m.get("id"),
                    "title", m.get("title") != null ? m.get("title") : "",
                    "description", m.get("description") != null ? m.get("description") : "",
                    "amount", m.get("amount") != null ? ((Number) m.get("amount")).doubleValue() : 0.0,
                    "dueDate", m.get("deadline") != null ? m.get("deadline").toString() : "2026-11-01",
                    "status", m.get("status") != null ? m.get("status") : "UNPAID"
            ));
        }

        String delSql = "SELECT * FROM project_deliveries ORDER BY id ASC";
        List<Map<String, Object>> delRows = jdbc.queryForList(delSql);
        Map<Long, List<Map<String, Object>>> delByProj = new HashMap<>();
        for (Map<String, Object> d : delRows) {
            Long pid = ((Number) d.get("project_id")).longValue();
            delByProj.computeIfAbsent(pid, k -> new ArrayList<>()).add(Map.of(
                    "id", "del-" + d.get("id"),
                    "fileName", d.get("file_name") != null ? d.get("file_name") : "Bàn giao",
                    "fileSize", d.get("file_size") != null ? d.get("file_size") : "10 MB",
                    "uploadedAt", d.get("submitted_at") != null ? d.get("submitted_at").toString() : "2026-10-01",
                    "note", d.get("note") != null ? d.get("note") : "",
                    "demoUrl", d.get("demo_url") != null ? d.get("demo_url") : ""
            ));
        }

        List<Map<String, Object>> orders = new ArrayList<>();
        for (Map<String, Object> pr : projectRows) {
            Long pid = ((Number) pr.get("id")).longValue();
            String sow = (String) pr.get("sow_requirements");
            List<String> sowList = sow != null ? Arrays.asList(sow.split(";")) : List.of("Theo yêu cầu hợp đồng");

            String status = (String) pr.get("status");
            String clientStatus = "ORDER_IN_PROGRESS";
            if ("COMPLETED".equalsIgnoreCase(status)) clientStatus = "COMPLETED";
            else if ("DELIVERED".equalsIgnoreCase(status)) clientStatus = "DELIVERED";
            else if ("DISPUTED".equalsIgnoreCase(status)) clientStatus = "DISPUTED";
            else if ("CANCELLED".equalsIgnoreCase(status)) clientStatus = "CANCELLED";

            Map<String, Object> ord = new HashMap<>();
            ord.put("id", "ord-" + pid);
            ord.put("orderNumber", pr.get("order_number") != null ? pr.get("order_number") : "TM-2026-00" + pid);
            ord.put("serviceTitle", pr.get("service_title") != null ? pr.get("service_title") : "Dự án Hợp đồng");
            ord.put("title", pr.get("service_title") != null ? pr.get("service_title") : "Dự án Hợp đồng");
            ord.put("projectId", "prj-" + pr.get("job_id"));
            ord.put("freelancerId", "free-" + pr.get("freelancer_id"));
            ord.put("freelancerName", pr.get("freelancer_name"));
            ord.put("freelancerAvatar", pr.get("freelancer_avatar"));
            ord.put("employerId", "usr-emp-" + pr.get("customer_id"));
            ord.put("employerName", pr.get("customer_name"));
            ord.put("employerAvatar", pr.get("customer_avatar"));
            ord.put("totalAmount", pr.get("total_price") != null ? ((Number) pr.get("total_price")).doubleValue() : 0.0);
            ord.put("platformFee", pr.get("platform_fee") != null ? ((Number) pr.get("platform_fee")).doubleValue() : 0.0);
            ord.put("freelancerPayoutAmount", pr.get("freelancer_payout_amount") != null ? ((Number) pr.get("freelancer_payout_amount")).doubleValue() : 0.0);
            ord.put("status", clientStatus);
            ord.put("createdAt", pr.get("created_at") != null ? pr.get("created_at").toString().split(" ")[0] : "2026-10-01");
            ord.put("deadline", pr.get("deadline") != null ? pr.get("deadline").toString() : "2026-11-01");
            ord.put("autoAcceptDaysRemaining", pr.get("auto_accept_days_remaining") != null ? ((Number) pr.get("auto_accept_days_remaining")).intValue() : 3);
            ord.put("revisionCount", pr.get("revision_count") != null ? ((Number) pr.get("revision_count")).intValue() : 0);
            ord.put("maxRevisionsAllowed", pr.get("max_revisions_allowed") != null ? ((Number) pr.get("max_revisions_allowed")).intValue() : 3);
            ord.put("milestones", msByProj.getOrDefault(pid, List.of()));
            ord.put("deliveries", delByProj.getOrDefault(pid, List.of()));
            ord.put("sowRequirements", sowList);
            ord.put("paymentMethod", pr.get("payment_method") != null ? pr.get("payment_method") : "VNPAY_QR");
            ord.put("vnpayTransactionId", pr.get("vnpay_transaction_id"));

            orders.add(ord);
        }

        return ResponseEntity.ok(orders);
    }

    /**
     * 4. GET /api/reviews: Lấy toàn bộ đánh giá từ bảng talent_reviews
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews() {
        String sql = """
            SELECT r.*, a.full_name as author_name, a.avatar as author_avatar,
                   t.full_name as target_name
            FROM talent_reviews r
            JOIN users a ON r.author_id = a.id
            JOIN users t ON r.target_id = t.id
            ORDER BY r.id ASC
        """;
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        List<Map<String, Object>> reviews = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> rev = new HashMap<>();
            rev.put("id", "rev-" + r.get("id"));
            rev.put("orderId", "ord-" + r.get("project_id"));
            rev.put("orderTitle", r.get("order_title") != null ? r.get("order_title") : "Hợp đồng dịch vụ");
            rev.put("authorId", "usr-" + r.get("author_id"));
            rev.put("authorName", r.get("author_name"));
            rev.put("authorAvatar", r.get("author_avatar"));
            rev.put("targetId", "usr-" + r.get("target_id"));
            rev.put("rating", r.get("rating") != null ? ((Number) r.get("rating")).intValue() : 5);
            rev.put("qualityRating", r.get("quality_rating") != null ? ((Number) r.get("quality_rating")).doubleValue() : 5.0);
            rev.put("deadlineRating", r.get("deadline_rating") != null ? ((Number) r.get("deadline_rating")).doubleValue() : 5.0);
            rev.put("communicationRating", r.get("communication_rating") != null ? ((Number) r.get("communication_rating")).doubleValue() : 5.0);
            rev.put("comment", r.get("comment"));
            rev.put("freelancerReply", r.get("freelancer_reply"));
            rev.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString().split(" ")[0] : "2026-10-01");

            reviews.add(rev);
        }
        return ResponseEntity.ok(reviews);
    }

    /**
     * 5. GET /api/disputes: Lấy toàn bộ tranh chấp từ bảng disputes
     */
    @GetMapping("/disputes")
    public ResponseEntity<?> getAllDisputes() {
        String sql = "SELECT * FROM disputes ORDER BY id ASC";
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        List<Map<String, Object>> disputes = new ArrayList<>();
        for (Map<String, Object> d : rows) {
            Map<String, Object> disp = new HashMap<>();
            disp.put("id", "disp-" + d.get("id"));
            disp.put("orderId", "ord-" + d.get("project_id"));
            disp.put("orderNumber", d.get("order_number") != null ? d.get("order_number") : "TM-2026-8891");
            disp.put("openedBy", "usr-" + d.get("opened_by"));
            disp.put("reason", d.get("reason"));
            disp.put("evidenceNotes", d.get("evidence_notes"));
            disp.put("status", d.get("status") != null ? d.get("status") : "OPEN");
            disp.put("refundEmployerAmount", d.get("refund_employer_amount") != null ? ((Number) d.get("refund_employer_amount")).doubleValue() : 0.0);
            disp.put("payoutFreelancerAmount", d.get("payout_freelancer_amount") != null ? ((Number) d.get("payout_freelancer_amount")).doubleValue() : 0.0);
            disp.put("adminResolutionNote", d.get("admin_resolution_note"));
            disp.put("createdAt", d.get("created_at") != null ? d.get("created_at").toString().split(" ")[0] : "2026-10-01");

            disputes.add(disp);
        }
        return ResponseEntity.ok(disputes);
    }

    /**
     * 6. GET /api/vnpay-transactions: Lấy toàn bộ giao dịch VNPAY Sandbox từ DB
     */
    @GetMapping("/vnpay-transactions")
    public ResponseEntity<?> getAllVnPayTransactions() {
        String sql = "SELECT * FROM vnpay_transactions ORDER BY id DESC";
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        List<Map<String, Object>> txs = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> tx = new HashMap<>();
            tx.put("id", "vnpay-" + r.get("id"));
            tx.put("transactionNo", r.get("transaction_no"));
            tx.put("orderNumber", r.get("order_number"));
            tx.put("userEmail", r.get("user_email"));
            tx.put("amount", r.get("amount") != null ? ((Number) r.get("amount")).doubleValue() : 0.0);
            tx.put("bankCode", r.get("bank_code"));
            tx.put("cardType", r.get("card_type"));
            tx.put("payDate", r.get("pay_date") != null ? r.get("pay_date").toString() : "");
            tx.put("status", r.get("status"));
            tx.put("type", r.get("type"));
            tx.put("description", r.get("description"));
            tx.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "");

            txs.add(tx);
        }
        return ResponseEntity.ok(txs);
    }

    /**
     * 7. GET /api/invitations: Lấy toàn bộ lời mời dự án từ bảng job_invitations
     */
    @GetMapping("/invitations")
    public ResponseEntity<?> getAllInvitations() {
        String sql = "SELECT * FROM job_invitations ORDER BY id DESC";
        List<Map<String, Object>> rows = jdbc.queryForList(sql);

        List<Map<String, Object>> invites = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> inv = new HashMap<>();
            inv.put("id", "inv-" + r.get("id"));
            inv.put("projectId", "prj-" + r.get("job_id"));
            inv.put("employerId", "usr-emp-" + r.get("customer_id"));
            inv.put("freelancerId", "free-" + r.get("freelancer_id"));
            inv.put("status", r.get("status"));
            inv.put("message", r.get("message"));
            inv.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString().split(" ")[0] : "2026-10-01");

            invites.add(inv);
        }
        return ResponseEntity.ok(invites);
    }

    /**
     * 7b. GET /api/portfolios: Lấy toàn bộ portfolio từ freelancer_portfolios
     */
    @GetMapping("/portfolios")
    public ResponseEntity<?> getAllPortfolios() {
        String sql = "SELECT * FROM freelancer_portfolios ORDER BY id ASC";
        List<Map<String, Object>> rows = jdbc.queryForList(sql);
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> p = new HashMap<>();
            p.put("id", "port-" + r.get("id"));
            p.put("userId", "usr-free-" + r.get("user_id"));
            p.put("freelancerId", "free-" + r.get("user_id"));
            p.put("title", r.get("title"));
            p.put("category", r.get("category"));
            p.put("image", r.get("image_url"));
            p.put("imageUrl", r.get("image_url"));
            p.put("description", r.get("description"));
            p.put("projectUrl", r.get("project_url"));
            list.add(p);
        }
        return ResponseEntity.ok(list);
    }

    /**
     * 7c. POST /api/disputes: Mở tranh chấp hợp đồng vào MySQL
     */
    @PostMapping("/disputes")
    @Transactional
    public ResponseEntity<?> createDispute(@RequestBody Map<String, Object> body) {
        try {
            Long pid = parseId(String.valueOf(body.get("orderId")));
            String orderNumber = (String) body.getOrDefault("orderNumber", "TM-2026-" + pid);
            Long openedBy = parseId(String.valueOf(body.get("openedBy")));
            String reason = (String) body.getOrDefault("reason", "Khiếu nại sản phẩm không đạt cam kết");
            String evidenceNotes = (String) body.getOrDefault("evidenceNotes", "Yêu cầu trọng tài phân xử");

            String sql = """
                INSERT INTO disputes (project_id, order_number, opened_by, reason, evidence_notes, status, created_at)
                VALUES (?, ?, ?, ?, ?, 'OPEN', NOW(6))
            """;
            jdbc.update(sql, pid, orderNumber, openedBy, reason, evidenceNotes);
            jdbc.update("UPDATE projects SET status = 'DISPUTED', updated_at = NOW(6) WHERE id = ?", pid);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã gửi khiếu nại tranh chấp vào CSDL!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 8. POST /api/orders/{id}/deliver: Nộp bài bàn giao cập nhật trực tiếp vào MySQL
     */
    @PostMapping("/orders/{id}/deliver")
    @Transactional
    public ResponseEntity<?> submitOrderDelivery(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        try {
            Long pid = parseId(id);
            String fileName = (String) body.getOrDefault("fileName", "Ban_giao_san_pham.zip");
            String fileSize = (String) body.getOrDefault("fileSize", "15.0 MB");
            String fileUrl = (String) body.getOrDefault("fileUrl", "https://talentmatch.vn/deliveries/" + fileName);
            String demoUrl = (String) body.getOrDefault("demoUrl", "");
            String note = (String) body.getOrDefault("note", "Bàn giao sản phẩm hoàn thiện.");

            String insertSql = """
                INSERT INTO project_deliveries (project_id, file_name, file_url, file_size, demo_url, note, submitted_at, created_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(6), NOW(6))
            """;
            jdbc.update(insertSql, pid, fileName, fileUrl, fileSize, demoUrl, note);

            // Cập nhật trạng thái dự án sang DELIVERED (hoặc chờ nghiệm thu)
            jdbc.update("UPDATE projects SET status = 'DELIVERED', auto_accept_days_remaining = 3, updated_at = NOW(6) WHERE id = ?", pid);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã nộp bài bàn giao thành công vào CSDL!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 9. POST /api/orders/{id}/accept: Nghiệm thu hoàn tất đơn hàng và giải ngân vào MySQL
     */
    @PostMapping("/orders/{id}/accept")
    @Transactional
    public ResponseEntity<?> acceptOrderDelivery(@PathVariable String id) {
        try {
            Long pid = parseId(id);
            // 1. Cập nhật projects
            jdbc.update("UPDATE projects SET status = 'COMPLETED', auto_accept_days_remaining = 0, completed_at = NOW(6), updated_at = NOW(6) WHERE id = ?", pid);

            // 2. Lấy thông tin payout
            Map<String, Object> proj = jdbc.queryForMap("SELECT * FROM projects WHERE id = ?", pid);
            BigDecimal payout = (BigDecimal) proj.get("freelancer_payout_amount");
            Long freelancerId = ((Number) proj.get("freelancer_id")).longValue();

            // 3. Cộng tiền vào ví Freelancer trong bảng users
            jdbc.update("UPDATE users SET balance = balance + ?, completed_projects = completed_projects + 1 WHERE id = ?", payout, freelancerId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã nghiệm thu và giải ngân tiền công thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 10. POST /api/user/withdrawals: Ghi nhận yêu cầu rút tiền vào MySQL
     */
    @PostMapping("/user/withdrawals")
    @Transactional
    public ResponseEntity<?> requestWithdrawal(@RequestBody Map<String, Object> body) {
        try {
            Long userId = parseId(String.valueOf(body.get("userId")));
            BigDecimal amount = new BigDecimal(body.get("amount").toString());
            String bankName = (String) body.getOrDefault("bankName", "Vietcombank");
            String bankCode = (String) body.getOrDefault("bankCode", "VCB");
            String accountNumber = (String) body.getOrDefault("accountNumber", "0000000000");
            String accountHolder = (String) body.getOrDefault("accountHolder", "CHỦ TÀI KHOẢN");

            String txCode = "WTH-2026-" + System.currentTimeMillis();
            String sql = """
                INSERT INTO withdrawal_requests (user_id, bank_name, bank_code, account_number, account_holder, amount, fee, net_amount, status, transaction_code, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 0.00, ?, 'PENDING', ?, NOW(6))
            """;
            jdbc.update(sql, userId, bankName, bankCode, accountNumber, accountHolder, amount, amount, txCode);

            // Trừ số dư người dùng
            jdbc.update("UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?", amount, userId, amount);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã gửi lệnh rút tiền thành công. Tiền sẽ về tài khoản trong 24h!", "transactionCode", txCode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 11. POST /api/user/bank-accounts: Lưu tài khoản ngân hàng vào MySQL
     */
    @PostMapping("/user/bank-accounts")
    public ResponseEntity<?> addBankAccount(@RequestBody Map<String, Object> body) {
        try {
            Long userId = parseId(String.valueOf(body.get("userId")));
            String bankName = (String) body.get("bankName");
            String bankCode = (String) body.get("bankCode");
            String accountNumber = (String) body.get("accountNumber");
            String accountHolder = (String) body.get("accountHolder");

            String sql = """
                INSERT INTO user_bank_accounts (user_id, bank_name, bank_code, account_number, account_holder, is_default, created_at)
                VALUES (?, ?, ?, ?, ?, b'1', NOW(6))
            """;
            jdbc.update(sql, userId, bankName, bankCode, accountNumber, accountHolder);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã thêm tài khoản ngân hàng thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 12. POST /api/proposals/{id}/withdraw: Rút hồ sơ ứng tuyển từ Freelancer
     */
    @PostMapping("/proposals/{id}/withdraw")
    @Transactional
    public ResponseEntity<?> withdrawProposal(@PathVariable String id) {
        try {
            Long propId = parseId(id);
            List<Map<String, Object>> rows = jdbc.queryForList("SELECT job_id FROM job_applications WHERE id = ?", propId);
            if (!rows.isEmpty()) {
                Long jobId = ((Number) rows.get(0).get("job_id")).longValue();
                jdbc.update("UPDATE jobs SET proposals_count = GREATEST(0, proposals_count - 1), updated_at = NOW(6) WHERE id = ?", jobId);
            }
            jdbc.update("UPDATE job_applications SET status = 'WITHDRAWN', updated_at = NOW(6) WHERE id = ?", propId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã rút hồ sơ ứng tuyển thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 13. PUT /api/proposals/{id}: Chỉnh sửa đề xuất báo giá
     */
    @PutMapping("/proposals/{id}")
    @Transactional
    public ResponseEntity<?> updateProposal(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            Long propId = parseId(id);
            BigDecimal proposedPrice = new BigDecimal(String.valueOf(body.get("bidAmount")));
            int estimatedDays = ((Number) body.get("estimatedDays")).intValue();
            String coverLetter = String.valueOf(body.get("coverLetter"));

            jdbc.update("""
                UPDATE job_applications
                SET proposed_price = ?, estimated_days = ?, proposal = ?, updated_at = NOW(6)
                WHERE id = ?
            """, proposedPrice, estimatedDays, coverLetter, propId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã cập nhật đề xuất báo giá thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 14. PUT /api/jobs/{id}: Chỉnh sửa thông tin dự án đã đăng tuyển
     */
    @PutMapping("/jobs/{id}")
    @Transactional
    public ResponseEntity<?> updateJobSync(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            Long jobId = parseId(id);
            String title = String.valueOf(body.get("title"));
            String category = String.valueOf(body.getOrDefault("category", "Lập trình & CNTT"));
            String description = String.valueOf(body.getOrDefault("description", ""));
            BigDecimal budget = new BigDecimal(String.valueOf(body.getOrDefault("budget", "10000000")));
            String priceType = String.valueOf(body.getOrDefault("budgetType", "FIXED"));
            String deadlineStr = body.get("deadline") != null ? String.valueOf(body.get("deadline")).split("T")[0] : null;

            Object skillsObj = body.get("requiredSkills");
            String skills = skillsObj instanceof List ? String.join(", ", (List<String>) skillsObj) : String.valueOf(skillsObj);

            jdbc.update("""
                UPDATE jobs
                SET title = ?, category = ?, description = ?, budget = ?, price_type = ?,
                    required_skills = ?, deadline = ?, updated_at = NOW(6)
                WHERE id = ?
            """, title, category, description, budget, priceType, skills, deadlineStr != null ? LocalDate.parse(deadlineStr) : null, jobId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã cập nhật thông tin dự án thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 15. GET /api/jobs/{id}/questions: Lấy danh sách câu hỏi thảo luận của dự án
     */
    @GetMapping("/jobs/{id}/questions")
    public ResponseEntity<?> getJobQuestionsSync(@PathVariable String id) {
        try {
            Long jobId = parseId(id);
            String sql = """
                SELECT q.*, u.full_name as author_name, u.avatar as author_avatar, u.role as author_role
                FROM job_questions q
                JOIN users u ON q.author_id = u.id
                WHERE q.job_id = ?
                ORDER BY q.created_at ASC
            """;
            List<Map<String, Object>> rows = jdbc.queryForList(sql, jobId);
            List<Map<String, Object>> list = new ArrayList<>();
            for (Map<String, Object> r : rows) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", r.get("id"));
                item.put("jobId", "prj-" + r.get("job_id"));
                item.put("authorId", "usr-" + r.get("author_id"));
                item.put("authorName", r.get("author_name"));
                item.put("authorAvatar", r.get("author_avatar"));
                item.put("authorRole", r.get("author_role"));
                item.put("question", r.get("question"));
                item.put("answer", r.get("answer"));
                item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "");
                item.put("answeredAt", r.get("answered_at") != null ? r.get("answered_at").toString() : null);
                list.add(item);
            }
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 16. POST /api/jobs/{id}/questions: Đặt câu hỏi thắc mắc trước khi ứng tuyển
     */
    @PostMapping("/jobs/{id}/questions")
    @Transactional
    public ResponseEntity<?> askJobQuestionSync(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            Long jobId = parseId(id);
            Long authorId = parseId(String.valueOf(body.get("authorId")));
            String question = String.valueOf(body.get("question")).trim();
            if (question.length() < 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nội dung câu hỏi phải có ít nhất 5 ký tự."));
            }
            jdbc.update("""
                INSERT INTO job_questions (job_id, author_id, question, created_at)
                VALUES (?, ?, ?, NOW(6))
            """, jobId, authorId, question);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã gửi câu hỏi công khai thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 17. POST /api/questions/{id}/answer: Nhà tuyển dụng giải đáp câu hỏi của Freelancer
     */
    @PostMapping("/questions/{id}/answer")
    @Transactional
    public ResponseEntity<?> answerQuestionSync(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String answer = String.valueOf(body.get("answer")).trim();
            if (answer.length() < 3) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nội dung câu trả lời quá ngắn."));
            }
            jdbc.update("""
                UPDATE job_questions
                SET answer = ?, answered_at = NOW(6)
                WHERE id = ?
            """, answer, id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã giải đáp câu hỏi thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 18. POST /api/reviews: Lưu đánh giá hai chiều (Khách hàng & Freelancer) vào CSDL
     */
    @PostMapping("/reviews")
    @Transactional
    public ResponseEntity<?> createReviewSync(@RequestBody Map<String, Object> body) {
        try {
            Long projectId = parseId(String.valueOf(body.get("orderId")));
            Long authorId = parseId(String.valueOf(body.get("authorId")));
            Long targetId = parseId(String.valueOf(body.get("targetId")));
            int rating = ((Number) body.getOrDefault("rating", 5)).intValue();
            double quality = ((Number) body.getOrDefault("qualityRating", 5.0)).doubleValue();
            double deadline = ((Number) body.getOrDefault("deadlineRating", 5.0)).doubleValue();
            double comm = ((Number) body.getOrDefault("communicationRating", 5.0)).doubleValue();
            String comment = (String) body.getOrDefault("comment", "Dịch vụ rất tốt");

            jdbc.update("""
                INSERT INTO talent_reviews (project_id, author_id, target_id, rating, quality_rating, deadline_rating, communication_rating, comment, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(6))
                ON DUPLICATE KEY UPDATE
                    rating = VALUES(rating),
                    quality_rating = VALUES(quality_rating),
                    deadline_rating = VALUES(deadline_rating),
                    communication_rating = VALUES(communication_rating),
                    comment = VALUES(comment),
                    created_at = NOW(6)
            """, projectId, authorId, targetId, rating, quality, deadline, comm, comment);

            // Cập nhật điểm uy tín cho người nhận đánh giá
            jdbc.update("""
                UPDATE users
                SET rating = (SELECT ROUND(AVG(rating), 1) FROM talent_reviews WHERE target_id = ?),
                    updated_at = NOW(6)
                WHERE id = ?
            """, targetId, targetId);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã lưu đánh giá thành công vào CSDL!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * 19. PUT /api/user/profile: Chỉnh sửa và cập nhật hồ sơ người dùng vào CSDL
     */
    @PutMapping("/user/profile")
    @Transactional
    public ResponseEntity<?> updateUserProfileSync(@RequestBody Map<String, Object> body) {
        try {
            Long uid = parseId(String.valueOf(body.get("id")));
            String fullName = (String) body.get("name");
            String phone = (String) body.get("phone");
            String title = (String) body.get("title");
            String bio = (String) body.get("bio");
            String company = (String) body.get("companyName");
            String taxCode = (String) body.get("taxCode");

            Object skillsObj = body.get("skills");
            String skills = skillsObj instanceof List ? String.join(", ", (List<String>) skillsObj) : (String) skillsObj;

            jdbc.update("""
                UPDATE users
                SET full_name = COALESCE(?, full_name),
                    phone = COALESCE(?, phone),
                    professional_title = COALESCE(?, professional_title),
                    bio = COALESCE(?, bio),
                    skills = COALESCE(?, skills),
                    company_name = COALESCE(?, company_name),
                    tax_code = COALESCE(?, tax_code),
                    updated_at = NOW(6)
                WHERE id = ?
            """, fullName, phone, title, bio, skills, company, taxCode, uid);

            return ResponseEntity.ok(Map.of("success", true, "message", "Đã cập nhật hồ sơ cá nhân vào CSDL!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private Long parseId(String raw) {
        if (raw == null) return 1L;
        String digits = raw.replaceAll("\\D+", "");
        return digits.isBlank() ? 1L : Long.parseLong(digits);
    }

    private boolean isBitTrue(Object obj) {
        if (obj == null) return false;
        if (obj instanceof Boolean b) return b;
        if (obj instanceof Number n) return n.intValue() == 1;
        if (obj instanceof byte[] bytes && bytes.length > 0) return bytes[0] == 1;
        return "true".equalsIgnoreCase(obj.toString()) || "1".equals(obj.toString());
    }

    /**
     * 20. POST /api/user/avatar: Upload ảnh đại diện lên Cloudinary và chỉ lưu TÊN ẢNH vào DB (users.avatar)
     */
    @PostMapping(value = "/user/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> uploadUserAvatar(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "email", required = false) String email
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Vui lòng chọn file ảnh để tải lên!"));
        }

        try {
            Long uid = null;
            if (userId != null && !userId.isBlank()) {
                uid = parseId(userId);
            } else if (email != null && !email.isBlank()) {
                List<Long> ids = jdbc.query("SELECT id FROM users WHERE LOWER(email) = ?", (rs, rowNum) -> rs.getLong("id"), email.trim().toLowerCase());
                if (!ids.isEmpty()) uid = ids.get(0);
            }
            if (uid == null) uid = 1L;

            // Xử lý tên ảnh: Chỉ lưu tên ảnh (vd image.png, avatar_2_1740928374.png) vào DB, KHÔNG lưu link
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isBlank()) {
                originalFileName = "image.png";
            }
            String extension = "";
            int dotIdx = originalFileName.lastIndexOf('.');
            if (dotIdx >= 0) {
                extension = originalFileName.substring(dotIdx);
            } else {
                extension = ".png";
            }
            String baseName = dotIdx >= 0 ? originalFileName.substring(0, dotIdx) : originalFileName;
            String cleanBaseName = baseName.replaceAll("[^a-zA-Z0-9_-]", "_");
            String storedFileName = "avatar_" + uid + "_" + System.currentTimeMillis() + "_" + cleanBaseName + extension;

            // 1. Upload lên Cloudinary
            com.talentmatch.service.CloudinaryService.upload(file, storedFileName);

            // 2. Lưu vào DB MySQL: CHỈ LƯU TÊN ẢNH (storedFileName, vd avatar_2_1740928374_image.png)
            jdbc.update("UPDATE users SET avatar = ?, updated_at = NOW(6) WHERE id = ?", storedFileName, uid);

            String fullUrl = com.talentmatch.config.CloudinaryConfig.IMAGE_BASE_URL + storedFileName;

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã tải lên ảnh đại diện và lưu tên ảnh vào CSDL thành công!",
                    "fileName", storedFileName,
                    "avatar", storedFileName,
                    "avatarUrl", fullUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi tải ảnh đại diện: " + e.getMessage()));
        }
    }

    /**
     * 21. POST /api/upload/image: Upload ảnh tổng quát lên Cloudinary và trả về tên ảnh cùng URL
     */
    @PostMapping(value = "/upload/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadGenericImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Vui lòng chọn file ảnh để tải lên!"));
        }

        try {
            String originalFileName = file.getOriginalFilename();
            if (originalFileName == null || originalFileName.isBlank()) originalFileName = "image.png";
            String cleanName = originalFileName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedFileName = System.currentTimeMillis() + "_" + cleanName;

            com.talentmatch.service.CloudinaryService.upload(file, storedFileName);
            String fullUrl = com.talentmatch.config.CloudinaryConfig.IMAGE_BASE_URL + storedFileName;

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "fileName", storedFileName,
                    "url", fullUrl
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi tải ảnh: " + e.getMessage()));
        }
    }

    /**
     * 22. GET /api/images/{fileName}: Chuyển hướng trực tiếp tới Cloudinary Image Base URL
     */
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<?> getImageRedirect(@PathVariable("fileName") String fileName) {
        String targetUrl = com.talentmatch.config.CloudinaryConfig.IMAGE_BASE_URL + fileName;
        return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND)
                .header(org.springframework.http.HttpHeaders.LOCATION, targetUrl)
                .build();
    }
}
