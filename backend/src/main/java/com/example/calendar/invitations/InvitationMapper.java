package com.example.calendar.invitations;

import com.example.calendar.events.EventMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {EventMapper.class})
public interface InvitationMapper {
    
    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "event", target = "event")
    InvitationDTO toDTO(Invitation invitation);
    
    @Mapping(target = "event", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Invitation toEntity(InvitationDTO invitationDTO);
}
