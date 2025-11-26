import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AppointmentList from '../AppointmentList'
import { AuthContext } from '../../contexts/AuthContext'
import * as appointmentService from '../../services/appointmentService'

vi.mock('../../services/appointmentService')

const mockUser = {
  id: 1,
  email: 'patient@test.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'PATIENT'
}

const mockAuthContext = {
  user: mockUser,
  loading: false,
  error: null
}

const mockAppointments = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    doctorName: 'Dr. Jane Smith',
    specialty: 'Cardiology',
    appointmentDateTime: '2024-10-25T09:00:00',
    status: 'SCHEDULED',
    notes: 'Regular checkup'
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 2,
    doctorName: 'Dr. John Wilson',
    specialty: 'Dermatology',
    appointmentDateTime: '2024-10-26T14:00:00',
    status: 'SCHEDULED',
    notes: 'Skin consultation'
  },
  {
    id: 3,
    patientId: 1,
    doctorId: 1,
    doctorName: 'Dr. Jane Smith',
    specialty: 'Cardiology',
    appointmentDateTime: '2024-10-20T10:00:00',
    status: 'COMPLETED',
    notes: 'Follow-up visit'
  }
]

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('AppointmentList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    appointmentService.getPatientAppointments.mockResolvedValue(mockAppointments)
    appointmentService.cancelAppointment.mockResolvedValue({ success: true })
  })

  test('renders appointment list with loading state', () => {
    appointmentService.getPatientAppointments.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    )
    
    renderWithRouter(<AppointmentList />)
    
    expect(screen.getByText(/loading appointments/i)).toBeInTheDocument()
  })

  test('loads and displays patient appointments', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. john wilson/i)).toBeInTheDocument()
      expect(screen.getByText(/dermatology/i)).toBeInTheDocument()
    })
    
    expect(appointmentService.getPatientAppointments).toHaveBeenCalledWith(1)
  })

  test('displays appointment details correctly', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      // Check first appointment details
      expect(screen.getByText(/october 25, 2024/i)).toBeInTheDocument()
      expect(screen.getByText(/9:00 am/i)).toBeInTheDocument()
      expect(screen.getByText(/regular checkup/i)).toBeInTheDocument()
      expect(screen.getByText(/scheduled/i)).toBeInTheDocument()
    })
  })

  test('filters appointments by status', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const statusFilter = screen.getByLabelText(/filter by status/i)
      fireEvent.change(statusFilter, { target: { value: 'SCHEDULED' } })
    })
    
    await waitFor(() => {
      const scheduledAppointments = screen.getAllByText(/scheduled/i)
      expect(scheduledAppointments).toHaveLength(2)
      expect(screen.queryByText(/completed/i)).not.toBeInTheDocument()
    })
  })

  test('filters appointments by date range', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const startDateInput = screen.getByLabelText(/start date/i)
      const endDateInput = screen.getByLabelText(/end date/i)
      
      fireEvent.change(startDateInput, { target: { value: '2024-10-25' } })
      fireEvent.change(endDateInput, { target: { value: '2024-10-26' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. john wilson/i)).toBeInTheDocument()
      // Past appointment should be filtered out
      expect(screen.queryByText(/follow-up visit/i)).not.toBeInTheDocument()
    })
  })

  test('shows cancel button for future appointments', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel/i)
      expect(cancelButtons).toHaveLength(2) // Only for scheduled future appointments
    })
  })

  test('does not show cancel button for past appointments', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      // Find the completed appointment card
      const completedCard = screen.getByText(/follow-up visit/i).closest('[data-testid="appointment-card"]')
      expect(completedCard).not.toHaveTextContent(/cancel/i)
    })
  })

  test('opens cancel confirmation dialog', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel/i)
      fireEvent.click(cancelButtons[0])
    })
    
    await waitFor(() => {
      expect(screen.getByText(/cancel appointment/i)).toBeInTheDocument()
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cancellation reason/i)).toBeInTheDocument()
    })
  })

  test('successfully cancels appointment', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel/i)
      fireEvent.click(cancelButtons[0])
    })
    
    await waitFor(() => {
      const reasonInput = screen.getByLabelText(/cancellation reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Personal emergency' } })
      
      const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i })
      fireEvent.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(appointmentService.cancelAppointment).toHaveBeenCalledWith(1, {
        reason: 'Personal emergency'
      })
    })
  })

  test('shows success message after cancellation', async () => {
    renderWithRouter(<AppointmentList />)
    
    // Cancel appointment
    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel/i)
      fireEvent.click(cancelButtons[0])
    })
    
    await waitFor(() => {
      const reasonInput = screen.getByLabelText(/cancellation reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Personal emergency' } })
      
      const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i })
      fireEvent.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/appointment cancelled successfully/i)).toBeInTheDocument()
    })
  })

  test('handles cancellation errors', async () => {
    appointmentService.cancelAppointment.mockRejectedValue(new Error('Cancellation failed'))
    
    renderWithRouter(<AppointmentList />)
    
    // Cancel appointment
    await waitFor(() => {
      const cancelButtons = screen.getAllByText(/cancel/i)
      fireEvent.click(cancelButtons[0])
    })
    
    await waitFor(() => {
      const reasonInput = screen.getByLabelText(/cancellation reason/i)
      fireEvent.change(reasonInput, { target: { value: 'Personal emergency' } })
      
      const confirmButton = screen.getByRole('button', { name: /confirm cancellation/i })
      fireEvent.click(confirmButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/cancellation failed/i)).toBeInTheDocument()
    })
  })

  test('shows empty state when no appointments', async () => {
    appointmentService.getPatientAppointments.mockResolvedValue([])
    
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      expect(screen.getByText(/no appointments found/i)).toBeInTheDocument()
      expect(screen.getByText(/book your first appointment/i)).toBeInTheDocument()
    })
  })

  test('allows sorting appointments by date', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const sortSelect = screen.getByLabelText(/sort by/i)
      fireEvent.change(sortSelect, { target: { value: 'date-desc' } })
    })
    
    await waitFor(() => {
      const appointmentCards = screen.getAllByTestId('appointment-card')
      // Most recent appointment should be first
      expect(appointmentCards[0]).toHaveTextContent(/october 26, 2024/i)
    })
  })

  test('shows reschedule option for future appointments', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const rescheduleButtons = screen.getAllByText(/reschedule/i)
      expect(rescheduleButtons).toHaveLength(2) // Only for future appointments
    })
  })

  test('navigates to appointment details', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const viewDetailsButtons = screen.getAllByText(/view details/i)
      fireEvent.click(viewDetailsButtons[0])
    })
    
    // Should navigate to appointment details page
    expect(window.location.pathname).toBe('/appointments/1')
  })

  test('refreshes appointments list', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
    })
    
    expect(appointmentService.getPatientAppointments).toHaveBeenCalledTimes(2)
  })

  test('displays appointment status badges correctly', async () => {
    renderWithRouter(<AppointmentList />)
    
    await waitFor(() => {
      const scheduledBadges = screen.getAllByText(/scheduled/i)
      const completedBadge = screen.getByText(/completed/i)
      
      expect(scheduledBadges).toHaveLength(2)
      expect(completedBadge).toBeInTheDocument()
    })
  })
})