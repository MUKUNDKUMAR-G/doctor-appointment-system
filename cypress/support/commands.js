// Custom commands for the appointment system

// Authentication commands
Cypress.Commands.add('login', (email = 'patient@test.com', password = 'TestPass123!') => {
  cy.visit('/login')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('register', (userData = {}) => {
  const defaultData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!'
  }
  
  const data = { ...defaultData, ...userData }
  
  cy.visit('/register')
  cy.get('[data-testid="first-name-input"]').type(data.firstName)
  cy.get('[data-testid="last-name-input"]').type(data.lastName)
  cy.get('[data-testid="email-input"]').type(data.email)
  cy.get('[data-testid="phone-input"]').type(data.phoneNumber)
  cy.get('[data-testid="password-input"]').type(data.password)
  cy.get('[data-testid="confirm-password-input"]').type(data.confirmPassword)
  cy.get('[data-testid="register-button"]').click()
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('include', '/login')
})

// Appointment commands
Cypress.Commands.add('bookAppointment', (doctorId = 1, timeSlot = '09:00', notes = 'Test appointment') => {
  cy.visit('/appointments/book')
  
  // Select doctor
  cy.get(`[data-testid="doctor-card-${doctorId}"]`).click()
  
  // Wait for availability to load
  cy.get('[data-testid="availability-calendar"]').should('be.visible')
  
  // Select time slot
  cy.get(`[data-testid="time-slot-${timeSlot}"]`).click()
  
  // Fill notes
  cy.get('[data-testid="appointment-notes"]').type(notes)
  
  // Book appointment
  cy.get('[data-testid="book-appointment-button"]').click()
  
  // Wait for success message
  cy.get('[data-testid="success-message"]').should('contain', 'Appointment booked successfully')
})

Cypress.Commands.add('cancelAppointment', (appointmentId, reason = 'Personal emergency') => {
  cy.visit('/appointments')
  
  // Find and cancel appointment
  cy.get(`[data-testid="appointment-${appointmentId}"]`).within(() => {
    cy.get('[data-testid="cancel-button"]').click()
  })
  
  // Fill cancellation reason
  cy.get('[data-testid="cancellation-reason"]').type(reason)
  cy.get('[data-testid="confirm-cancellation"]').click()
  
  // Wait for success message
  cy.get('[data-testid="success-message"]').should('contain', 'Appointment cancelled successfully')
})

// API commands
Cypress.Commands.add('apiLogin', (email = 'patient@test.com', password = 'TestPass123!') => {
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('accessToken', response.body.accessToken)
    window.localStorage.setItem('refreshToken', response.body.refreshToken)
    return response.body
  })
})

Cypress.Commands.add('apiRegister', (userData = {}) => {
  const defaultData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'test@example.com',
    phoneNumber: '+1234567890',
    password: 'TestPass123!',
    role: 'PATIENT'
  }
  
  const data = { ...defaultData, ...userData }
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: data
  })
})

Cypress.Commands.add('apiCreateDoctor', (doctorData = {}) => {
  const defaultData = {
    firstName: 'Dr. Jane',
    lastName: 'Smith',
    email: 'doctor@test.com',
    specialty: 'Cardiology',
    qualifications: 'MD, FACC',
    experienceYears: 10,
    bio: 'Experienced cardiologist'
  }
  
  const data = { ...defaultData, ...doctorData }
  
  return cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/doctors`,
    body: data,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('accessToken')}`
    }
  })
})

// Utility commands
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('[data-testid="loading"]').should('not.exist')
  cy.get('body').should('be.visible')
})

Cypress.Commands.add('checkAccessibility', () => {
  cy.injectAxe()
  cy.checkA11y()
})

// Database cleanup commands
Cypress.Commands.add('cleanupDatabase', () => {
  cy.request({
    method: 'DELETE',
    url: `${Cypress.env('apiUrl')}/test/cleanup`,
    failOnStatusCode: false
  })
})

Cypress.Commands.add('seedTestData', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/seed`,
    failOnStatusCode: false
  })
})