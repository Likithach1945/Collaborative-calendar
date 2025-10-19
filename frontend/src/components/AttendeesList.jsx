import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { apiClient as api } from '../api/client';
import Avatar from './Avatar';
import './AttendeesList.css';

const AttendeesList = ({ eventId }) => {
  const queryClient = useQueryClient();
  const [respondingId, setRespondingId] = useState(null);
  
  // Get current user info from localStorage or auth context
  const currentUserEmail = localStorage.getItem('user_email');
  
  // Fetch detailed invitations
  const { data: invitations, isLoading: invitationsLoading, error: invitationsError } = useQuery({
    queryKey: ['event-invitations', eventId],
    queryFn: async () => {
      try {
        return await api.get(`/events/${eventId}/invitations`);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: (failureCount, error) => {
      // Don't retry for client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry server errors (5xx) and network errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  // Also fetch the event to get organizer info
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      try {
        return await api.get(`/events/${eventId}`);
      } catch (err) {
        console.error('Error fetching event:', err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: (failureCount, error) => {
      // Don't retry for client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry server errors (5xx) and network errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
  
  // Mutation to respond to invitation
  const respondMutation = useMutation({
    mutationFn: async ({ invitationId, status }) => {
      return await api.patch(`/invitations/${invitationId}`, { status });
    },
    onSuccess: () => {
      // Invalidate and refetch invitations
      queryClient.invalidateQueries(['event-invitations', eventId]);
      queryClient.invalidateQueries(['event', eventId]);
      setRespondingId(null);
    },
    onError: (error) => {
      console.error('Failed to respond to invitation:', error);
      setRespondingId(null);
    }
  });

  const isLoading = invitationsLoading || eventLoading;
  const error = invitationsError || eventError;
  
  // Check if current user is organizer
  const isOrganizer = event && currentUserEmail && 
    (event.organizerEmail?.toLowerCase() === currentUserEmail.toLowerCase());
  
  // Handle response to invitation
  const handleResponse = async (invitationId, status) => {
    setRespondingId(invitationId);
    respondMutation.mutate({ invitationId, status });
  };

  if (isLoading) {
    return (
      <div className="attendee-list-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80px' }}>
          <div className="loading-spinner" />
        </div>
      </div>
    );
  }

  if (error) {
    let errorMessage = 'Failed to load attendee information.';
    if (error.status === 404) {
      errorMessage = 'The event was not found.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to view attendees for this event.';
    }
    
    return (
      <div className="attendee-list-container" style={{ backgroundColor: 'rgba(var(--error-rgb), 0.1)', color: 'var(--error)', padding: '16px' }}>
        {errorMessage}
      </div>
    );
  }

  // If no attendees and no event data yet
  if ((!invitations || invitations.length === 0) && !event) {
    return (
      <div className="attendee-list-container" style={{ textAlign: 'center', padding: '16px', color: 'var(--text-secondary)' }}>
        No attendee information available.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle size={16} />;
      case 'DECLINED':
        return <XCircle size={16} />;
      case 'PENDING':
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Attending';
      case 'DECLINED':
        return 'Not attending';
      case 'PENDING':
      default:
        return 'Awaiting response';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'status-accepted';
      case 'DECLINED':
        return 'status-declined';
      case 'PENDING':
      default:
        return 'status-pending';
    }
  };

  return (
    <div className="attendee-list-container">
      {/* Organizer */}
      {event && (
        <div className="attendee-item">
          <Avatar 
            name={event.organizerName}
            email={event.organizerEmail}
            size={36}
            fontSize={14}
          />
          <div className="attendee-details">
            <div className="attendee-name">{event.organizerName || event.organizerEmail}</div>
            <div className="attendee-status">Organizer</div>
          </div>
          <div className="organizer-badge">Host</div>
        </div>
      )}

      {/* Attendees */}
      {invitations && invitations.length > 0 ? (
        <div>
          {invitations.map((invitation) => {
            const isCurrentUser = currentUserEmail && 
              invitation.recipientEmail?.toLowerCase() === currentUserEmail.toLowerCase();
            const canRespond = isCurrentUser && invitation.status === 'PENDING';
            
            return (
              <div key={invitation.id} className="attendee-item">
                <Avatar 
                  name={invitation.recipientName}
                  email={invitation.recipientEmail}
                  size={36}
                  fontSize={14}
                />
                <div className="attendee-details">
                  <div className="attendee-name">
                    {invitation.recipientName || invitation.recipientEmail}
                    {isCurrentUser && <span style={{ marginLeft: '8px', color: 'var(--primary)', fontSize: '12px' }}>(You)</span>}
                  </div>
                  <div className="attendee-status">
                    <span className={`status-indicator ${getStatusClass(invitation.status)}`}>
                      {getStatusIcon(invitation.status)}
                      <span style={{ marginLeft: '4px' }}>{getStatusText(invitation.status)}</span>
                    </span>
                  </div>
                </div>
                
                {/* Action buttons for current user's pending invitation */}
                {canRespond && (
                  <div className="invitation-actions">
                    <button
                      className="btn-accept"
                      onClick={() => handleResponse(invitation.id, 'ACCEPTED')}
                      disabled={respondingId === invitation.id}
                    >
                      {respondingId === invitation.id ? '...' : 'Accept'}
                    </button>
                    <button
                      className="btn-decline"
                      onClick={() => handleResponse(invitation.id, 'DECLINED')}
                      disabled={respondingId === invitation.id}
                    >
                      {respondingId === invitation.id ? '...' : 'Decline'}
                    </button>
                  </div>
                )}
                
                {/* Status badge for organizer or already responded */}
                {!canRespond && (
                  <div className={`status-badge ${getStatusClass(invitation.status)}`}>
                    {invitation.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
          No other attendees for this event.
        </div>
      )}
    </div>
  );
};

// Helper functions for styling
function getStatusBackgroundColor(status) {
  switch (status) {
    case 'ACCEPTED':
      return '#34a853';
    case 'DECLINED':
      return '#ea4335';
    case 'PENDING':
    default:
      return '#fbbc04';
  }
}

export default AttendeesList;