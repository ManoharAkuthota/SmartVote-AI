package com.smartvote.repository;

import com.smartvote.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findTop100ByOrderByTimestampDesc();

    List<AuditLog> findByActorEmailOrderByTimestampDesc(String actorEmail);
}
