describe('Appointment Booking Flow', () => {
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

  describe('Doctor Selection', () => {
    it('should display available doctors', () => {
      cy.visit('/appointments/book')
      
      cy.get('[data-testid="doctors-list"]').should('be.visible')
      cy.get('[data-testid="doctor-card"]').should('have.length.at.least', 1)
      
      // Check doctor information is displayed
      cy.get('[data-testid="doctor-card"]').first().within(() => {
        cy.get('[data-testid="doctor-name"]').should('be.visible')
        cy.get('[data-testid="doctor-specialty"]').should('be.visible')
        cy.get('[data-testid="doctor-qualifications"]').should('be.visible')
        cy.get('[data-testid="doctor-experience"]').should('be.visible')
      })
    })

    it('should filter doctors by specialty', () => {
      cy.visit('/appointments/book')
      
      // Select specialty filter
      cy.get('[data-testid="specialty-filter"]').select('Cardiology')
      
      // Should show only cardiologists
      cy.get('[data-testid="doctor-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="doctor-specialty"]').should('contain', 'Cardiology')
      })
    })

    it('should search doctors by name', () => {
      cy.visit('/appointments/book')
      
      cy.get('[data-testid="doctor-search"]').type('Smith')
      
      // Should show only doctors with "Smith" in their name
      cy.get('[data-testid="doctor-card"]').should('have.length.at.least', 1)
      cy.get('[data-testid="doctor-name"]').should('contain', 'Smith')
    })

    it('should select a doctor', () => {
      cy.visit('/appointments/book')
      
      cy.get('[data-testid="doctor-card"]').first().click()
      
      // Should show selected state
      cy.get('[data-testid="doctor-card"]').first().should('have.class', 'selected')
      cy.get('[data-testid="selected-doctor-info"]').should('be.visible')
    })
  })

  describe('Date and Time Selection', () => {
    beforeEach(() => {
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
    })

    it('should display availability calendar', () => {
      cy.get('[data-testid="availability-calendar"]').should('be.visible')
      cy.get('[data-testid="calendar-navigation"]').should('be.visible')
    })

    it('should navigate between months', () => {
      cy.get('[data-testid="next-month-button"]').click()
      
      // Should show next month
      cy.get('[data-testid="calendar-month"]').should('not.contain', new Date().toLocaleString('default', { month: 'long' }))
      
      cy.get('[data-testid="prev-month-button"]').click()
      
      // Should return to current month
      cy.get('[data-testid="calendar-month"]').should('contain', new Date().toLocaleString('default', { month: 'long' }))
    })

    it('should show available time slots for selected date', () => {
      // Select a future date
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      
      cy.get('[data-testid="time-slots"]').should('be.visible')
      cy.get('[data-testid="time-slot"]').should('have.length.at.least', 1)
    })

    it('should disable unavailable time slots', () => {
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      
      // Some slots should be disabled
      cy.get('[data-testid="time-slot"][disabled]').should('exist')
    })

    it('should select a time slot', () => {
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      
      // Should show selected state
      cy.get('[data-testid="time-slot"].selected').should('exist')
      cy.get('[data-testid="selected-time-info"]').should('be.visible')
    })

    it('should prevent selecting past dates', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      cy.get(`[data-testid="calendar-day"][data-date="${yesterday.getDate()}"]`)
        .should('have.class', 'disabled')
        .should('not.be.clickable')
    })
  })

  describe('Appointment Details', () => {
    beforeEach(() => {
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
    })

    it('should show appointment details form', () => {
      cy.get('[data-testid="appointment-details-form"]').should('be.visible')
      cy.get('[data-testid="appointment-notes"]').should('be.visible')
      cy.get('[data-testid="book-appointment-button"]').should('be.visible')
    })

    it('should display appointment summary', () => {
      cy.get('[data-testid="appointment-summary"]').within(() => {
        cy.get('[data-testid="summary-doctor"]').should('be.visible')
        cy.get('[data-testid="summary-date"]').should('be.visible')
        cy.get('[data-testid="summary-time"]').should('be.visible')
      })
    })

    it('should allow adding appointment notes', () => {
      const notes = 'Regular checkup for chest pain'
      
      cy.get('[data-testid="appointment-notes"]').type(notes)
      cy.get('[data-testid="appointment-notes"]').should('have.value', notes)
    })
  })

  describe('Appointment Booking', () => {
    beforeEach(() => {
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
    })

    it('should book appointment successfully', () => {
      const notes = 'Regular checkup'
      
      cy.get('[data-testid="appointment-notes"]').type(notes)
      cy.get('[data-testid="book-appointment-button"]').click()
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Appointment booked successfully')
      
      // Should redirect to appointments list
      cy.url().should('include', '/appointments')
      
      // Should show the new appointment
      cy.get('[data-testid="appointment-card"]').should('contain', notes)
    })

    it('should show loading state during booking', () => {
      cy.get('[data-testid="book-appointment-button"]').click()
      
      // Should show loading state
      cy.get('[data-testid="book-appointment-button"]').should('contain', 'Booking...')
      cy.get('[data-testid="book-appointment-button"]').should('be.disabled')
    })

    it('should handle booking conflicts', () => {
      // Book first appointment
      cy.get('[data-testid="book-appointment-button"]').click()
      cy.get('[data-testid="success-message"]').should('be.visible')
      
      // Try to book same slot again
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      
      // The previously booked slot should now be disabled
      cy.get('[data-testid="time-slot"][disabled]').should('exist')
    })

    it('should validate required fields', () => {
      // Try to book without selecting doctor
      cy.visit('/appointments/book')
      cy.get('[data-testid="book-appointment-button"]').should('not.exist')
      
      // Select doctor but not time
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="book-appointment-button"]').should('not.exist')
    })

    it('should handle network errors gracefully', () => {
      // Intercept and fail the booking request
      cy.intercept('POST', '**/appointments', { statusCode: 500 }).as('bookingError')
      
      cy.get('[data-testid="book-appointment-button"]').click()
      
      cy.wait('@bookingError')
      cy.get('[data-testid="error-message"]').should('contain', 'Failed to book appointment')
    })
  })

  describe('Appointment Booking Accessibility', () => {
    it('should be accessible throughout booking flow', () => {
      cy.visit('/appointments/book')
      cy.checkAccessibility()
      
      // Select doctor
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.checkAccessibility()
      
      // Select date and time
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      cy.checkAccessibility()
    })

    it('should have proper ARIA labels and roles', () => {
      cy.visit('/appointments/book')
      
      // Check doctor cards have proper labels
      cy.get('[data-testid="doctor-card"]').should('have.attr', 'role', 'button')
      cy.get('[data-testid="doctor-card"]').should('have.attr', 'aria-label')
      
      // Check calendar has proper navigation
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="availability-calendar"]').should('have.attr', 'role', 'grid')
      cy.get('[data-testid="calendar-day"]').should('have.attr', 'role', 'gridcell')
    })

    it('should support keyboard navigation', () => {
      cy.visit('/appointments/book')
      
      // Should be able to navigate doctors with keyboard
      cy.get('[data-testid="doctor-card"]').first().focus()
      cy.get('[data-testid="doctor-card"]').first().type('{enter}')
      
      // Should select the doctor
      cy.get('[data-testid="doctor-card"]').first().should('have.class', 'selected')
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display properly on mobile devices', () => {
      cy.visit('/appointments/book')
      
      // Doctor cards should stack vertically
      cy.get('[data-testid="doctors-list"]').should('have.css', 'flex-direction', 'column')
      
      // Calendar should be responsive
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="availability-calendar"]').should('be.visible')
    })

    it('should maintain functionality on mobile', () => {
      cy.visit('/appointments/book')
      
      // Should be able to complete booking flow on mobile
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      cy.get('[data-testid="book-appointment-button"]').click()
      
      cy.get('[data-testid="success-message"]').should('be.visible')
    })
  })
})