import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import InvitationsPage from '../InvitationsPage';
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

describe('InvitationsPage', () => {
  const mockInvitations = [
    {
      id: 'inv-1',
      status: 'PENDING',
      responseNote: null,
      respondedAt: null,
      event: {
        id: 'event-1',
        title: 'Team Meeting',
        startTime: '2025-10-20T10:00:00Z',
        endTime: '2025-10-20T11:00:00Z',
        location: 'Conference Room A',
        description: 'Weekly team sync',
        organizer: {
          email: 'organizer@example.com',
          displayName: 'John Doe',
        },
      },
    },
    {
      id: 'inv-2',
      status: 'ACCEPTED',
      responseNote: 'See you there!',
      respondedAt: '2025-10-15T10:00:00Z',
      event: {
        id: 'event-2',
        title: 'Project Review',
        startTime: '2025-10-22T14:00:00Z',
        endTime: '2025-10-22T15:00:00Z',
        location: 'Zoom',
        description: 'Q4 project review',
        organizer: {
          email: 'manager@example.com',
          displayName: 'Jane Smith',
        },
      },
    },
    {
      id: 'inv-3',
      status: 'DECLINED',
      responseNote: 'Have a conflict',
      respondedAt: '2025-10-14T09:00:00Z',
      event: {
        id: 'event-3',
        title: 'Optional Workshop',
        startTime: '2025-10-25T13:00:00Z',
        endTime: '2025-10-25T16:00:00Z',
        location: 'Training Room',
        description: 'Optional training session',
        organizer: {
          email: 'trainer@example.com',
          displayName: 'Bob Wilson',
        },
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header and navigation', async () => {
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    expect(screen.getByText('My Invitations')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to calendar/i })).toBeInTheDocument();
  });

  it('displays all invitations by default', async () => {
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Project Review')).toBeInTheDocument();
      expect(screen.getByText('Optional Workshop')).toBeInTheDocument();
    });

    // Verify API called without status filter
    expect(api.fetchWithAuth).toHaveBeenCalledWith('/api/v1/invitations');
  });

  it('filters pending invitations', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue([mockInvitations[0]]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    // Click Pending tab
    await user.click(screen.getByRole('button', { name: /pending/i }));

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith('/api/v1/invitations?status=PENDING');
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });
  });

  it('filters accepted invitations', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue([mockInvitations[1]]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    // Click Accepted tab
    await user.click(screen.getByRole('button', { name: /accepted/i }));

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith('/api/v1/invitations?status=ACCEPTED');
      expect(screen.getByText('Project Review')).toBeInTheDocument();
    });
  });

  it('filters declined invitations', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue([mockInvitations[2]]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    // Click Declined tab
    await user.click(screen.getByRole('button', { name: /declined/i }));

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalledWith('/api/v1/invitations?status=DECLINED');
      expect(screen.getByText('Optional Workshop')).toBeInTheDocument();
    });
  });

  it('displays invitation counts in tabs', async () => {
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('All (3)')).toBeInTheDocument();
      expect(screen.getByText('Pending (1)')).toBeInTheDocument();
      expect(screen.getByText('Accepted (1)')).toBeInTheDocument();
      expect(screen.getByText('Declined (1)')).toBeInTheDocument();
    });
  });

  it('displays empty state when no invitations', async () => {
    api.fetchWithAuth.mockResolvedValue([]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/no invitations found/i)).toBeInTheDocument();
    });
  });

  it('displays loading state', () => {
    api.fetchWithAuth.mockImplementation(() => new Promise(() => {}));

    render(<InvitationsPage />, { wrapper: createWrapper() });

    // Should show skeleton loaders
    expect(screen.getAllByRole('status', { hidden: true })).toHaveLength(3);
  });

  it('handles API error', async () => {
    api.fetchWithAuth.mockRejectedValue(new Error('Failed to fetch'));

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/failed to load invitations/i)).toBeInTheDocument();
    });
  });

  it('displays event details correctly', async () => {
    api.fetchWithAuth.mockResolvedValue([mockInvitations[0]]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText(/Oct 20, 2025/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 AM - 11:00 AM/i)).toBeInTheDocument();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('Weekly team sync')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('organizer@example.com')).toBeInTheDocument();
    });
  });

  it('integrates invitation response buttons', async () => {
    api.fetchWithAuth.mockResolvedValue([mockInvitations[0]]);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    });

    // Clear mock calls
    api.fetchWithAuth.mockClear();
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    // Click refresh
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(api.fetchWithAuth).toHaveBeenCalled();
    });
  });

  it('highlights active filter tab', async () => {
    const user = userEvent.setup();
    api.fetchWithAuth.mockResolvedValue(mockInvitations);

    render(<InvitationsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      const allTab = screen.getByRole('button', { name: /all/i });
      expect(allTab).toHaveAttribute('aria-current', 'true');
    });

    // Switch to Pending tab
    await user.click(screen.getByRole('button', { name: /pending/i }));

    await waitFor(() => {
      const pendingTab = screen.getByRole('button', { name: /pending/i });
      expect(pendingTab).toHaveAttribute('aria-current', 'true');
    });
  });
});
