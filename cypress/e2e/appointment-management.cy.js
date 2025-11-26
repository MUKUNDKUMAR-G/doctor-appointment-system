describe('Appointment Management', () => {
  beforeEach(() => {
    cy.cleanupDatabase()
    cy.seedTestData()
    
    // Create and login as patient
    cy.apiRegister({ 
      email: 'patient@test.com', 
      password: 'TestPass123!',
      firstName: 'John',
      lastName: 'Doe'
    })
    cy.login('patient@test.com', 'TestPass123!')
  })

  describe('Appointment List', () => {
    beforeEach(() => {
      // Book a test appointment
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should display patient appointments', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointments-list"]').should('be.visible')
      cy.get('[data-testid="appointment-card"]').should('have.length.at.least', 1)
      
      // Check appointment details are displayed
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="doctor-name"]').should('be.visible')
        cy.get('[data-testid="appointment-date"]').should('be.visible')
        cy.get('[data-testid="appointment-time"]').should('be.visible')
        cy.get('[data-testid="appointment-status"]').should('be.visible')
        cy.get('[data-testid="appointment-notes"]').should('contain', 'Regular checkup')
      })
    })

    it('should filter appointments by status', () => {
      cy.visit('/appointments')
      
      // Filter by scheduled appointments
      cy.get('[data-testid="status-filter"]').select('SCHEDULED')
      
      cy.get('[data-testid="appointment-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="appointment-status"]').should('contain', 'Scheduled')
      })
    })

    it('should filter appointments by date range', () => {
      cy.visit('/appointments')
      
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      cy.get('[data-testid="start-date-filter"]').type(today)
      cy.get('[data-testid="end-date-filter"]').type(nextWeek)
      cy.get('[data-testid="apply-filter-button"]').click()
      
      // Should show only appointments in the date range
      cy.get('[data-testid="appointment-card"]').should('be.visible')
    })

    it('should sort appointments by date', () => {
      // Book multiple appointments
      cy.bookAppointment(1, '10:00', 'Second appointment')
      
      cy.visit('/appointments')
      
      // Sort by date descending
      cy.get('[data-testid="sort-select"]').select('date-desc')
      
      // Most recent appointment should be first
      cy.get('[data-testid="appointment-card"]').first()
        .find('[data-testid="appointment-notes"]')
        .should('contain', 'Second appointment')
    })

    it('should show empty state when no appointments', () => {
      // Cancel the existing appointment
      cy.visit('/appointments')
      cy.cancelAppointment(1, 'Test cancellation')
      
      // Filter to show only scheduled appointments
      cy.get('[data-testid="status-filter"]').select('SCHEDULED')
      
      cy.get('[data-testid="empty-state"]').should('be.visible')
      cy.get('[data-testid="empty-state"]').should('contain', 'No appointments found')
      cy.get('[data-testid="book-first-appointment-button"]').should('be.visible')
    })
  })

  describe('Appointment Details', () => {
    beforeEach(() => {
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should display detailed appointment information', () => {
      cy.visit('/appointments')
      cy.get('[data-testid="appointment-card"]').first().click()
      
      cy.get('[data-testid="appointment-details"]').should('be.visible')
      cy.get('[data-testid="appointment-details"]').within(() => {
        cy.get('[data-testid="doctor-info"]').should('be.visible')
        cy.get('[data-testid="appointment-datetime"]').should('be.visible')
        cy.get('[data-testid="appointment-status"]').should('be.visible')
        cy.get('[data-testid="appointment-notes"]').should('be.visible')
        cy.get('[data-testid="booking-date"]').should('be.visible')
      })
    })

    it('should show action buttons for future appointments', () => {
      cy.visit('/appointments')
      cy.get('[data-testid="appointment-card"]').first().click()
      
      cy.get('[data-testid="reschedule-button"]').should('be.visible')
      cy.get('[data-testid="cancel-button"]').should('be.visible')
    })

    it('should not show action buttons for past appointments', () => {
      // This would require creating a past appointment in the test data
      // For now, we'll test the UI logic
      cy.visit('/appointments')
      
      // Assuming we have past appointments in seed data
      cy.get('[data-testid="appointment-card"][data-status="COMPLETED"]').first().click()
      
      cy.get('[data-testid="reschedule-button"]').should('not.exist')
      cy.get('[data-testid="cancel-button"]').should('not.exist')
    })
  })

  describe('Appointment Cancellation', () => {
    beforeEach(() => {
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should cancel appointment successfully', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').click()
      })
      
      // Fill cancellation form
      cy.get('[data-testid="cancellation-modal"]').should('be.visible')
      cy.get('[data-testid="cancellation-reason"]').type('Personal emergency')
      cy.get('[data-testid="confirm-cancellation-button"]').click()
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Appointment cancelled successfully')
      
      // Appointment status should be updated
      cy.get('[data-testid="appointment-card"]').first()
        .find('[data-testid="appointment-status"]')
        .should('contain', 'Cancelled')
    })

    it('should require cancellation reason', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').click()
      })
      
      // Try to cancel without reason
      cy.get('[data-testid="confirm-cancellation-button"]').click()
      
      cy.get('[data-testid="reason-error"]').should('contain', 'Cancellation reason is required')
    })

    it('should prevent cancellation within 24 hours', () => {
      // This would require creating an appointment within 24 hours
      // The backend should handle this validation
      cy.visit('/appointments')
      
      // Assuming we have a near-future appointment
      cy.get('[data-testid="appointment-card"][data-cancellable="false"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').should('be.disabled')
      })
    })

    it('should handle cancellation errors', () => {
      // Intercept and fail the cancellation request
      cy.intercept('DELETE', '**/appointments/*', { statusCode: 500 }).as('cancellationError')
      
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').click()
      })
      
      cy.get('[data-testid="cancellation-reason"]').type('Personal emergency')
      cy.get('[data-testid="confirm-cancellation-button"]').click()
      
      cy.wait('@cancellationError')
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to cancel appointment')
    })
  })

  describe('Appointment Rescheduling', () => {
    beforeEach(() => {
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should reschedule appointment successfully', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="reschedule-button"]').click()
      })
      
      // Select new date and time
      cy.get('[data-testid="reschedule-modal"]').should('be.visible')
      cy.get('[data-testid="new-date-picker"]').click()
      cy.get('[data-testid="calendar-day"]').contains('26').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      
      // Add reschedule reason
      cy.get('[data-testid="reschedule-reason"]').type('Schedule conflict')
      cy.get('[data-testid="confirm-reschedule-button"]').click()
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Appointment rescheduled successfully')
      
      // Appointment date should be updated
      cy.get('[data-testid="appointment-card"]').first()
        .find('[data-testid="appointment-date"]')
        .should('contain', '26')
    })

    it('should validate new appointment time', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="reschedule-button"]').click()
      })
      
      // Try to reschedule without selecting new time
      cy.get('[data-testid="confirm-reschedule-button"]').click()
      
      cy.get('[data-testid="time-error"]').should('contain', 'Please select a new time')
    })

    it('should prevent rescheduling to unavailable slots', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="reschedule-button"]').click()
      })
      
      // Try to select unavailable slot
      cy.get('[data-testid="new-date-picker"]').click()
      cy.get('[data-testid="calendar-day"]').contains('26').click()
      
      // Unavailable slots should be disabled
      cy.get('[data-testid="time-slot"][disabled]').should('exist')
      cy.get('[data-testid="time-slot"][disabled]').should('not.be.clickable')
    })
  })

  describe('Appointment History', () => {
    it('should display appointment history', () => {
      cy.visit('/appointments/history')
      
      cy.get('[data-testid="appointment-history"]').should('be.visible')
      cy.get('[data-testid="history-filters"]').should('be.visible')
    })

    it('should filter history by date range', () => {
      cy.visit('/appointments/history')
      
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      const lastMonthStr = lastMonth.toISOString().split('T')[0]
      
      const today = new Date().toISOString().split('T')[0]
      
      cy.get('[data-testid="history-start-date"]').type(lastMonthStr)
      cy.get('[data-testid="history-end-date"]').type(today)
      cy.get('[data-testid="apply-history-filter"]').click()
      
      // Should show appointments in the specified range
      cy.get('[data-testid="history-item"]').should('be.visible')
    })

    it('should export appointment history', () => {
      cy.visit('/appointments/history')
      
      cy.get('[data-testid="export-history-button"]').click()
      
      // Should trigger download
      cy.get('[data-testid="export-success-message"]').should('be.visible')
    })
  })

  describe('Appointment Notifications', () => {
    beforeEach(() => {
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should display appointment reminders', () => {
      cy.visit('/appointments')
      
      // Should show reminder for upcoming appointments
      cy.get('[data-testid="appointment-reminder"]').should('be.visible')
      cy.get('[data-testid="reminder-message"]').should('contain', 'upcoming appointment')
    })

    it('should allow dismissing reminders', () => {
      cy.visit('/appointments')
      
      cy.get('[data-testid="dismiss-reminder-button"]').click()
      
      cy.get('[data-testid="appointment-reminder"]').should('not.exist')
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should be accessible on appointments list page', () => {
      cy.visit('/appointments')
      cy.checkAccessibility()
    })

    it('should be accessible in appointment details modal', () => {
      cy.visit('/appointments')
      cy.get('[data-testid="appointment-card"]').first().click()
      cy.checkAccessibility()
    })

    it('should be accessible in cancellation modal', () => {
      cy.visit('/appointments')
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').click()
      })
      cy.checkAccessibility()
    })

    it('should support keyboard navigation', () => {
      cy.visit('/appointments')
      
      // Should be able to navigate appointments with keyboard
      cy.get('[data-testid="appointment-card"]').first().focus()
      cy.get('[data-testid="appointment-card"]').first().type('{enter}')
      
      // Should open appointment details
      cy.get('[data-testid="appointment-details"]').should('be.visible')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
      cy.bookAppointment(1, '09:00', 'Regular checkup')
    })

    it('should display properly on mobile devices', () => {
      cy.visit('/appointments')
      
      // Appointment cards should stack vertically
      cy.get('[data-testid="appointments-list"]').should('have.css', 'flex-direction', 'column')
      
      // Action buttons should be accessible
      cy.get('[data-testid="cancel-button"]').should('be.visible')
      cy.get('[data-testid="reschedule-button"]').should('be.visible')
    })

    it('should maintain functionality on mobile', () => {
      cy.visit('/appointments')
      
      // Should be able to cancel appointment on mobile
      cy.get('[data-testid="appointment-card"]').first().within(() => {
        cy.get('[data-testid="cancel-button"]').click()
      })
      
      cy.get('[data-testid="cancellation-reason"]').type('Mobile test cancellation')
      cy.get('[data-testid="confirm-cancellation-button"]').click()
      
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })
})