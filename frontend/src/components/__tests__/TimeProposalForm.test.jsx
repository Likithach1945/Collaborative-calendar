import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeProposalForm from '../TimeProposalForm';

describe('TimeProposalForm', () => {
  const mockInvitation = {
    id: 'inv-123',
    event: {
      startTime: '2025-10-25T10:00:00Z',
      endTime: '2025-10-25T11:00:00Z',
    },
  };

  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with current event time reference', () => {
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Propose Alternative Time')).toBeInTheDocument();
    expect(screen.getByText('Current Time:')).toBeInTheDocument();
    expect(screen.getByText(/Oct 25, 2025/i)).toBeInTheDocument();
  });

  it('has required datetime inputs', () => {
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
    expect(startInput).toHaveAttribute('type', 'datetime-local');
    expect(endInput).toHaveAttribute('type', 'datetime-local');
    expect(startInput).toBeRequired();
    expect(endInput).toBeRequired();
  });

  it('has optional note textarea with character limit', () => {
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const noteInput = screen.getByLabelText(/Reason for Proposal/i);
    expect(noteInput).toBeInTheDocument();
    expect(noteInput).not.toBeRequired();
    expect(noteInput).toHaveAttribute('maxLength', '500');
    expect(screen.getByText('0 / 500')).toBeInTheDocument();
  });

  it('updates character count as user types', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const noteInput = screen.getByLabelText(/Reason for Proposal/i);
    await user.type(noteInput, 'I have a conflict');

    expect(screen.getByText('17 / 500')).toBeInTheDocument();
  });

  it('validates that both start and end times are provided', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select both start and end times/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates that end time is after start time', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);

    // Set end time before start time
    await user.type(startInput, '2025-10-26T14:00');
    await user.type(endInput, '2025-10-26T13:00'); // Earlier than start

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/End time must be after start time/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits proposal with valid times and note', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);
    const noteInput = screen.getByLabelText(/Reason for Proposal/i);

    await user.type(startInput, '2025-10-26T14:00');
    await user.type(endInput, '2025-10-26T15:00');
    await user.type(noteInput, 'I have a conflict at the original time');

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        proposedStart: expect.stringContaining('2025-10-26'),
        proposedEnd: expect.stringContaining('2025-10-26'),
        note: 'I have a conflict at the original time',
      });
    });
  });

  it('submits proposal without note', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);

    await user.type(startInput, '2025-10-26T14:00');
    await user.type(endInput, '2025-10-26T15:00');

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        proposedStart: expect.any(String),
        proposedEnd: expect.any(String),
        note: '',
      });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears error when user fixes invalid input', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // First, trigger an error
    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please select both start and end times/i)).toBeInTheDocument();
    });

    // Now fix the input and submit again
    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);

    await user.type(startInput, '2025-10-26T14:00');
    await user.type(endInput, '2025-10-26T15:00');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(/Please select both start and end times/i)).not.toBeInTheDocument();
    });
  });

  it('handles invitation without event time gracefully', () => {
    const invitationWithoutEvent = { id: 'inv-456', event: null };

    render(
      <TimeProposalForm
        invitation={invitationWithoutEvent}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Should still render form, just without current time reference
    expect(screen.getByText('Propose Alternative Time')).toBeInTheDocument();
    expect(screen.queryByText('Current Time:')).not.toBeInTheDocument();
  });

  it('converts datetime-local input to ISO string for submission', async () => {
    const user = userEvent.setup();
    render(
      <TimeProposalForm
        invitation={mockInvitation}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const startInput = screen.getByLabelText(/Proposed Start Time/i);
    const endInput = screen.getByLabelText(/Proposed End Time/i);

    await user.type(startInput, '2025-10-26T14:00');
    await user.type(endInput, '2025-10-26T15:30');

    const submitButton = screen.getByRole('button', { name: /Submit Proposal/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          proposedStart: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          proposedEnd: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        })
      );
    });
  });
});
