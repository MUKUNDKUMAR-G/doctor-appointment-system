import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import LoginForm from '../LoginForm'
import { AuthContext } from '../../contexts/AuthContext'

// Mock the auth context
const mockLogin = vi.fn()
const mockAuthContext = {
  login: mockLogin,
  user: null,
  loading: false,
  error: null
}

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders login form with all required fields', () => {
    renderWithRouter(<LoginForm />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('displays validation errors for empty fields', async () => {
    renderWithRouter(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  test('displays validation error for invalid email format', async () => {
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  test('calls login function with correct credentials', async () => {
    renderWithRouter(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  test('shows loading state during login', () => {
    const loadingContext = { ...mockAuthContext, loading: true }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingContext}>
          <LoginForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /signing in/i })
    expect(submitButton).toBeDisabled()
  })

  test('displays error message when login fails', () => {
    const errorContext = { 
      ...mockAuthContext, 
      error: 'Invalid credentials' 
    }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={errorContext}>
          <LoginForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
  })

  test('has link to registration page', () => {
    renderWithRouter(<LoginForm />)
    
    const registerLink = screen.getByText(/don't have an account/i).closest('a')
    expect(registerLink).toHaveAttribute('href', '/register')
  })

  test('password field is of type password', () => {
    renderWithRouter(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('form submission is prevented when fields are invalid', async () => {
    renderWithRouter(<LoginForm />)
    
    const form = screen.getByRole('form') || screen.getByTestId('login-form')
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  test('clears form after successful login', async () => {
    const successContext = { 
      ...mockAuthContext, 
      user: { id: 1, email: 'test@example.com' }
    }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={successContext}>
          <LoginForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput.value).toBe('')
    expect(passwordInput.value).toBe('')
  })
})