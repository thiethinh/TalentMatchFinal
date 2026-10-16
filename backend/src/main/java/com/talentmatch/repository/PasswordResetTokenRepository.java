package com.talentmatch.repository;

import com.talentmatch.model.PasswordResetToken;
import com.talentmatch.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUserAndOtpAndUsedFalse(User user, String otp);
    Optional<PasswordResetToken> findByOtpAndUsedFalse(String otp);
    List<PasswordResetToken> findByUserAndUsedFalse(User user);
}
