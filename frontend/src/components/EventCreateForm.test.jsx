import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCreateForm from './EventCreateForm';

describe('EventCreateForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const userTimezone = 'America/New_York';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date & time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date & time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/video conference link/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/participants/i)).toBeInTheDocument();
    expect(screen.getByText(/create event/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });

  it('shows validation error when title is missing', async () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error when end time is before start time', async () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const startInput = screen.getByLabelText(/start date & time/i);
    const endInput = screen.getByLabelText(/end date & time/i);

    fireEvent.change(titleInput, { target: { value: 'Test Meeting' } });
    fireEvent.change(startInput, { target: { value: '2024-12-01T14:00' } });
    fireEvent.change(endInput, { target: { value: '2024-12-01T13:00' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows validation error for invalid email addresses', async () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const participantsInput = screen.getByLabelText(/participants/i);

    fireEvent.change(titleInput, { target: { value: 'Test Meeting' } });
    fireEvent.change(participantsInput, { target: { value: 'invalid-email, another-bad' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/one or more email addresses are invalid/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue();

    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const startInput = screen.getByLabelText(/start date & time/i);
    const endInput = screen.getByLabelText(/end date & time/i);
    const locationInput = screen.getByLabelText(/location/i);
    const participantsInput = screen.getByLabelText(/participants/i);

    fireEvent.change(titleInput, { target: { value: 'Team Meeting' } });
    fireEvent.change(descriptionInput, { target: { value: 'Discuss Q1 goals' } });
    fireEvent.change(startInput, { target: { value: '2024-12-01T14:00' } });
    fireEvent.change(endInput, { target: { value: '2024-12-01T15:00' } });
    fireEvent.change(locationInput, { target: { value: 'Conference Room A' } });
    fireEvent.change(participantsInput, { target: { value: 'alice@example.com, bob@example.com' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Team Meeting',
          description: 'Discuss Q1 goals',
          location: 'Conference Room A',
          timezone: userTimezone,
          participants: ['alice@example.com', 'bob@example.com'],
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons while submitting', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Meeting' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(screen.getByText(/creating.../i)).toBeInTheDocument();
    });
  });

  it('shows timezone preview when participants are entered', async () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const participantsInput = screen.getByLabelText(/participants/i);
    fireEvent.change(participantsInput, { target: { value: 'alice@example.com' } });

    await waitFor(() => {
      expect(screen.getByText(/time in other timezones:/i)).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    await waitFor(() => {
      expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
    });
  });

  it('handles submit error gracefully', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'));

    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone={userTimezone}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'Test Meeting' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('converts datetime to UTC correctly', async () => {
    mockOnSubmit.mockResolvedValue();

    render(
      <EventCreateForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        userTimezone="America/Los_Angeles"
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const startInput = screen.getByLabelText(/start date & time/i);
    const endInput = screen.getByLabelText(/end date & time/i);

    fireEvent.change(titleInput, { target: { value: 'Test Meeting' } });
    fireEvent.change(startInput, { target: { value: '2024-12-01T10:00' } });
    fireEvent.change(endInput, { target: { value: '2024-12-01T11:00' } });

    const submitButton = screen.getByRole('button', { name: /create event/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const callArg = mockOnSubmit.mock.calls[0][0];
      expect(callArg.startDateTime).toMatch(/Z$/); // Should end with Z (UTC)
      expect(callArg.endDateTime).toMatch(/Z$/);
    });
  });
});
