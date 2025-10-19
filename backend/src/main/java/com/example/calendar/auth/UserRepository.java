package com.example.calendar.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByGoogleSub(String googleSub);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    
    /**
     * Find frequently collaborated users for the given user
     * Returns users who have been invited to events by this user, sorted by collaboration frequency
     */
    @Query(value = """
        SELECT u.email, u.display_name, u.timezone, COUNT(i.id) as collaboration_count
        FROM users u
        INNER JOIN invitations i ON u.email = i.recipient_email
        INNER JOIN events e ON i.event_id = e.id
        WHERE e.organizer_id = :userId AND u.id != :userId
        GROUP BY u.id, u.email, u.display_name, u.timezone
        ORDER BY collaboration_count DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findFrequentCollaborators(
        @Param("userId") UUID userId,
        @Param("limit") int limit
    );
}
