-- Add CANCELLED to the invitation status ENUM
-- This makes it compatible with the updated Java enum InvitationStatus
ALTER TABLE invitations 
MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'PROPOSED', 'SUPERSEDED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';