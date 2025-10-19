import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Mail, Calendar, Clock, MapPin, User, ArrowLeft, RefreshCw, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { apiClient as api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import InvitationResponseButtons from '../components/InvitationResponseButtons';
import TimezoneInfo from '../components/TimezoneInfo';
import NotificationBadge from '../components/NotificationBadge';
import './InvitationsPage.css';

export default function InvitationsPage() {
  const { user } = useAuth();
  const userTimezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [statusFilter, setStatusFilter] = useState('all');
  const viewerTimezone = userTimezone;

  const { data: invitations, isLoading, error, refetch } = useQuery({
    queryKey: ['user-invitations', viewerTimezone],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (viewerTimezone) {
          params.append('viewerTimezone', viewerTimezone);
        }

        const endpoint = params.toString().length > 0
          ? `/invitations?${params.toString()}`
          : '/invitations';
        const data = await api.get(endpoint);
        return data || []; // Ensure we return an array, not undefined
      } catch (err) {
        console.error('Error fetching invitations:', err);
        return []; // Return empty array on error
      }
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const getFilterCount = (status) => {
    if (!invitations) return 0;
    if (status === 'all') return invitations.length;
    return invitations.filter((inv) => inv.status === status.toUpperCase()).length;
  };

  const filteredInvitations = invitations
    ? invitations.filter((inv) =>
        statusFilter === 'all' ? true : inv.status === statusFilter.toUpperCase()
      )
    : [];

  return (
    <div className="invitations-page">
      <div className="invitations-container">
        {/* Header */}
        <div className="page-header">
          <Link to="/calendar" className="back-link">
            <ArrowLeft className="icon" />
            Back to Calendar
          </Link>
          <div className="header-content">
            <div className="header-title">
              <div className="title-icon">
                <Mail />
              </div>
              <h1>My Invitations</h1>
            </div>
            <button
              onClick={() => refetch()}
              className="refresh-btn"
              disabled={isLoading}
            >
              <RefreshCw className={`icon ${isLoading ? 'spinning' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'accepted', label: 'Accepted' },
            { value: 'declined', label: 'Declined' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`filter-tab ${statusFilter === filter.value ? 'active' : ''}`}
            >
              {filter.label}
              <span className="count-badge">
                {getFilterCount(filter.value)}
              </span>
              {filter.value === 'pending' && getFilterCount('pending') > 0 && (
                <NotificationBadge count={getFilterCount('pending')} variant="pending" />
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="loading-container">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>Failed to load invitations. Please try again.</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && invitations && filteredInvitations.length === 0 && (
          <div className="empty-state">
            <Inbox className="empty-icon" />
            <h3>No invitations</h3>
            <p>
              {statusFilter === 'all'
                ? "You don't have any invitations yet."
                : `You don't have any ${statusFilter} invitations.`}
            </p>
          </div>
        )}

        {/* Invitations List */}
        {!isLoading && invitations && filteredInvitations.length > 0 && (
          <div className="invitations-list">
            {filteredInvitations.map((invitation) => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                userTimezone={userTimezone}
                onResponseSuccess={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InvitationCard({ invitation, onResponseSuccess, userTimezone }) {
  // Get event details from invitation object directly to avoid additional API call
  const event = invitation.event;

  if (!event) {
    return (
      <div className="invitation-card skeleton-card">
        <div className="skeleton-title"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { label: 'Pending Response', className: 'status-pending' },
      ACCEPTED: { label: 'Accepted', className: 'status-accepted' },
      DECLINED: { label: 'Declined', className: 'status-declined' },
      PROPOSED: { label: 'Time Proposed', className: 'status-proposed' },
    };
    return badges[status] || badges.PENDING;
  };

  const badge = getStatusBadge(invitation.status);
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const viewerTimezone = (event?.viewerTimezone && event.viewerTimezone !== 'UTC'
    ? event.viewerTimezone
    : event?.userTimezone || userTimezone || browserTimezone);
  const normalizeToDate = (value) => {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  };
  const startForDisplay = normalizeToDate(event?.startDateTimeLocalized || event?.startDateTime);
  const endForDisplay = normalizeToDate(event?.endDateTimeLocalized || event?.endDateTime);

  return (
    <div className="invitation-card">
      <div className="card-header">
        <div className="event-title-section">
          <h3 className="event-title">{event.title}</h3>
          <span className={`status-badge ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="card-body">
        {/* Event Details */}
        <div className="event-details">
          <div className="detail-item">
            <Calendar className="detail-icon" />
            <div className="detail-content">
              <p className="detail-primary">
                {startForDisplay ? formatInTimeZone(startForDisplay, viewerTimezone, 'EEEE, MMMM d, yyyy') : '—'}
              </p>
              <p className="detail-secondary">
                {startForDisplay ? formatInTimeZone(startForDisplay, viewerTimezone, 'h:mm a') : '—'} -{' '}
                {endForDisplay ? formatInTimeZone(endForDisplay, viewerTimezone, 'h:mm a') : '—'}
              </p>
              {/* Show timezone indicator if different from organizer */}
              {event.timezone && event.timezone !== viewerTimezone && (
                <p className="detail-secondary" style={{ fontSize: '11px', color: '#1a73e8', marginTop: '4px' }}>
                  <Clock size={12} style={{ display: 'inline', marginRight: '2px' }} />
                  Your timezone ({viewerTimezone.split('/').pop().replace('_', ' ')})
                </p>
              )}
            </div>
          </div>

          {event.location && (
            <div className="detail-item">
              <MapPin className="detail-icon" />
              <span className="detail-primary">{event.location}</span>
            </div>
          )}

          {event.organizerEmail && (
            <div className="detail-item">
              <User className="detail-icon" />
              <span className="detail-primary">Organized by {event.organizerName || event.organizerEmail}</span>
            </div>
          )}
        </div>

        {/* Timezone Information */}
        <TimezoneInfo
          startDateTime={event.startDateTimeLocalized || event.startDateTime}
          endDateTime={event.endDateTimeLocalized || event.endDateTime}
          organizerTimezone={event.timezone || viewerTimezone}
          viewerTimezone={viewerTimezone}
          compact={true}
        />

        {/* Description */}
        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}

        {/* Response Buttons */}
        {invitation.status === 'PENDING' && (
          <div className="response-section">
            <InvitationResponseButtons
              invitation={invitation}
              onSuccess={onResponseSuccess}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="card-footer">
        <span className="footer-text">
          <Mail className="footer-icon" />
          Invited {format(new Date(invitation.createdAt), 'MMM d, yyyy')}
        </span>
        {invitation.respondedAt && (
          <span className="footer-text">
            <Clock className="footer-icon" />
            Responded {format(new Date(invitation.respondedAt), 'MMM d, yyyy')}
          </span>
        )}
      </div>
    </div>
  );
}
