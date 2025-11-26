import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import App from '../../App'
import * as authService from '../../services/authService'
import * as doctorService from '../../services/doctorService'
import * as appointmentService from '../../services/appointmentService'

vi.mock('../../services/authService')
vi.mock('../../services/doctorService')
vi.mock('../../services/appointmentService')

const mockUser = {
  id: 1,
  email: 'patient@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'PATIENT'
}

const mockDoctors = [
  {
    id: 1,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    experienceYears: 10,
    bio: 'Experienced cardiologist'
  }
]

const mockAvailability = [
  {
    date: '2024-10-25',
    timeSlots: [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false }
    ]
  }
]

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

describe('Appointment Booking Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    
    // Mock authenticated user
    authService.validateToken.mockResolvedValue({ user: mockUser })
    localStorage.setItem('accessToken', 'mock-token')
    
    // Mock services
    doctorService.getAllDoctors.mockResolvedValue(mockDoctors)
    doctorService.getDoctorAvailability.mockResolvedValue(mockAvailability)
    appointmentService.bookAppointment.mockResolvedValue({
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentDateTime: '2024-10-25T09:00:00',
      status: 'SCHEDULED',
      notes: 'Regular checkup'
    })
  })

  test('complete appointment booking flow', async () => {
    renderApp()

    // Wait for authentication and dashboard load
    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // Navigate to book appointment
    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      expect(screen.getByText(/select doctor/i)).toBeInTheDocument()
    })

    // Wait for doctors to load
    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument()
    })

    // Select doctor
    const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
    fireEvent.click(doctorCard)

    await waitFor(() => {
      expect(screen.getByText(/available time slots/i)).toBeInTheDocument()
    })

    // Wait for availability to load
    await waitFor(() => {
      expect(screen.getByText(/09:00/)).toBeInTheDocument()
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
    })

    // Select time slot
    const timeSlot = screen.getByText(/09:00/).closest('button')
    fireEvent.click(timeSlot)

    await waitFor(() => {
      expect(screen.getByText(/appointment details/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument()
    })

    // Fill appointment notes
    const notesInput = screen.getByLabelText(/notes/i)
    fireEvent.change(notesInput, { target: { value: 'Regular checkup' } })

    // Book appointment
    const bookButton = screen.getByRole('button', { name: /book appointment/i })
    fireEvent.click(bookButton)

    await waitFor(() => {
      expect(appointmentService.bookAppointment).toHaveBeenCalledWith({
        patientId: 1,
        doctorId: 1,
        appointmentDateTime: expect.stringContaining('2024-10-25T09:00'),
        notes: 'Regular checkup'
      })
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument()
    })

    // Should redirect to appointments list
    await waitFor(() => {
      expect(screen.getByText(/your appointments/i)).toBeInTheDocument()
    })
  })

  test('handles doctor selection and availability checking', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // Navigate to book appointment
    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
    })

    // Select doctor
    const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
    fireEvent.click(doctorCard)

    // Should call availability service
    await waitFor(() => {
      expect(doctorService.getDoctorAvailability).toHaveBeenCalledWith(
        1, 
        expect.any(String)
      )
    })

    // Should show availability
    await waitFor(() => {
      expect(screen.getByText(/available time slots/i)).toBeInTheDocument()
      expect(screen.getByText(/09:00/)).toBeInTheDocument()
    })

    // Unavailable slots should be disabled
    const unavailableSlot = screen.getByText(/11:00/).closest('button')
    expect(unavailableSlot).toBeDisabled()
  })

  test('handles booking conflicts gracefully', async () => {
    appointmentService.bookAppointment.mockRejectedValue(
      new Error('Time slot no longer available')
    )

    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // Complete booking flow
    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
      fireEvent.click(doctorCard)
    })

    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })

    await waitFor(() => {
      const bookButton = screen.getByRole('button', { name: /book appointment/i })
      fireEvent.click(bookButton)
    })

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/time slot no longer available/i)).toBeInTheDocument()
    })

    // Should refresh availability
    expect(doctorService.getDoctorAvailability).toHaveBeenCalledTimes(2)
  })

  test('validates appointment booking form', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // Navigate to booking without selecting doctor or time
    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      expect(screen.getByText(/select doctor/i)).toBeInTheDocument()
    })

    // Try to proceed without selecting doctor
    const nextButton = screen.queryByRole('button', { name: /next/i })
    expect(nextButton).toBeDisabled()

    // Select doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
      fireEvent.click(doctorCard)
    })

    // Try to proceed without selecting time
    await waitFor(() => {
      const proceedButton = screen.queryByRole('button', { name: /proceed/i })
      expect(proceedButton).toBeDisabled()
    })
  })

  test('allows changing doctor selection', async () => {
    // Add another doctor to the mock
    const multipleDoctors = [
      ...mockDoctors,
      {
        id: 2,
        firstName: 'Dr. John',
        lastName: 'Wilson',
        specialty: 'Dermatology',
        qualifications: 'MD, FAAD',
        experienceYears: 8
      }
    ]
    doctorService.getAllDoctors.mockResolvedValue(multipleDoctors)

    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. john wilson/i)).toBeInTheDocument()
    })

    // Select first doctor
    const firstDoctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
    fireEvent.click(firstDoctorCard)

    await waitFor(() => {
      expect(screen.getByText(/selected: dr\. jane smith/i)).toBeInTheDocument()
    })

    // Change to second doctor
    const secondDoctorCard = screen.getByText(/dr\. john wilson/i).closest('[data-testid="doctor-card"]')
    fireEvent.click(secondDoctorCard)

    await waitFor(() => {
      expect(screen.getByText(/selected: dr\. john wilson/i)).toBeInTheDocument()
    })

    // Should call availability for new doctor
    expect(doctorService.getDoctorAvailability).toHaveBeenCalledWith(2, expect.any(String))
  })

  test('shows loading states during booking process', async () => {
    // Make services take time to respond
    doctorService.getAllDoctors.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockDoctors), 100))
    )
    
    appointmentService.bookAppointment.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        patientId: 1,
        doctorId: 1,
        appointmentDateTime: '2024-10-25T09:00:00',
        status: 'SCHEDULED'
      }), 100))
    )

    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    // Should show loading for doctors
    expect(screen.getByText(/loading doctors/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
    })

    // Complete selection and booking
    const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
    fireEvent.click(doctorCard)

    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })

    await waitFor(() => {
      const bookButton = screen.getByRole('button', { name: /book appointment/i })
      fireEvent.click(bookButton)
    })

    // Should show booking loading state
    expect(screen.getByText(/booking/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /booking/i })).toBeDisabled()
  })

  test('handles network errors during booking', async () => {
    doctorService.getAllDoctors.mockRejectedValue(new Error('Network error'))

    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to load doctors/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })

    // Retry should work
    const retryButton = screen.getByRole('button', { name: /retry/i })
    doctorService.getAllDoctors.mockResolvedValue(mockDoctors)
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
    })
  })

  test('preserves form data when navigating back', async () => {
    renderApp()

    await waitFor(() => {
      expect(screen.getByText(/welcome, john/i)).toBeInTheDocument()
    })

    // Start booking process
    const bookAppointmentButton = screen.getByText(/book appointment/i)
    fireEvent.click(bookAppointmentButton)

    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('[data-testid="doctor-card"]')
      fireEvent.click(doctorCard)
    })

    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })

    // Fill notes
    await waitFor(() => {
      const notesInput = screen.getByLabelText(/notes/i)
      fireEvent.change(notesInput, { target: { value: 'Important notes' } })
    })

    // Navigate back
    const backButton = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backButton)

    // Navigate forward again
    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })

    // Notes should be preserved
    await waitFor(() => {
      const notesInput = screen.getByLabelText(/notes/i)
      expect(notesInput.value).toBe('Important notes')
    })
  })
})