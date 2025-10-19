import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Clock, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchWithAuth } from '../services/api';

/**
 * Panel for organizers to view and manage time proposals
 * Shows all PROPOSED invitations with accept/reject actions
 */
const ProposalManagementPanel = ({ eventId }) => {
  const queryClient = useQueryClient();

  // Fetch all proposals for this event
  const { data: proposals, isLoading, isError, refetch } = useQuery({
    queryKey: ['event-proposals', eventId],
    queryFn: () => fetchWithAuth(`/api/v1/events/${eventId}/proposals`),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Accept proposal mutation
  const acceptMutation = useMutation({
    mutationFn: (invitationId) => 
      fetchWithAuth(`/api/v1/invitations/${invitationId}/accept-proposal`, {
        method: 'POST',
      }),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['event-proposals', eventId] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-invitations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['invitation-summary', eventId] });
    },
  });

  // Reject proposal mutation
  const rejectMutation = useMutation({
    mutationFn: ({ invitationId, rejectionNote }) =>
      fetchWithAuth(`/api/v1/invitations/${invitationId}/reject-proposal`, {
        method: 'POST',
        body: JSON.stringify({ rejectionNote }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-proposals', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event-invitations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['invitation-summary', eventId] });
    },
  });

  const handleAccept = (invitationId) => {
    if (window.confirm('Accept this time proposal? The event time will be updated and other proposals will be superseded.')) {
      acceptMutation.mutate(invitationId);
    }
  };

  const handleReject = (invitationId, recipientEmail) => {
    const note = window.prompt(
      `Reject ${recipientEmail}'s proposal? (Optional: Add a reason)`,
      'Thank you for the suggestion, but the original time works better.'
    );
    if (note !== null) { // User clicked OK (even if empty)
      rejectMutation.mutate({ invitationId, rejectionNote: note });
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Loading proposals...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca',
        }}
        role="alert"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ color: '#dc2626' }} aria-hidden="true" />
          <span style={{ fontSize: '14px', color: '#991b1b' }}>
            Failed to load proposals
          </span>
        </div>
      </div>
    );
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
        }}
      >
        <Clock size={32} style={{ color: '#9ca3af', margin: '0 auto 8px' }} aria-hidden="true" />
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          No time proposals yet
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Time Proposals ({proposals.length})
        </h3>
        <button
          onClick={() => refetch()}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          aria-label="Refresh proposals"
        >
          <RefreshCw size={14} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Proposals List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {proposals.map((proposal) => {
          const proposedStart = new Date(proposal.proposedStart);
          const proposedEnd = new Date(proposal.proposedEnd);
          const isPending = acceptMutation.isPending || rejectMutation.isPending;

          return (
            <div
              key={proposal.id}
              style={{
                padding: '16px',
                backgroundColor: '#eff6ff',
                borderRadius: '6px',
                border: '1px solid #bfdbfe',
              }}
            >
              {/* Recipient Info */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e40af' }}>
                  {proposal.recipientEmail}
                </div>
                {proposal.responseNote && (
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginTop: '4px',
                      fontStyle: 'italic',
                    }}
                  >
                    "{proposal.responseNote}"
                  </div>
                )}
              </div>

              {/* Proposed Time */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                  }}
                >
                  <Clock size={14} style={{ color: '#3b82f6' }} aria-hidden="true" />
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#1e3a8a' }}>
                    Proposed Time:
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#374151' }}>
                  <div>{format(proposedStart, 'EEE, MMM d, yyyy')}</div>
                  <div>
                    {format(proposedStart, 'h:mm a')} - {format(proposedEnd, 'h:mm a')}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleAccept(proposal.id)}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  aria-label={`Accept proposal from ${proposal.recipientEmail}`}
                >
                  <Check size={14} aria-hidden="true" />
                  Accept & Update Event
                </button>
                <button
                  onClick={() => handleReject(proposal.id, proposal.recipientEmail)}
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: '#ffffff',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: isPending ? 'not-allowed' : 'pointer',
                    opacity: isPending ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                  aria-label={`Reject proposal from ${proposal.recipientEmail}`}
                >
                  <X size={14} aria-hidden="true" />
                  Reject
                </button>
              </div>

              {/* Timestamp */}
              {proposal.respondedAt && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    marginTop: '8px',
                    textAlign: 'right',
                  }}
                >
                  Proposed {format(new Date(proposal.respondedAt), 'MMM d, h:mm a')}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Success/Error Messages */}
      {acceptMutation.isSuccess && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#d1fae5',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#065f46',
          }}
          role="alert"
        >
          ✓ Proposal accepted! Event time has been updated.
        </div>
      )}

      {(acceptMutation.isError || rejectMutation.isError) && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#991b1b',
          }}
          role="alert"
        >
          ✗ Failed to process proposal. Please try again.
        </div>
      )}
    </div>
  );
};

export default ProposalManagementPanel;
