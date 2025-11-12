import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Goals from '../components/Goals';

describe('Goals Component', () => {
  const mockOnUpdate = vi.fn();
  const mockApiUrl = 'http://localhost:8000/api';
  
  const mockGoals = [
    {
      id: 1,
      title: 'Learn React',
      description: 'Complete React tutorial',
      target_date: '2024-12-31T00:00:00',
      status: 'active',
      created_at: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      title: 'Build Portfolio',
      description: 'Create personal website',
      target_date: '2024-06-30T00:00:00',
      status: 'completed',
      created_at: '2024-01-01T00:00:00'
    }
  ];

  beforeEach(() => {
    mockOnUpdate.mockClear();
    global.fetch = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  it('renders goals component with title', () => {
    render(<Goals goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('🎯 Goals')).toBeInTheDocument();
  });

  it('displays new goal button', () => {
    render(<Goals goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('+ New Goal')).toBeInTheDocument();
  });

  it('shows form when new goal button is clicked', () => {
    render(<Goals goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const newButton = screen.getByText('+ New Goal');
    fireEvent.click(newButton);
    
    expect(screen.getByPlaceholderText('Goal title')).toBeInTheDocument();
    expect(screen.getByText('Create Goal')).toBeInTheDocument();
  });

  it('displays active goals correctly', () => {
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('Active Goals (1)')).toBeInTheDocument();
    expect(screen.getByText('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Complete React tutorial')).toBeInTheDocument();
  });

  it('displays completed goals correctly', () => {
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('Completed Goals (1)')).toBeInTheDocument();
    expect(screen.getByText('Build Portfolio')).toBeInTheDocument();
  });

  it('shows empty state when no active goals', () => {
    render(<Goals goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('No active goals. Create one to get started!')).toBeInTheDocument();
  });

  it('submits form to create new goal', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Goals goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Open form
    fireEvent.click(screen.getByText('+ New Goal'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Goal title'), {
      target: { value: 'New Test Goal' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'Test description' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Create Goal'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/goals`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles edit goal functionality', () => {
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const editButtons = screen.getAllByText('✏️ Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Learn React')).toBeInTheDocument();
    expect(screen.getByText('Update Goal')).toBeInTheDocument();
  });

  it('handles delete goal with confirmation', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const deleteButtons = screen.getAllByText('🗑️ Delete');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/goals/1`,
        { method: 'DELETE' }
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('displays goal status badge', () => {
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const badges = screen.getAllByText('active');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('formats target date correctly', () => {
    render(<Goals goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText(/Target:/)).toBeInTheDocument();
  });
});
