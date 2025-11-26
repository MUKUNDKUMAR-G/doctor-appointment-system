import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import AppointmentBooking from '../AppointmentBooking'
import { AuthContext } from '../../contexts/AuthContext'
import * as appointmentService from '../../services/appointmentService'
import * as doctorService from '../../services/doctorService'

// Mock the services
vi.mock('../../services/appointmentService')
vi.mock('../../services/doctorService')

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

const mockDoctors = [
  {
    id: 1,
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    experienceYears: 10
  },
  {
    id: 2,
    firstName: 'Dr. John',
    lastName: 'Wilson',
    specialty: 'Dermatology',
    qualifications: 'MD, FAAD',
    experienceYears: 8
  }
]

const mockAvailability = [
  {
    date: '2024-10-25',
    timeSlots: [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: false },
      { time: '14:00', available: true }
    ]
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

describe('AppointmentBooking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    doctorService.getAllDoctors.mockResolvedValue(mockDoctors)
    doctorService.getDoctorAvailability.mockResolvedValue(mockAvailability)
    appointmentService.bookAppointment.mockResolvedValue({
      id: 1,
      patientId: 1,
      doctorId: 1,
      appointmentDateTime: '2024-10-25T09:00:00',
      status: 'SCHEDULED'
    })
  })

  test('renders appointment booking form', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    await waitFor(() => {
      expect(screen.getByText(/book appointment/i)).toBeInTheDocument()
      expect(screen.getByText(/select doctor/i)).toBeInTheDocument()
      expect(screen.getByText(/select date/i)).toBeInTheDocument()
    })
  })

  test('loads and displays available doctors', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.getByText(/cardiology/i)).toBeInTheDocument()
      expect(screen.getByText(/dr\. john wilson/i)).toBeInTheDocument()
      expect(screen.getByText(/dermatology/i)).toBeInTheDocument()
    })
  })

  test('filters doctors by specialty', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    await waitFor(() => {
      const specialtyFilter = screen.getByLabelText(/specialty/i)
      fireEvent.change(specialtyFilter, { target: { value: 'Cardiology' } })
    })
    
    await waitFor(() => {
      expect(screen.getByText(/dr\. jane smith/i)).toBeInTheDocument()
      expect(screen.queryByText(/dr\. john wilson/i)).not.toBeInTheDocument()
    })
  })

  test('shows availability calendar when doctor is selected', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/available time slots/i)).toBeInTheDocument()
      expect(doctorService.getDoctorAvailability).toHaveBeenCalledWith(1, expect.any(String))
    })
  })

  test('displays available time slots', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    // Check time slots
    await waitFor(() => {
      expect(screen.getByText(/09:00/)).toBeInTheDocument()
      expect(screen.getByText(/10:00/)).toBeInTheDocument()
      expect(screen.getByText(/14:00/)).toBeInTheDocument()
    })
  })

  test('disables unavailable time slots', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    // Check that 11:00 slot is disabled
    await waitFor(() => {
      const unavailableSlot = screen.getByText(/11:00/).closest('button')
      expect(unavailableSlot).toBeDisabled()
    })
  })

  test('allows selecting available time slot', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    // Select time slot
    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })
    
    expect(screen.getByText(/selected: 09:00/i)).toBeInTheDocument()
  })

  test('shows appointment details form after selecting time', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select doctor and time
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })
    
    await waitFor(() => {
      expect(screen.getByLabelText(/appointment notes/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /book appointment/i })).toBeInTheDocument()
    })
  })

  test('successfully books appointment', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select doctor and time
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    await waitFor(() => {
      const timeSlot = screen.getByText(/09:00/).closest('button')
      fireEvent.click(timeSlot)
    })
    
    // Fill notes and book
    await waitFor(() => {
      const notesInput = screen.getByLabelText(/appointment notes/i)
      fireEvent.change(notesInput, { target: { value: 'Regular checkup' } })
      
      const bookButton = screen.getByRole('button', { name: /book appointment/i })
      fireEvent.click(bookButton)
    })
    
    await waitFor(() => {
      expect(appointmentService.bookAppointment).toHaveBeenCalledWith({
        patientId: 1,
        doctorId: 1,
        appointmentDateTime: expect.any(String),
        notes: 'Regular checkup'
      })
    })
  })

  test('shows success message after booking', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Complete booking flow
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
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
    
    await waitFor(() => {
      expect(screen.getByText(/appointment booked successfully/i)).toBeInTheDocument()
    })
  })

  test('handles booking errors gracefully', async () => {
    appointmentService.bookAppointment.mockRejectedValue(new Error('Booking failed'))
    
    renderWithRouter(<AppointmentBooking />)
    
    // Complete booking flow
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
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
    
    await waitFor(() => {
      expect(screen.getByText(/booking failed/i)).toBeInTheDocument()
    })
  })

  test('shows loading state during booking', async () => {
    // Make booking take time
    appointmentService.bookAppointment.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    )
    
    renderWithRouter(<AppointmentBooking />)
    
    // Complete booking flow
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
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
    
    expect(screen.getByText(/booking.../i)).toBeInTheDocument()
  })

  test('validates required fields before booking', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Try to book without selecting doctor or time
    const bookButton = screen.queryByRole('button', { name: /book appointment/i })
    
    // Button should not be available until doctor and time are selected
    expect(bookButton).not.toBeInTheDocument()
  })

  test('allows changing selected doctor', async () => {
    renderWithRouter(<AppointmentBooking />)
    
    // Select first doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. jane smith/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    // Select different doctor
    await waitFor(() => {
      const doctorCard = screen.getByText(/dr\. john wilson/i).closest('div')
      fireEvent.click(doctorCard)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/selected: dr\. john wilson/i)).toBeInTheDocument()
    })
  })
})