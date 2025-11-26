describe('Security Tests', () => {
  beforeEach(() => {
    cy.cleanupDatabase()
    cy.seedTestData()
  })

  describe('Authentication Security', () => {
    it('should prevent access to protected routes without authentication', () => {
      const protectedRoutes = [
        '/dashboard',
        '/appointments',
        '/appointments/book',
        '/profile'
      ]

      protectedRoutes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', '/login')
        cy.get('[data-testid="login-required-message"]').should('be.visible')
      })
    })

    it('should invalidate session on logout', () => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
      
      // Verify authenticated access
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
      
      // Logout
      cy.logout()
      
      // Try to access protected route with old session
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should handle expired tokens securely', () => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
      
      // Manually set expired token
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'expired.jwt.token')
      })
      
      // Try to access protected route
      cy.visit('/dashboard')
      
      // Should redirect to login
      cy.url().should('include', '/login')
      cy.get('[data-testid="session-expired-message"]').should('be.visible')
      
      // Tokens should be cleared
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.be.null
        expect(win.localStorage.getItem('refreshToken')).to.be.null
      })
    })

    it('should prevent brute force attacks', () => {
      cy.visit('/login')
      
      // Attempt multiple failed logins
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="email-input"]').clear().type('test@example.com')
        cy.get('[data-testid="password-input"]').clear().type('wrongpassword')
        cy.get('[data-testid="login-button"]').click()
        cy.wait(500)
      }
      
      // Should show rate limiting message
      cy.get('[data-testid="error-message"]').should('contain', 'Too many failed attempts')
      cy.get('[data-testid="login-button"]').should('be.disabled')
    })

    it('should validate JWT tokens properly', () => {
      // Try to access API with invalid token
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/appointments/patient/1`,
        headers: {
          'Authorization': 'Bearer invalid.jwt.token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(401)
      })
    })
  })

  describe('Input Validation and Sanitization', () => {
    beforeEach(() => {
      cy.apiRegister({ email: 'patient@test.com', password: 'TestPass123!' })
      cy.login('patient@test.com', 'TestPass123!')
    })

    it('should prevent XSS attacks in appointment notes', () => {
      const xssPayload = '<script>alert("XSS")</script>'
      
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      
      // Try to inject XSS in notes
      cy.get('[data-testid="appointment-notes"]').type(xssPayload)
      cy.get('[data-testid="book-appointment-button"]').click()
      
      // Navigate to appointments list
      cy.visit('/appointments')
      
      // XSS should be escaped/sanitized
      cy.get('[data-testid="appointment-notes"]').should('not.contain', '<script>')
      cy.get('[data-testid="appointment-notes"]').should('contain', '&lt;script&gt;')
    })

    it('should validate email format strictly', () => {
      cy.visit('/register')
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        'user name@domain.com'
      ]
      
      invalidEmails.forEach(email => {
        cy.get('[data-testid="email-input"]').clear().type(email)
        cy.get('[data-testid="register-button"]').click()
        cy.get('[data-testid="email-error"]').should('contain', 'valid email')
      })
    })

    it('should prevent SQL injection attempts', () => {
      const sqlPayload = "'; DROP TABLE users; --"
      
      cy.visit('/login')
      cy.get('[data-testid="email-input"]').type(sqlPayload)
      cy.get('[data-testid="password-input"]').type('password')
      cy.get('[data-testid="login-button"]').click()
      
      // Should handle gracefully without exposing database errors
      cy.get('[data-testid="error-message"]').should('not.contain', 'SQL')
      cy.get('[data-testid="error-message"]').should('not.contain', 'database')
    })

    it('should validate phone number format', () => {
      cy.visit('/register')
      
      const invalidPhones = [
        '123',
        'abc-def-ghij',
        '123-456-78901',
        '+1-800-FLOWERS'
      ]
      
      invalidPhones.forEach(phone => {
        cy.get('[data-testid="phone-input"]').clear().type(phone)
        cy.get('[data-testid="register-button"]').click()
        cy.get('[data-testid="phone-error"]').should('contain', 'valid phone')
      })
    })
  })

  describe('Authorization and Access Control', () => {
    beforeEach(() => {
      cy.apiRegister({ 
        email: 'patient@test.com', 
        password: 'TestPass123!',
        role: 'PATIENT'
      })
      cy.login('patient@test.com', 'TestPass123!')
    })

    it('should prevent patients from accessing admin endpoints', () => {
      // Try to access admin-only API endpoints
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/admin/users`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(403)
      })
    })

    it('should prevent patients from accessing other patients data', () => {
      // Try to access another patient's appointments
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/appointments/patient/999`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404])
      })
    })

    it('should prevent unauthorized appointment modifications', () => {
      // Try to cancel another user's appointment
      cy.request({
        method: 'DELETE',
        url: `${Cypress.env('apiUrl')}/appointments/999`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('accessToken')}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([403, 404])
      })
    })

    it('should validate user ownership of resources', () => {
      // Book an appointment first
      cy.bookAppointment(1, '09:00', 'Test appointment')
      
      // Try to access appointment details
      cy.visit('/appointments')
      cy.get('[data-testid="appointment-card"]').first().click()
      
      // Should be able to access own appointment
      cy.get('[data-testid="appointment-details"]').should('be.visible')
      
      // Try to access non-existent appointment
      cy.visit('/appointments/999')
      cy.get('[data-testid="error-message"]').should('contain', 'not found')
    })
  })

  describe('Data Protection', () => {
    beforeEach(() => {
      cy.apiRegister({ email: 'patient@test.com', password: 'TestPass123!' })
      cy.login('patient@test.com', 'TestPass123!')
    })

    it('should not expose sensitive data in client-side code', () => {
      cy.visit('/dashboard')
      
      // Check that sensitive data is not in the page source
      cy.get('body').should('not.contain', 'password')
      cy.get('body').should('not.contain', 'secret')
      cy.get('body').should('not.contain', 'private_key')
    })

    it('should mask sensitive information in forms', () => {
      cy.visit('/profile')
      
      // Password fields should be masked
      cy.get('[data-testid="current-password"]').should('have.attr', 'type', 'password')
      cy.get('[data-testid="new-password"]').should('have.attr', 'type', 'password')
    })

    it('should not log sensitive data to console', () => {
      cy.visit('/login')
      
      cy.window().then((win) => {
        // Override console methods to capture logs
        const logs = []
        const originalLog = win.console.log
        win.console.log = (...args) => {
          logs.push(args.join(' '))
          originalLog.apply(win.console, args)
        }
        
        // Perform login
        cy.get('[data-testid="email-input"]').type('patient@test.com')
        cy.get('[data-testid="password-input"]').type('TestPass123!')
        cy.get('[data-testid="login-button"]').click()
        
        cy.then(() => {
          // Check that password is not logged
          const hasPasswordInLogs = logs.some(log => 
            log.includes('TestPass123!') || log.includes('password')
          )
          expect(hasPasswordInLogs).to.be.false
        })
      })
    })
  })

  describe('HTTPS and Secure Communication', () => {
    it('should enforce HTTPS in production', () => {
      // This test would be more relevant in a production environment
      cy.request({
        method: 'GET',
        url: Cypress.config('baseUrl').replace('https://', 'http://'),
        failOnStatusCode: false
      }).then((response) => {
        // Should redirect to HTTPS or return security headers
        expect(response.status).to.be.oneOf([301, 302, 403])
      })
    })

    it('should include security headers', () => {
      cy.request('/').then((response) => {
        // Check for security headers
        expect(response.headers).to.have.property('x-content-type-options')
        expect(response.headers).to.have.property('x-frame-options')
        expect(response.headers).to.have.property('x-xss-protection')
      })
    })
  })

  describe('Session Management', () => {
    beforeEach(() => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
    })

    it('should handle concurrent sessions appropriately', () => {
      // Login in first session
      cy.login('test@example.com', 'TestPass123!')
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
      
      // Simulate login from another device/browser
      cy.window().then((win) => {
        const currentToken = win.localStorage.getItem('accessToken')
        
        // Login again (simulating another session)
        cy.apiLogin('test@example.com', 'TestPass123!')
        
        // Original session should still work (or be invalidated based on security policy)
        cy.visit('/appointments')
        // The behavior here depends on your session management policy
      })
    })

    it('should timeout inactive sessions', () => {
      cy.login('test@example.com', 'TestPass123!')
      
      // Simulate session timeout by setting expired token
      cy.window().then((win) => {
        // This would normally be handled by the server
        win.localStorage.setItem('accessToken', 'expired.token')
      })
      
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })
  })

  describe('Error Handling Security', () => {
    it('should not expose stack traces to users', () => {
      // Trigger a server error
      cy.intercept('GET', '**/appointments/patient/*', { statusCode: 500 }).as('serverError')
      
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
      cy.visit('/appointments')
      
      cy.wait('@serverError')
      
      // Error message should be generic
      cy.get('[data-testid="error-message"]').should('not.contain', 'stack')
      cy.get('[data-testid="error-message"]').should('not.contain', 'trace')
      cy.get('[data-testid="error-message"]').should('not.contain', 'Exception')
    })

    it('should handle malformed API responses securely', () => {
      cy.intercept('GET', '**/doctors', { body: 'invalid json' }).as('malformedResponse')
      
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
      cy.visit('/appointments/book')
      
      cy.wait('@malformedResponse')
      
      // Should show generic error message
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('not.contain', 'JSON')
      cy.get('[data-testid="error-message"]').should('not.contain', 'parse')
    })
  })
})