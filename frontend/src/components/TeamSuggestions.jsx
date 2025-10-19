import React from 'react';
import { Users, Plus, X } from 'lucide-react';
import './TeamSuggestions.css';

/**
 * Component to display suggested team members
 * Allows quick selection of collaborators when creating an event
 */
function TeamSuggestions({ 
  collaborators, 
  selectedEmails, 
  onAddCollaborator,
  onRemoveCollaborator,
  isLoading 
}) {
  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  // Filter out already selected collaborators
  const availableCollaborators = collaborators.filter(
    c => !selectedEmails.includes(c.email)
  );

  if (availableCollaborators.length === 0 && selectedEmails.length === 0) {
    return null;
  }

  return (
    <div className="team-suggestions">
      <div className="suggestions-header">
        <Users size={18} />
        <h4>Suggested Team Members</h4>
      </div>

      {/* Selected collaborators */}
      {selectedEmails.length > 0 && (
        <div className="selected-collaborators">
          {collaborators
            .filter(c => selectedEmails.includes(c.email))
            .map(collaborator => (
              <div key={collaborator.email} className="selected-tag">
                <span className="collaborator-name">{collaborator.displayName || collaborator.email}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => onRemoveCollaborator(collaborator.email)}
                  aria-label={`Remove ${collaborator.displayName}`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Available collaborators to add */}
      {availableCollaborators.length > 0 && (
        <div className="available-collaborators">
          {isLoading ? (
            <div className="loading-suggestions">Loading team members...</div>
          ) : (
            availableCollaborators.map(collaborator => (
              <div key={collaborator.email} className="collaborator-item">
                <div className="collaborator-info">
                  <div className="collaborator-name">{collaborator.displayName || collaborator.email}</div>
                  <div className="collaborator-email">{collaborator.email}</div>
                  {collaborator.collaborationCount > 0 && (
                    <div className="collaboration-count">
                      {collaborator.collaborationCount} meeting{collaborator.collaborationCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="add-btn"
                  onClick={() => onAddCollaborator(collaborator.email)}
                  aria-label={`Add ${collaborator.displayName}`}
                >
                  <Plus size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default TeamSuggestions;
