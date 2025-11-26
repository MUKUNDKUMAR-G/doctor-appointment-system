import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import RegisterForm from '../RegisterForm'
import { AuthContext } from '../../contexts/AuthContext'

const mockRegister = vi.fn()
const mockAuthContext = {
  register: mockRegister,
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

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders registration form with all required fields', () => {
    renderWithRouter(<RegisterForm />)
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  test('displays validation errors for empty required fields', async () => {
    renderWithRouter(<RegisterForm />)
    
    const submitButton = screen.getByRole('button', { name: /create account/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  test('validates email format', async () => {
    renderWithRouter(<RegisterForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  test('validates password strength requirements', async () => {
    renderWithRouter(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  test('validates password confirmation match', async () => {
    renderWithRouter(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  test('validates phone number format', async () => {
    renderWithRouter(<RegisterForm />)
    
    const phoneInput = screen.getByLabelText(/phone number/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(phoneInput, { target: { value: '123' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })
  })

  test('calls register function with correct data', async () => {
    renderWithRouter(<RegisterForm />)
    
    const firstNameInput = screen.getByLabelText(/first name/i)
    const lastNameInput = screen.getByLabelText(/last name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const phoneInput = screen.getByLabelText(/phone number/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    fireEvent.change(firstNameInput, { target: { value: 'John' } })
    fireEvent.change(lastNameInput, { target: { value: 'Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } })
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123!' } })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
        password: 'ValidPass123!',
        role: 'PATIENT'
      })
    })
  })

  test('shows loading state during registration', () => {
    const loadingContext = { ...mockAuthContext, loading: true }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={loadingContext}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /creating account/i })
    expect(submitButton).toBeDisabled()
  })

  test('displays error message when registration fails', () => {
    const errorContext = { 
      ...mockAuthContext, 
      error: 'Email already exists' 
    }
    
    render(
      <BrowserRouter>
        <AuthContext.Provider value={errorContext}>
          <RegisterForm />
        </AuthContext.Provider>
      </BrowserRouter>
    )
    
    expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
  })

  test('has link to login page', () => {
    renderWithRouter(<RegisterForm />)
    
    const loginLink = screen.getByText(/already have an account/i).closest('a')
    expect(loginLink).toHaveAttribute('href', '/login')
  })

  test('password strength indicator shows requirements', () => {
    renderWithRouter(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.focus(passwordInput)
    
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument()
    expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/lowercase letter/i)).toBeInTheDocument()
    expect(screen.getByText(/number/i)).toBeInTheDocument()
    expect(screen.getByText(/special character/i)).toBeInTheDocument()
  })

  test('password strength indicator updates based on input', async () => {
    renderWithRouter(<RegisterForm />)
    
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    await waitFor(() => {
      expect(screen.getByText(/weak/i)).toBeInTheDocument()
    })
    
    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } })
    await waitFor(() => {
      expect(screen.getByText(/strong/i)).toBeInTheDocument()
    })
  })

  test('form fields are accessible', () => {
    renderWithRouter(<RegisterForm />)
    
    const inputs = screen.getAllByRole('textbox')
    const passwordInputs = screen.getAllByLabelText(/password/i)
    
    inputs.forEach(input => {
      expect(input).toHaveAttribute('id')
      expect(input).toHaveAttribute('name')
    })
    
    passwordInputs.forEach(input => {
      expect(input).toHaveAttribute('type', 'password')
    })
  })
})