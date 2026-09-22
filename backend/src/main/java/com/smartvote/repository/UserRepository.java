package com.smartvote.repository;

import com.smartvote.entity.User;
import com.smartvote.entity.enums.Role;
import com.smartvote.entity.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByVoterIdNumber(String voterIdNumber);

    List<User> findByRole(Role role);

    List<User> findByStatus(UserStatus status);

    long countByRole(Role role);

    long countByRoleAndStatus(Role role, UserStatus status);

    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_VOTER' AND (:keyword IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.voterIdNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<User> searchVoters(@Param("keyword") String keyword);
}
