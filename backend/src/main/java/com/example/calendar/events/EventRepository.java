package com.example.calendar.events;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {
    
    @Query("SELECT e FROM Event e JOIN FETCH e.organizer WHERE e.organizer.id = :organizerId " +
           "AND e.startDateTime < :end AND e.endDateTime > :start " +
           "ORDER BY e.startDateTime ASC")
    List<Event> findByOrganizerAndDateRange(
        @Param("organizerId") UUID organizerId,
        @Param("start") Instant start,
        @Param("end") Instant end
    );

    @Query("SELECT e FROM Event e JOIN FETCH e.organizer WHERE e.organizer.id = :organizerId " +
           "ORDER BY e.startDateTime ASC")
    List<Event> findByOrganizerId(@Param("organizerId") UUID organizerId);
    
    @Query("SELECT e FROM Event e JOIN FETCH e.organizer WHERE e.id = :id")
    java.util.Optional<Event> findByIdWithOrganizer(@Param("id") UUID id);
}
