package com.smartvote.repository;

import com.smartvote.entity.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByElectionIdAndVoterId(Long electionId, Long voterId);

    Optional<Vote> findByReceiptId(String receiptId);

    List<Vote> findByVoterIdOrderByVotedAtDesc(Long voterId);

    List<Vote> findByElectionId(Long electionId);

    void deleteByElectionId(Long electionId);

    long countByElectionId(Long electionId);

    @Query("SELECT v FROM Vote v JOIN FETCH v.election JOIN FETCH v.candidate WHERE v.voter.id = :voterId ORDER BY v.votedAt DESC")
    List<Vote> findVoterHistoryWithDetails(@Param("voterId") Long voterId);

    @Query("SELECT v FROM Vote v JOIN FETCH v.election JOIN FETCH v.candidate WHERE v.receiptId = :receiptId")
    Optional<Vote> findByReceiptIdWithDetails(@Param("receiptId") String receiptId);

    @Query("SELECT HOUR(v.votedAt) as hr, COUNT(v) as cnt FROM Vote v WHERE v.votedAt >= :since GROUP BY HOUR(v.votedAt) ORDER BY hr ASC")
    List<Object[]> getHourlyVoteCounts(@Param("since") LocalDateTime since);
}
