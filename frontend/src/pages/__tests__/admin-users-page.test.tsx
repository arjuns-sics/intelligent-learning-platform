import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils';
import { AdminUsersPage } from '@/pages/admin-users-page';

// Mock the admin service
vi.mock('@/services/admin.service', () => ({
  getAllUsers: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      users: [
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Student' as const,
          profile_image: null,
          preferredMedia: null,
          masteryScore: 0,
          weaknessTags: [],
          createdAt: new Date().toISOString(),
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Instructor' as const,
          profile_image: null,
          preferredMedia: null,
          masteryScore: 0,
          weaknessTags: [],
          createdAt: new Date().toISOString(),
        },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    },
  })),
  deleteUser: vi.fn(() => Promise.resolve({ success: true })),
  updateUserRole: vi.fn(() => Promise.resolve({ success: true })),
}));

describe('AdminUsersPage', () => {
  it('renders without crashing', async () => {
    render(<AdminUsersPage />);
    
    // Wait for the page to load
    expect(await screen.findByText(/User Management/i)).toBeInTheDocument();
  });

  it('displays page header', async () => {
    render(<AdminUsersPage />);
    
    expect(await screen.findByText('User Management')).toBeInTheDocument();
    expect(await screen.findByText(/Manage user accounts, roles, and permissions/i)).toBeInTheDocument();
  });

  it('displays filters section', async () => {
    render(<AdminUsersPage />);
    
    expect(await screen.findByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/Search/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
  });

  it('displays users table header', async () => {
    render(<AdminUsersPage />);
    
    expect(await screen.findByText('Users')).toBeInTheDocument();
  });

  it('displays user data', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('displays role badges', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Instructor')).toBeInTheDocument();
    });
  });

  it('displays action buttons', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      const editRoleButtons = screen.getAllByText('Edit Role');
      expect(editRoleButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays pagination info', async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 to/i)).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument();
    });
  });
});
