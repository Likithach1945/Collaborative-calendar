-- Alter the invitation status ENUM to use uppercase values
-- This makes it compatible with the Java enum InvitationStatus
ALTER TABLE invitations 
MODIFY COLUMN status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'PROPOSED', 'SUPERSEDED') NOT NULL DEFAULT 'PENDING';

-- Update any existing lowercase values to uppercase
UPDATE invitations SET status = 'PENDING' WHERE status = 'pending';
UPDATE invitations SET status = 'ACCEPTED' WHERE status = 'accepted';
UPDATE invitations SET status = 'DECLINED' WHERE status = 'declined';
