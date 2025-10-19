import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import InvitationResponseButtons from '../InvitationResponseButtons';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('InvitationResponseButtons', () => {
  const mockInvitation = {
    id: 'inv-123',
    status: 'PENDING',
    responseNote: null,
    respondedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders accept and decline buttons for pending invitation', () => {
    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('accepts invitation without note', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue({
      ...mockInvitation,
      status: 'ACCEPTED',
      respondedAt: '2025-10-16T10:00:00Z',
    });

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/invitations/${mockInvitation.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'ACCEPTED' }),
        }
      );
    });
  });

  it('shows note input when decline button is clicked', async () => {
    const user = userEvent.setup();

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    const declineButton = screen.getByRole('button', { name: /decline/i });
    await user.click(declineButton);

    expect(screen.getByPlaceholderText(/optional: explain why/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm decline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('declines invitation with note', async () => {
    const user = userEvent.setup();
    const noteText = 'Sorry, I have a conflict that day';
    
    api.fetchWithAuth.mockResolvedValue({
      ...mockInvitation,
      status: 'DECLINED',
      responseNote: noteText,
      respondedAt: '2025-10-16T10:00:00Z',
    });

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    // Click decline to show note input
    await user.click(screen.getByRole('button', { name: /decline/i }));

    // Enter note
    const textarea = screen.getByPlaceholderText(/optional: explain why/i);
    await user.type(textarea, noteText);

    // Confirm decline
    await user.click(screen.getByRole('button', { name: /confirm decline/i }));

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/invitations/${mockInvitation.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'DECLINED',
            responseNote: noteText,
          }),
        }
      );
    });
  });

  it('enforces 500 character limit on note', async () => {
    const user = userEvent.setup();
    const longText = 'a'.repeat(600);

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole('button', { name: /decline/i }));
    
    const textarea = screen.getByPlaceholderText(/optional: explain why/i);
    await user.type(textarea, longText);

    // Should display character count
    expect(screen.getByText(/600 \/ 500/)).toBeInTheDocument();
    
    // Confirm button should be disabled when over limit
    const confirmButton = screen.getByRole('button', { name: /confirm decline/i });
    expect(confirmButton).toBeDisabled();
  });

  it('allows adding note to acceptance', async () => {
    const user = userEvent.setup();
    const noteText = 'Looking forward to it!';
    
    api.fetchWithAuth.mockResolvedValue({
      ...mockInvitation,
      status: 'ACCEPTED',
      responseNote: noteText,
      respondedAt: '2025-10-16T10:00:00Z',
    });

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    // Click "Add Note" link
    await user.click(screen.getByText(/add note/i));

    // Enter note
    const textarea = screen.getByPlaceholderText(/optional: add a message/i);
    await user.type(textarea, noteText);

    // Confirm accept with note
    await user.click(screen.getByRole('button', { name: /confirm accept/i }));

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/invitations/${mockInvitation.id}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: 'ACCEPTED',
            responseNote: noteText,
          }),
        }
      );
    });
  });

  it('cancels note input and returns to buttons', async () => {
    const user = userEvent.setup();

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    // Click decline to show note input
    await user.click(screen.getByRole('button', { name: /decline/i }));
    expect(screen.getByPlaceholderText(/optional: explain why/i)).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    // Should return to original buttons
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
  });

  it('displays accepted status for accepted invitation', () => {
    const acceptedInvitation = {
      ...mockInvitation,
      status: 'ACCEPTED',
      responseNote: 'Great!',
      respondedAt: '2025-10-15T10:00:00Z',
    };

    render(<InvitationResponseButtons invitation={acceptedInvitation} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByText('Great!')).toBeInTheDocument();
    expect(screen.getByText(/Oct 15, 2025/i)).toBeInTheDocument();
  });

  it('displays declined status for declined invitation', () => {
    const declinedInvitation = {
      ...mockInvitation,
      status: 'DECLINED',
      responseNote: 'Sorry, cannot make it',
      respondedAt: '2025-10-15T11:00:00Z',
    };

    render(<InvitationResponseButtons invitation={declinedInvitation} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/declined/i)).toBeInTheDocument();
    expect(screen.getByText('Sorry, cannot make it')).toBeInTheDocument();
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockRejectedValue(new Error('Network error'));

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole('button', { name: /accept/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to respond/i)).toBeInTheDocument();
    });
  });

  it('disables buttons while mutation is in progress', async () => {
    const user = userEvent.setup();
    
    // Make API call hang
    api.fetchWithAuth.mockImplementation(() => new Promise(() => {}));

    render(<InvitationResponseButtons invitation={mockInvitation} />, {
      wrapper: createWrapper(),
    });

    const acceptButton = screen.getByRole('button', { name: /accept/i });
    await user.click(acceptButton);

    // Buttons should be disabled during mutation
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /responding/i })).toBeDisabled();
    });
  });
});
