import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, Users, TrendingUp } from 'lucide-react';
import { apiClient as api } from '../api/client';
import Avatar from './Avatar';
import ProposalManagementPanel from './ProposalManagementPanel';

export default function InvitationStatusPanel({ eventId }) {
  const queryClient = useQueryClient();

  // Fetch invitation summary
  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['event-invitations-summary', eventId],
    queryFn: async () => {
      const data = await api.get(`/events/${eventId}/invitations/summary`);
      return data || { totalInvitations: 0, acceptedCount: 0, declinedCount: 0, pendingCount: 0, proposedCount: 0, acceptanceRate: 0 };
    },
    refetchInterval: 30000, // Poll every 30 seconds for updates
    enabled: !!eventId,
  });

  // Fetch detailed invitations
  const { data: invitations } = useQuery({
    queryKey: ['event-invitations', eventId],
    queryFn: async () => {
      const data = await api.get(`/events/${eventId}/invitations`);
      return data || [];
    },
    refetchInterval: 30000,
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e8eaed',
        padding: '24px'
      }}>
        <div style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          <div style={{
            height: '24px',
            backgroundColor: '#f1f3f4',
            borderRadius: '4px',
            width: '33%',
            marginBottom: '16px'
          }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              height: '64px',
              backgroundColor: '#f1f3f4',
              borderRadius: '8px'
            }}></div>
            <div style={{
              height: '64px',
              backgroundColor: '#f1f3f4',
              borderRadius: '8px'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#fce8e6',
        border: '1px solid #f5c2c7',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#c5221f' }}>
          Failed to load invitation status. Please try again.
        </p>
      </div>
    );
  }

  if (!summary || summary.totalInvitations === 0) {
    return (
      <div style={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #e8eaed',
        borderRadius: '8px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#5f6368' }}>
          No invitations sent for this event.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #e8eaed',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #e8eaed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: '#202124',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Users size={20} color="#5f6368" />
          Invitation Responses
        </h3>
        <button
          onClick={() => refetch()}
          style={{
            fontSize: '14px',
            color: '#1a73e8',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f3f4'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          aria-label="Refresh invitation status"
        >
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        padding: '20px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px'
      }}>
        <div style={{
          backgroundColor: '#e8f5e9',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={24} color="#34a853" />
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e4620' }}>
                {summary.acceptedCount}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#34a853', fontWeight: 500 }}>
                Accepted
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fce8e6',
          border: '1px solid #f5c2c7',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <XCircle size={24} color="#ea4335" />
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#5f2120' }}>
                {summary.declinedCount}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#ea4335', fontWeight: 500 }}>
                Declined
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#fef7e0',
          border: '1px solid #fce8b2',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={24} color="#f9ab00" />
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#5f4b00' }}>
                {summary.pendingCount}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#f9ab00', fontWeight: 500 }}>
                Pending
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#e8f0fe',
          border: '1px solid #c2d7ff',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={24} color="#1a73e8" />
            <div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#174ea6' }}>
                {summary.proposedCount || 0}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1a73e8', fontWeight: 500 }}>
                Proposals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acceptance Rate */}
      <div style={{
        padding: '16px 24px',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e8eaed'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#5f6368" />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#5f6368' }}>
              Acceptance Rate
            </span>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#202124' }}>
            {summary.acceptanceRate.toFixed(1)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          backgroundColor: '#e8eaed',
          borderRadius: '4px',
          height: '8px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              backgroundColor: '#34a853',
              height: '100%',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
              width: `${summary.acceptanceRate}%`
            }}
            aria-label={`${summary.acceptanceRate.toFixed(1)}% acceptance rate`}
          ></div>
        </div>
      </div>

      {/* Detailed Invitation List */}
      {invitations && invitations.length > 0 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #e8eaed' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: '#5f6368'
          }}>
            Invitee Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {invitations.map((invitation) => {
              const colors = {
                ACCEPTED: { bg: '#e8f5e9', border: '#c3e6cb', text: '#34a853' },
                DECLINED: { bg: '#fce8e6', border: '#f5c2c7', text: '#ea4335' },
                PENDING: { bg: '#fef7e0', border: '#fce8b2', text: '#f9ab00' },
                default: { bg: '#f8f9fa', border: '#e8eaed', text: '#5f6368' }
              };
              const statusColors = colors[invitation.status] || colors.default;

              return (
                <div
                  key={invitation.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${statusColors.border}`,
                    backgroundColor: statusColors.bg
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                      name={invitation.recipientName}
                      email={invitation.recipientEmail}
                      size={32}
                      fontSize={13}
                    />
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: '#202124' }}>
                        {invitation.recipientName || invitation.recipientEmail}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5f6368', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {invitation.status === 'ACCEPTED' && <CheckCircle size={14} color={statusColors.text} />}
                        {invitation.status === 'DECLINED' && <XCircle size={14} color={statusColors.text} />}
                        {invitation.status === 'PENDING' && <Clock size={14} color={statusColors.text} />}
                        {invitation.status}
                      </p>
                      {invitation.responseNote && (
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '13px',
                          color: '#5f6368',
                          fontStyle: 'italic'
                        }}>
                          "{invitation.responseNote}"
                        </p>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: statusColors.text,
                    textTransform: 'uppercase',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'white'
                  }}>
                    {invitation.status === 'ACCEPTED' && <CheckCircle size={16} color={statusColors.text} />}
                    {invitation.status === 'DECLINED' && <XCircle size={16} color={statusColors.text} />}
                    {invitation.status === 'PENDING' && <Clock size={16} color={statusColors.text} />}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proposal Management Panel */}
      {summary && summary.proposedCount > 0 && (
        <div style={{ padding: '20px 24px', borderTop: '1px solid #e8eaed' }}>
          <ProposalManagementPanel eventId={eventId} />
        </div>
      )}
    </div>
  );
}
