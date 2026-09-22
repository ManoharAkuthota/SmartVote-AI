package com.smartvote.repository;

import com.smartvote.entity.FaceEmbedding;
import com.smartvote.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, Long> {

    Optional<FaceEmbedding> findByUser(User user);

    Optional<FaceEmbedding> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
