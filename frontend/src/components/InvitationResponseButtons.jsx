import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiClient as api } from '../api/client';
import './InvitationResponseButtons.css';

export default function InvitationResponseButtons({ invitation, onSuccess }) {
  const queryClient = useQueryClient();

  const respondMutation = useMutation({
    mutationFn: async ({ status }) => {
      const payload = {
        status,
        responseNote: null,
      };

      const data = await api.patch(`/invitations/${invitation.id}`, payload);
      return data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['event-invitations'] });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('Failed to respond to invitation:', error);
    },
  });

  const handleQuickAccept = () => {
    respondMutation.mutate({ status: 'ACCEPTED' });
  };

  // If already responded, show current status with modern design
  if (invitation.status !== 'PENDING') {
    const isAccepted = invitation.status === 'ACCEPTED';
    const isProposed = invitation.status === 'PROPOSED';
    const isDeclined = invitation.status === 'DECLINED';
    const isSuperseded = invitation.status === 'SUPERSEDED';
    
    let bgColor = 'bg-gradient-to-br from-gray-50 to-white';
    let borderColor = 'border-gray-200';
    let textColor = 'text-gray-900';
    let badgeColor = 'bg-gray-100 text-gray-700';
    let icon = <XCircle className="h-6 w-6 text-gray-600" />;
    let statusText = 'responded to';
    
    if (isAccepted) {
      bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50';
      borderColor = 'border-green-200';
      textColor = 'text-green-900';
      badgeColor = 'bg-green-100 text-green-800';
      icon = <CheckCircle className="h-6 w-6 text-green-600" />;
      statusText = 'accepted';
    } else if (isProposed) {
      bgColor = 'bg-gradient-to-br from-blue-50 to-indigo-50';
      borderColor = 'border-blue-200';
      textColor = 'text-blue-900';
      badgeColor = 'bg-blue-100 text-blue-800';
      icon = <Clock className="h-6 w-6 text-blue-600" />;
      statusText = 'proposed an alternative time for';
    } else if (isDeclined) {
      bgColor = 'bg-gradient-to-br from-red-50 to-orange-50';
      borderColor = 'border-red-200';
      textColor = 'text-red-900';
      badgeColor = 'bg-red-100 text-red-800';
      icon = <XCircle className="h-6 w-6 text-red-600" />;
      statusText = 'declined';
    } else if (isSuperseded) {
      bgColor = 'bg-gradient-to-br from-gray-50 to-slate-50';
      borderColor = 'border-gray-300';
      textColor = 'text-gray-700';
      badgeColor = 'bg-gray-100 text-gray-600';
      icon = <XCircle className="h-6 w-6 text-gray-500" />;
      statusText = 'proposal superseded for';
    }
    
    return (
      <div className={`${bgColor} border ${borderColor} rounded-xl p-5 shadow-sm`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className={`text-sm font-semibold ${textColor}`}>
                You {statusText} this invitation
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                {invitation.status}
              </span>
            </div>
            
            {isProposed && invitation.proposedStart && invitation.proposedEnd && (
              <div className="bg-white/50 rounded-lg p-3 mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Proposed Time:</p>
                <p className="text-xs text-gray-600">
                  {new Date(invitation.proposedStart).toLocaleString()} - {new Date(invitation.proposedEnd).toLocaleTimeString()}
                </p>
              </div>
            )}
            
            {invitation.responseNote && (
              <div className="bg-white/50 rounded-lg p-3 mb-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Your note:</p>
                <p className="text-xs text-gray-600 italic">"{invitation.responseNote}"</p>
              </div>
            )}
            
            {invitation.respondedAt && (
              <p className="text-xs text-gray-500 mt-2">
                Responded on {new Date(invitation.respondedAt).toLocaleString()}
              </p>
            )}
            
            {isSuperseded && (
              <div className="bg-white/50 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-600">
                  💡 The organizer accepted a different time proposal
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="invitation-actions">
        <div className="invitation-actions__row invitation-actions__row--balanced">
          <button
            type="button"
            onClick={handleQuickAccept}
            disabled={respondMutation.isPending}
            className="invitation-button invitation-button--primary"
            aria-label="Accept invitation"
          >
            <CheckCircle className="invitation-button__icon" strokeWidth={2.2} aria-hidden="true" />
            <span>Accept Invitation</span>
          </button>

          <button
            type="button"
            onClick={() => respondMutation.mutate({ status: 'DECLINED' })}
            disabled={respondMutation.isPending}
            className="invitation-button invitation-button--danger"
            aria-label="Decline invitation"
          >
            <XCircle className="invitation-button__icon" strokeWidth={2.1} aria-hidden="true" />
            <span>Decline</span>
          </button>
        </div>
      </div>

      {respondMutation.isError && (
        <div className="invitation-error" role="alert" aria-live="assertive">
          <div className="invitation-error__body">
            <XCircle className="invitation-error__icon" strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="invitation-error__title">Failed to submit response</p>
              <p className="invitation-error__message">Please check your connection and try again.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
