package com.smartvote.repository;

import com.smartvote.entity.LoginHistory;
import com.smartvote.entity.enums.LoginStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    List<LoginHistory> findTop50ByOrderByTimestampDesc();

    List<LoginHistory> findByEmailOrderByTimestampDesc(String email);

    long countByStatus(LoginStatus status);

    long countByStatusAndTimestampAfter(LoginStatus status, LocalDateTime timestamp);
}
