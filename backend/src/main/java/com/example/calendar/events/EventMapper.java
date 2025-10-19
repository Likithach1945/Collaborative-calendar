package com.example.calendar.events;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EventMapper {
    
    @Mapping(source = "organizer.id", target = "organizerId")
    @Mapping(source = "organizer.email", target = "organizerEmail")
    @Mapping(source = "organizer.displayName", target = "organizerName")
    @Mapping(target = "viewerTimezone", ignore = true)
    @Mapping(target = "startDateTimeLocalized", ignore = true)
    @Mapping(target = "endDateTimeLocalized", ignore = true)
    @Mapping(target = "participants", ignore = true)
    EventDTO toDTO(Event event);
    
    @Mapping(target = "organizer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Event toEntity(EventDTO eventDTO);
}
