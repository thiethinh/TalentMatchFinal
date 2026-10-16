package com.talentmatch.repository;

import com.talentmatch.model.User;
import com.talentmatch.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
    Optional<VerificationToken> findByUserAndOtp(User user, String otp);
    Optional<VerificationToken> findByOtp(String otp);
    void deleteByUser(User user);
}
