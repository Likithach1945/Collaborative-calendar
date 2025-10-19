import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import InvitationStatusPanel from '../InvitationStatusPanel';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchInterval: false, // Disable polling in tests
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

describe('InvitationStatusPanel', () => {
  const mockEventId = 'event-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    api.fetchWithAuth.mockImplementation(() => new Promise(() => {}));
    
    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Invitation Status')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /loading invitation summary/i })).toBeInTheDocument();
  });

  it('displays invitation summary with correct stats', async () => {
    const mockSummary = {
      totalInvitations: 5,
      acceptedCount: 3,
      declinedCount: 1,
      pendingCount: 1,
      acceptanceRate: 60.0,
    };

    const mockInvitations = [
      {
        id: 'inv-1',
        recipientEmail: 'user1@example.com',
        status: 'ACCEPTED',
        responseNote: 'Looking forward to it!',
        respondedAt: '2025-10-15T10:00:00Z',
      },
      {
        id: 'inv-2',
        recipientEmail: 'user2@example.com',
        status: 'DECLINED',
        responseNote: 'Sorry, I have a conflict',
        respondedAt: '2025-10-15T11:00:00Z',
      },
      {
        id: 'inv-3',
        recipientEmail: 'user3@example.com',
        status: 'PENDING',
        responseNote: null,
        respondedAt: null,
      },
    ];

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('/summary')) {
        return Promise.resolve(mockSummary);
      }
      return Promise.resolve(mockInvitations);
    });

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Accepted count
      expect(screen.getByText('1')).toBeInTheDocument(); // Declined count
      expect(screen.getByText('60%')).toBeInTheDocument(); // Acceptance rate
    });

    // Verify detailed list
    expect(screen.getByText('user1@example.com')).toBeInTheDocument();
    expect(screen.getByText('user2@example.com')).toBeInTheDocument();
    expect(screen.getByText('user3@example.com')).toBeInTheDocument();
    expect(screen.getByText('Looking forward to it!')).toBeInTheDocument();
    expect(screen.getByText('Sorry, I have a conflict')).toBeInTheDocument();
  });

  it('displays zero acceptance rate when no acceptances', async () => {
    const mockSummary = {
      totalInvitations: 3,
      acceptedCount: 0,
      declinedCount: 2,
      pendingCount: 1,
      acceptanceRate: 0.0,
    };

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('/summary')) {
        return Promise.resolve(mockSummary);
      }
      return Promise.resolve([]);
    });

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    api.fetchWithAuth.mockRejectedValue(new Error('Failed to fetch'));

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load invitation status/i)).toBeInTheDocument();
    });
  });

  it('displays empty state when no invitations exist', async () => {
    const mockSummary = {
      totalInvitations: 0,
      acceptedCount: 0,
      declinedCount: 0,
      pendingCount: 0,
      acceptanceRate: 0.0,
    };

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('/summary')) {
        return Promise.resolve(mockSummary);
      }
      return Promise.resolve([]);
    });

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(screen.getByText('No invitations sent yet.')).toBeInTheDocument();
    });
  });

  it('calls API with correct endpoints', async () => {
    const mockSummary = {
      totalInvitations: 1,
      acceptedCount: 1,
      declinedCount: 0,
      pendingCount: 0,
      acceptanceRate: 100.0,
    };

    api.fetchWithAuth.mockResolvedValue(mockSummary);

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/events/${mockEventId}/invitations/summary`
      );
      expect(api.fetchWithAuth).toHaveBeenCalledWith(
        `/api/v1/events/${mockEventId}/invitations`
      );
    });
  });

  it('formats timestamps correctly', async () => {
    const mockInvitations = [
      {
        id: 'inv-1',
        recipientEmail: 'user@example.com',
        status: 'ACCEPTED',
        responseNote: null,
        respondedAt: '2025-10-15T14:30:00Z',
      },
    ];

    const mockSummary = {
      totalInvitations: 1,
      acceptedCount: 1,
      declinedCount: 0,
      pendingCount: 0,
      acceptanceRate: 100.0,
    };

    api.fetchWithAuth.mockImplementation((url) => {
      if (url.includes('/summary')) {
        return Promise.resolve(mockSummary);
      }
      return Promise.resolve(mockInvitations);
    });

    render(<InvitationStatusPanel eventId={mockEventId} />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      // Should display formatted date (format depends on date-fns locale)
      expect(screen.getByText(/Oct 15, 2025/i)).toBeInTheDocument();
    });
  });
});
