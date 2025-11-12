import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Todos from '../components/Todos';

describe('Todos Component', () => {
  const mockOnUpdate = vi.fn();
  const mockApiUrl = 'http://localhost:8000/api';
  
  const mockGoals = [
    {
      id: 1,
      title: 'Learn React',
      status: 'active'
    }
  ];

  const mockTodos = [
    {
      id: 1,
      title: 'Complete React tutorial',
      description: 'Finish chapters 1-5',
      due_date: '2024-12-31T00:00:00',
      completed: false,
      goal_id: 1,
      goal: { id: 1, title: 'Learn React' },
      created_at: '2024-01-01T00:00:00'
    },
    {
      id: 2,
      title: 'Write tests',
      description: 'Add unit tests',
      due_date: null,
      completed: true,
      goal_id: null,
      goal: null,
      created_at: '2024-01-02T00:00:00'
    }
  ];

  beforeEach(() => {
    mockOnUpdate.mockClear();
    global.fetch = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  it('renders todos component with title', () => {
    render(<Todos todos={[]} goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('📋 Daily Todos')).toBeInTheDocument();
  });

  it('displays new todo button', () => {
    render(<Todos todos={[]} goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('+ New Todo')).toBeInTheDocument();
  });

  it('shows form when new todo button is clicked', () => {
    render(<Todos todos={[]} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const newButton = screen.getByText('+ New Todo');
    fireEvent.click(newButton);
    
    expect(screen.getByPlaceholderText('Todo title')).toBeInTheDocument();
    expect(screen.getByText('Create Todo')).toBeInTheDocument();
  });

  it('displays pending todos correctly', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('Pending (1)')).toBeInTheDocument();
    expect(screen.getByText('Complete React tutorial')).toBeInTheDocument();
    expect(screen.getByText('Finish chapters 1-5')).toBeInTheDocument();
  });

  it('displays completed todos correctly', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('shows empty state when no pending todos', () => {
    render(<Todos todos={[]} goals={[]} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    expect(screen.getByText('No pending todos. Great job! 🎉')).toBeInTheDocument();
  });

  it('displays goal association for todos', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    expect(screen.getByText('🎯 Learn React')).toBeInTheDocument();
  });

  it('renders checkboxes for todos', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(true);
  });

  it('toggles todo completion status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/todos/1`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: true })
        })
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('submits form to create new todo', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Todos todos={[]} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    // Open form
    fireEvent.click(screen.getByText('+ New Todo'));
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Todo title'), {
      target: { value: 'New Test Todo' }
    });
    fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
      target: { value: 'Test description' }
    });
    
    // Submit
    fireEvent.click(screen.getByText('Create Todo'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/todos`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles edit todo functionality', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const editButtons = screen.getAllByText('✏️');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByDisplayValue('Complete React tutorial')).toBeInTheDocument();
    expect(screen.getByText('Update Todo')).toBeInTheDocument();
  });

  it('handles delete todo with confirmation', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });
    
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const deleteButtons = screen.getAllByText('🗑️');
    fireEvent.click(deleteButtons[0]);
    
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockApiUrl}/todos/1`,
        { method: 'DELETE' }
      );
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('displays goal selector in form', () => {
    render(<Todos todos={[]} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    fireEvent.click(screen.getByText('+ New Todo'));
    
    expect(screen.getByText('No goal (standalone todo)')).toBeInTheDocument();
    expect(screen.getByText('🎯 Learn React')).toBeInTheDocument();
  });

  it('formats due date correctly', () => {
    render(<Todos todos={mockTodos} goals={mockGoals} onUpdate={mockOnUpdate} apiUrl={mockApiUrl} />);
    
    const dateElements = screen.getAllByText(/📅/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});
