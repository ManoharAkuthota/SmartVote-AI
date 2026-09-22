package com.smartvote.repository;

import com.smartvote.entity.OtpVerification;
import com.smartvote.entity.enums.OtpPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, OtpPurpose purpose);

    void deleteByEmail(String email);
}
