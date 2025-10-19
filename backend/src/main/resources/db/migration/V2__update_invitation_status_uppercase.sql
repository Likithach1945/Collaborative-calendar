-- Update invitation status values to uppercase to match Java enum
UPDATE invitations SET status = 'PENDING' WHERE LOWER(status) = 'pending';
UPDATE invitations SET status = 'ACCEPTED' WHERE LOWER(status) = 'accepted';
UPDATE invitations SET status = 'DECLINED' WHERE LOWER(status) = 'declined';
