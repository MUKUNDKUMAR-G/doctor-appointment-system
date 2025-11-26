import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import * as authService from '../../services/authService'

vi.mock('../../services/authService')

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    sessionStorage.clear()
  })

  test('complete user registration and login flow', async () => {
    // Mock successful registration
    authService.register.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'PATIENT'
      }
    })

    // Mock successful login
    authService.login.mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'PATIENT'
      }
    })

    renderApp()

    // Navigate to registration
    const registerLink = screen.getByText(/sign up/i)
    fireEvent.click(registerLink)

    await waitFor(() => {
      expect(screen.getByText(/create account/i)).toBeInTheDocument()
    })

    // Fill registration form
    fireEvent.change(screen.getByLabelText(/first name/i), { 
      target: { value: 'John' } 
    })
    fireEvent.change(screen.getByLabelText(/last name/i), { 
      target: { value: 'Doe' } 
    })
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/phone number/i), { 
      target: { value: '+1234567890' } 
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), { 
      target: { value: 'TestPass123!' } 
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), { 
      target: { value: 'TestPass123!' } 
    })

    // Submit registration
    const createAccountButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(createAccountButton)

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        phoneNumber: '+1234567890',
        password: 'TestPass123!',
        role: 'PATIENT'
      })
    })

    // Should redirect to dashboard after successful registration
    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
    })

    // Logout
    const logoutButton = screen.getByText(/logout/i)
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
    })

    // Login with same credentials
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'TestPass123!' } 
    })

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'TestPass123!'
      })
    })

    // Should be back on dashboard
    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })
  })

  test('handles authentication errors gracefully', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'))

    renderApp()

    // Try to login with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'wrong@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    })

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Should still be on login page
    expect(screen.getByText(/sign in/i)).toBeInTheDocument()
  })

  test('persists authentication state across page refreshes', async () => {
    // Mock token validation
    authService.validateToken.mockResolvedValue({
      user: {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'PATIENT'
      }
    })

    // Set token in localStorage
    localStorage.setItem('accessToken', 'mock-access-token')

    renderApp()

    // Should automatically authenticate and show dashboard
    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })
  })

  test('redirects to login when accessing protected routes without authentication', async () => {
    renderApp()

    // Try to navigate to protected route
    window.history.pushState({}, '', '/appointments')

    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
      expect(screen.getByText(/please sign in to continue/i)).toBeInTheDocument()
    })
  })

  test('handles token expiration gracefully', async () => {
    // Mock expired token
    authService.validateToken.mockRejectedValue(new Error('Token expired'))
    authService.refreshToken.mockRejectedValue(new Error('Refresh token expired'))

    localStorage.setItem('accessToken', 'expired-token')
    localStorage.setItem('refreshToken', 'expired-refresh-token')

    renderApp()

    // Should redirect to login when tokens are expired
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument()
      expect(screen.getByText(/session expired/i)).toBeInTheDocument()
    })

    // Tokens should be cleared from storage
    expect(localStorage.getItem('accessToken')).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
  })

  test('automatically refreshes tokens when needed', async () => {
    // Mock token refresh
    authService.refreshToken.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token'
    })

    authService.validateToken.mockRejectedValueOnce(new Error('Token expired'))
      .mockResolvedValue({
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'PATIENT'
        }
      })

    localStorage.setItem('accessToken', 'expired-token')
    localStorage.setItem('refreshToken', 'valid-refresh-token')

    renderApp()

    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token')
    })

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // New tokens should be stored
    expect(localStorage.getItem('accessToken')).toBe('new-access-token')
    expect(localStorage.getItem('refreshToken')).toBe('new-refresh-token')
  })

  test('shows loading state during authentication', async () => {
    authService.login.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )

    renderApp()

    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    })

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    expect(signInButton).toBeDisabled()
  })

  test('validates form fields before submission', async () => {
    renderApp()

    // Try to submit empty login form
    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })

    // Should not call login service
    expect(authService.login).not.toHaveBeenCalled()
  })

  test('clears error messages when switching between forms', async () => {
    authService.login.mockRejectedValue(new Error('Invalid credentials'))

    renderApp()

    // Trigger login error
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'wrong@example.com' } 
    })
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'wrongpassword' } 
    })

    const signInButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(signInButton)

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })

    // Navigate to registration
    const registerLink = screen.getByText(/sign up/i)
    fireEvent.click(registerLink)

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument()
    })
  })
})