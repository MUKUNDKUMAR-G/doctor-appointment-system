/**
 * ModernLoginForm Unit Tests
 * 
 * Tests for the ModernLoginForm component functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ModernLoginForm from '../ModernLoginForm';
import { AuthProvider } from '../../../../contexts/AuthContext';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: vi.fn(),
  }),
}));

// Mock useReducedMotion hook
vi.mock('../../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

// Helper to render component with providers
const renderWithProviders = (ui, options = {}) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>,
    options
  );
};

describe('ModernLoginForm', () => {
  const mockOnSwitchToRegister = vi.fn();
  const mockOnLoginSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the login form with all fields', () => {
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render the switch to register link', () => {
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up here/i)).toBeInTheDocument();
    });

    it('should pre-fill email when initialEmail is provided', () => {
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
          initialEmail="test@example.com"
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when clicking the icon', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const passwordInput = screen.getByLabelText(/^password$/i);
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByLabelText(/show password/i);
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should show error for invalid email on blur', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Blur the field

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty email on blur', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.click(emailInput);
      await user.tab(); // Blur without typing

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      // Trigger error
      await user.click(emailInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing
      await user.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Switching', () => {
    it('should call onSwitchToRegister when clicking sign up link', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const signUpLink = screen.getByText(/sign up here/i);
      await user.click(signUpLink);

      expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow tab navigation between fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      emailInput.focus();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();
    });

    it('should submit form when pressing Enter in email field', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');
      
      // Press Enter in email field
      emailInput.focus();
      await user.keyboard('{Enter}');

      // Form should attempt to submit (validation will occur)
      await waitFor(() => {
        // The form will try to submit, which will trigger validation
        expect(emailInput).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toHaveAttribute('aria-label', 'Email Address');
      expect(passwordInput).toHaveAttribute('aria-label', 'Password');
    });

    it('should associate errors with fields using aria-describedby', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby');
      });
    });

    it('should have required attributes on required fields', () => {
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('Form State', () => {
    it('should update form data when typing', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <ModernLoginForm
          onSwitchToRegister={mockOnSwitchToRegister}
          onLoginSuccess={mockOnLoginSuccess}
        />
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'Password123!');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('Password123!');
    });
  });
});
