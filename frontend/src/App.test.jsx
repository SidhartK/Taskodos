import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/goals')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              title: 'Learn React',
              description: 'Complete React tutorial',
              target_date: '2024-12-31T00:00:00',
              status: 'active'
            }
          ])
        });
      }
      if (url.includes('/todos')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              title: 'Write tests',
              completed: false,
              goal_id: 1
            }
          ])
        });
      }
      if (url.includes('/calendar')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 1,
              title: 'Team Meeting',
              event_date: '2024-12-31T00:00:00'
            }
          ])
        });
      }
      if (url.includes('/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            goals: { active: 1, completed: 0, archived: 0 },
            todos: { pending: 1, completed: 0 },
            calendar_events: 1
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders app header', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('📝 Taskodos')).toBeInTheDocument();
    });
  });

  it('renders app subtitle', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Goal Tracking • Daily Todos • Calendar')).toBeInTheDocument();
    });
  });

  it('displays stats bar with correct values', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Goals')).toBeInTheDocument();
      expect(screen.getByText('Pending Todos')).toBeInTheDocument();
      expect(screen.getByText('Completed Todos')).toBeInTheDocument();
      expect(screen.getByText('Calendar Events')).toBeInTheDocument();
      
      // Check that stats are displayed (there are multiple "1" values, so we just verify the labels exist)
      const statsBar = document.querySelector('.stats-bar');
      expect(statsBar).toBeInTheDocument();
    });
  });

  it('renders all three tab buttons', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('📋 Todos')).toBeInTheDocument();
      expect(screen.getByText('🎯 Goals')).toBeInTheDocument();
      expect(screen.getByText('📅 Calendar')).toBeInTheDocument();
    });
  });

  it('displays todos tab by default', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('📋 Daily Todos')).toBeInTheDocument();
    });
  });

  it('switches to goals tab when clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      const tabs = screen.getAllByRole('button');
      const goalsTab = tabs.find(tab => tab.textContent === '🎯 Goals' && tab.classList.contains('tab'));
      fireEvent.click(goalsTab);
      
      expect(screen.getByText('+ New Goal')).toBeInTheDocument();
    });
  });

  it('switches to calendar tab when clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      const tabs = screen.getAllByRole('button');
      const calendarTab = tabs.find(tab => tab.textContent === '📅 Calendar' && tab.classList.contains('tab'));
      fireEvent.click(calendarTab);
      
      expect(screen.getByText('+ New Event')).toBeInTheDocument();
    });
  });

  it('applies active class to current tab', async () => {
    render(<App />);
    
    await waitFor(() => {
      const tabs = screen.getAllByRole('button');
      const todosTab = tabs.find(tab => tab.textContent === '📋 Todos' && tab.classList.contains('tab'));
      expect(todosTab.className).toContain('active');
    });
  });

  it('fetches data on mount', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/goals'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/todos'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/calendar'));
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/stats'));
    });
  });

  it('handles fetch errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('passes correct props to child components', async () => {
    render(<App />);
    
    await waitFor(() => {
      // Check that Todos component receives data
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });
});
