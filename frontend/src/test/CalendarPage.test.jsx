import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderWithProviders, screen, waitFor } from './testUtils';
import CalendarPage from '../pages/CalendarPage';
import * as useEventsModule from '../hooks/useEvents';
import * as useAuthModule from '../contexts/AuthContext';

describe('CalendarPage Integration Tests', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    displayName: 'Test User',
    timezone: 'America/New_York',
  };

  const mockEvents = [
    {
      id: '1',
      title: 'Team Meeting',
      description: 'Weekly sync',
      startDateTime: new Date('2025-10-16T14:00:00Z'),
      endDateTime: new Date('2025-10-16T15:00:00Z'),
      timezone: 'America/New_York',
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Project Review',
      description: 'Q4 Review',
      startDateTime: new Date('2025-10-16T16:00:00Z'),
      endDateTime: new Date('2025-10-16T17:00:00Z'),
      timezone: 'America/New_York',
    },
  ];

  beforeEach(() => {
    // Mock useAuth hook
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: mockUser,
      token: 'mock-token',
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: () => true,
    });

    // Mock useEvents hook
    vi.spyOn(useEventsModule, 'useEvents').mockReturnValue({
      data: mockEvents,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should display calendar page with user information', async () => {
    renderWithProviders(<CalendarPage />);

    // Check header
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  it('should display day view with events', async () => {
    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      // Check events are displayed
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('Project Review')).toBeInTheDocument();
    });
  });

  it('should have view mode toggle buttons', () => {
    renderWithProviders(<CalendarPage />);

    const dayButton = screen.getByRole('button', { name: 'Day' });
    const weekButton = screen.getByRole('button', { name: 'Week' });

    expect(dayButton).toBeInTheDocument();
    expect(weekButton).toBeInTheDocument();
    expect(dayButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should have navigation buttons', () => {
    renderWithProviders(<CalendarPage />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('should display loading state', () => {
    // Mock loading state
    vi.spyOn(useEventsModule, 'useEvents').mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<CalendarPage />);

    expect(screen.getByText(/loading events/i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    // Mock error state
    vi.spyOn(useEventsModule, 'useEvents').mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to fetch events'),
      refetch: vi.fn(),
    });

    renderWithProviders(<CalendarPage />);

    expect(screen.getByText(/error loading events/i)).toBeInTheDocument();
  });

  it('should display empty state when no events', () => {
    // Mock empty events
    vi.spyOn(useEventsModule, 'useEvents').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    renderWithProviders(<CalendarPage />);

    expect(screen.getByText(/no events scheduled/i)).toBeInTheDocument();
  });

  it('should be keyboard navigable', () => {
    renderWithProviders(<CalendarPage />);

    const dayButton = screen.getByRole('button', { name: 'Day' });
    const weekButton = screen.getByRole('button', { name: 'Week' });
    const todayButton = screen.getByRole('button', { name: 'Today' });

    // All buttons should be focusable
    dayButton.focus();
    expect(document.activeElement).toBe(dayButton);

    weekButton.focus();
    expect(document.activeElement).toBe(weekButton);

    todayButton.focus();
    expect(document.activeElement).toBe(todayButton);
  });
});
