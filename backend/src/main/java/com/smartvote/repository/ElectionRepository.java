package com.smartvote.repository;

import com.smartvote.entity.Election;
import com.smartvote.entity.enums.ElectionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectionRepository extends JpaRepository<Election, Long> {

    List<Election> findByStatus(ElectionStatus status);

    List<Election> findAllByOrderByCreatedAtDesc();

    long countByStatus(ElectionStatus status);

    @Query("SELECT e FROM Election e LEFT JOIN FETCH e.candidates WHERE e.id = :id")
    java.util.Optional<Election> findByIdWithCandidates(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM votes WHERE election_id = :id", nativeQuery = true)
    void deleteVotesByElectionId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM candidates WHERE election_id = :id", nativeQuery = true)
    void deleteCandidatesByElectionId(Long id);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "DELETE FROM elections WHERE id = :id", nativeQuery = true)
    void deleteElectionByIdDirect(Long id);
}
