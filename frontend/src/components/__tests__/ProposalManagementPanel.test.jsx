import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ProposalManagementPanel from '../ProposalManagementPanel';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ProposalManagementPanel', () => {
  const mockEventId = 'event-123';

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.confirm and window.prompt
    global.confirm = vi.fn(() => true);
    global.prompt = vi.fn(() => 'Rejection note');
  });

  it('renders loading state initially', () => {
    api.fetchWithAuth.mockImplementation(() => new Promise(() => {}));

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText(/Loading proposals/i)).toBeInTheDocument();
  });

  it('renders empty state when no proposals', async () => {
    api.fetchWithAuth.mockResolvedValue([]);

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/No time proposals yet/i)).toBeInTheDocument();
    });
  });

  it('displays error state on fetch failure', async () => {
    api.fetchWithAuth.mockRejectedValue(new Error('Failed to fetch'));

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load proposals/i)).toBeInTheDocument();
    });
  });

  it('displays list of proposals with details', async () => {
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user1@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
        responseNote: 'I have a conflict at the original time',
        respondedAt: '2025-10-20T10:00:00Z',
      },
      {
        id: 'inv-2',
        recipientEmail: 'user2@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-27T10:00:00Z',
        proposedEnd: '2025-10-27T11:00:00Z',
        responseNote: null,
        respondedAt: '2025-10-20T11:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('Time Proposals (2)')).toBeInTheDocument();
      expect(screen.getByText('user1@example.com')).toBeInTheDocument();
      expect(screen.getByText('user2@example.com')).toBeInTheDocument();
      expect(screen.getByText('I have a conflict at the original time')).toBeInTheDocument();
    });
  });

  it('formats proposed times correctly', async () => {
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:30:00Z',
        respondedAt: '2025-10-20T10:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/Oct 26, 2025/i)).toBeInTheDocument();
      // Times will be formatted according to locale
      expect(screen.getByText(/2:00 PM/i)).toBeInTheDocument();
      expect(screen.getByText(/3:30 PM/i)).toBeInTheDocument();
    });
  });

  it('accepts proposal with confirmation', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);
    global.confirm = vi.fn(() => true);

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept proposal/i });
    await user.click(acceptButton);

    expect(global.confirm).toHaveBeenCalledWith(
      expect.stringContaining('Accept this time proposal')
    );

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        '/api/v1/invitations/inv-1/accept-proposal',
        { method: 'POST' }
      );
    });
  });

  it('does not accept proposal if confirmation is cancelled', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);
    global.confirm = vi.fn(() => false); // User cancels

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept proposal/i });
    await user.click(acceptButton);

    expect(global.confirm).toHaveBeenCalled();
    
    // Should not call API
    await waitFor(() => {
      const apiCalls = api.fetchWithAuth.mock.calls.filter(
        call => call[0].includes('accept-proposal')
      );
      expect(apiCalls).toHaveLength(0);
    });
  });

  it('rejects proposal with note', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);
    global.prompt = vi.fn(() => 'Original time works better');

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: /Reject proposal/i });
    await user.click(rejectButton);

    expect(global.prompt).toHaveBeenCalledWith(
      expect.stringContaining('Reject user@example.com'),
      expect.any(String)
    );

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        '/api/v1/invitations/inv-1/reject-proposal',
        {
          method: 'POST',
          body: JSON.stringify({ rejectionNote: 'Original time works better' }),
        }
      );
    });
  });

  it('does not reject proposal if prompt is cancelled', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);
    global.prompt = vi.fn(() => null); // User cancels

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const rejectButton = screen.getByRole('button', { name: /Reject proposal/i });
    await user.click(rejectButton);

    expect(global.prompt).toHaveBeenCalled();

    // Should not call API
    await waitFor(() => {
      const apiCalls = api.fetchWithAuth.mock.calls.filter(
        call => call[0].includes('reject-proposal')
      );
      expect(apiCalls).toHaveLength(0);
    });
  });

  it('disables buttons while mutation is pending', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('proposals')) {
        return Promise.resolve(mockProposals);
      }
      return new Promise(() => {}); // Hang for mutation
    });

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept proposal/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(acceptButton).toBeDisabled();
      const rejectButton = screen.getByRole('button', { name: /Reject proposal/i });
      expect(rejectButton).toBeDisabled();
    });
  });

  it('refreshes proposals when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockResolvedValue(mockProposals);

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    // Clear mock to track new calls
    api.fetchWithAuth.mockClear();
    api.fetchWithAuth.mockResolvedValue(mockProposals);

    const refreshButton = screen.getByRole('button', { name: /Refresh proposals/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/events/${mockEventId}/proposals`
      );
    });
  });

  it('shows success message after accepting proposal', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('proposals')) {
        return Promise.resolve(mockProposals);
      }
      if (url.includes('accept-proposal')) {
        return Promise.resolve({ success: true });
      }
    });

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept proposal/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText(/Proposal accepted/i)).toBeInTheDocument();
    });
  });

  it('shows error message on mutation failure', async () => {
    const user = userEvent.setup();
    const mockProposals = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'PROPOSED',
        proposedStart: '2025-10-26T14:00:00Z',
        proposedEnd: '2025-10-26T15:00:00Z',
      },
    ];

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('proposals')) {
        return Promise.resolve(mockProposals);
      }
      if (url.includes('accept-proposal')) {
        return Promise.reject(new Error('Network error'));
      }
    });

    render(<ProposalManagementPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Accept proposal/i });
    await user.click(acceptButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to process proposal/i)).toBeInTheDocument();
    });
  });
});
