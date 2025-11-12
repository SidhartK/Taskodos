import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Calendar from '../components/Calendar';

describe('Calendar Component', () => {
  const mockOnUpdate = vi.fn();
  const mockApiUrl = 'http://localhost:8000/api';
  
  const mockEvents = [
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly sync',
      event_date: '2024-12-31T00:00:00',
      todo_id: null,
      goal_id: null,
      created_at: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      title: 'Complete React tutorial',
      description: '',
      event_date: '2024-06-15T00:00:00',
      todo_id: 1,
      goal_id: null,
      created_at: '2024-01-02T00:00:00'
    },
    {
      id: 3,
      title: 'Learn React',
      description: '',
      event_date: '2024-06-30T00:00:00',
      todo_id: null,
      goal_id: 1,
      created_at: '2024-01-03T00:00:00'
    }
  ];

  beforeEach(() => {
    mockOnUpdate.mockClear();
    global.fetch = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  it('renders calendar component with title', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('📅 Calendar')).toBeInTheDocument();
  });

  it('displays view mode buttons', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('List View')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('displays new event button', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('+ New Event')).toBeInTheDocument();
  });

  it('shows form when new event button is clicked', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const newButton = screen.getByText('+ New Event');
    fireEvent.click(newButton);
    
    expect(screen.getByPlaceholderText('Event title')).toBeInTheDocument();
    expect(screen.getByText('Create Event')).toBeInTheDocument();
  });

  it('displays events in list view', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Complete React tutorial')).toBeInTheDocument();
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  it('shows empty state when no events', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('No calendar events yet. Create one or add a todo/goal with a date!')).toBeInTheDocument();
  });

  it('switches to upcoming view', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const upcomingButton = screen.getByText('Upcoming');
    fireEvent.click(upcomingButton);
    
    expect(screen.getByText(/Upcoming Events/)).toBeInTheDocument();
  });

  it('displays badges for auto-generated events', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('📋 Todo')).toBeInTheDocument();
    expect(screen.getByText('🎯 Goal')).toBeInTheDocument();
  });

  it('shows auto-generated label for linked events', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const autoLabels = screen.getAllByText('Auto-generated');
    expect(autoLabels.length).toBe(2);
  });

  it('allows editing manual events only', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Only 1 edit button should be present (for the manual event)
    const editButtons = screen.getAllByText('✏️');
    expect(editButtons.length).toBe(1);
  });

  it('submits form to create new event', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Open form
    fireEvent.click(screen.getByText('+ New Event'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Event title'), {
      target: { value: 'New Test Event' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'Test description' }
    });
    
    const dateInput = screen.getByDisplayValue('');
    fireEvent.change(dateInput, {
      target: { value: '2024-12-31' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Create Event'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/calendar`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles edit event functionality', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const editButton = screen.getByText('✏️');
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Update Event')).toBeInTheDocument();
  });

  it('handles delete event with confirmation', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const deleteButton = screen.getByText('🗑️');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/calendar/1`,
        { method: 'DELETE' }
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('groups events by date in list view', () => {
    render(<Calendar events={mockEvents} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Date headers should be present
    const dateHeaders = document.querySelectorAll('.date-header');
    expect(dateHeaders.length).toBeGreaterThan(0);
  });

  it('cancels form when cancel button is clicked', () => {
    render(<Calendar events={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Open form
    fireEvent.click(screen.getByText('+ New Event'));
    expect(screen.getByPlaceholderText('Event title')).toBeInTheDocument();
    
    // Cancel form
    const cancelButtons = screen.getAllByText('Cancel');
    fireEvent.click(cancelButtons[0]); // First cancel button (in header)
    
    // Form should be hidden
    expect(screen.queryByPlaceholderText('Event title')).not.toBeInTheDocument();
  });
});
