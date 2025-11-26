describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.cleanupDatabase()
  })

  describe('User Registration', () => {
    it('should register a new patient successfully', () => {
      cy.visit('/register')
      
      // Fill registration form
      cy.get('[data-testid="first-name-input"]').type('John')
      cy.get('[data-testid="last-name-input"]').type('Doe')
      cy.get('[data-testid="email-input"]').type('john.doe@example.com')
      cy.get('[data-testid="phone-input"]').type('+1234567890')
      cy.get('[data-testid="password-input"]').type('TestPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('TestPass123!')
      
      // Submit form
      cy.get('[data-testid="register-button"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, John')
      
      // Should store authentication tokens
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.exist
        expect(win.localStorage.getItem('refreshToken')).to.exist
      })
    })

    it('should show validation errors for invalid input', () => {
      cy.visit('/register')
      
      // Try to submit empty form
      cy.get('[data-testid="register-button"]').click()
      
      // Should show validation errors
      cy.get('[data-testid="first-name-error"]').should('contain', 'First name is required')
      cy.get('[data-testid="last-name-error"]').should('contain', 'Last name is required')
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="phone-error"]').should('contain', 'Phone number is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    })

    it('should validate password strength', () => {
      cy.visit('/register')
      
      cy.get('[data-testid="password-input"]').type('weak')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters')
    })

    it('should validate password confirmation', () => {
      cy.visit('/register')
      
      cy.get('[data-testid="password-input"]').type('TestPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('DifferentPass123!')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
    })

    it('should handle duplicate email registration', () => {
      // Register first user
      cy.register({ email: 'duplicate@example.com' })
      
      // Try to register with same email
      cy.visit('/register')
      cy.get('[data-testid="first-name-input"]').type('Jane')
      cy.get('[data-testid="last-name-input"]').type('Smith')
      cy.get('[data-testid="email-input"]').type('duplicate@example.com')
      cy.get('[data-testid="phone-input"]').type('+0987654321')
      cy.get('[data-testid="password-input"]').type('TestPass123!')
      cy.get('[data-testid="confirm-password-input"]').type('TestPass123!')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="error-message"]').should('contain', 'Email already exists')
    })
  })

  describe('User Login', () => {
    beforeEach(() => {
      // Create test user
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
    })

    it('should login successfully with valid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('TestPass123!')
      cy.get('[data-testid="login-button"]').click()
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="welcome-message"]').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials')
      cy.url().should('include', '/login')
    })

    it('should validate required fields', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required')
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required')
    })

    it('should validate email format', () => {
      cy.visit('/login')
      
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Please enter a valid email')
    })
  })

  describe('Authentication State', () => {
    beforeEach(() => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
    })

    it('should persist authentication across page refreshes', () => {
      cy.login('test@example.com', 'TestPass123!')
      
      // Refresh page
      cy.reload()
      
      // Should still be authenticated
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="welcome-message"]').should('be.visible')
    })

    it('should redirect to login when accessing protected routes without authentication', () => {
      cy.visit('/appointments')
      
      cy.url().should('include', '/login')
      cy.get('[data-testid="login-required-message"]').should('be.visible')
    })

    it('should logout successfully', () => {
      cy.login('test@example.com', 'TestPass123!')
      
      cy.logout()
      
      // Should clear tokens
      cy.window().then((win) => {
        expect(win.localStorage.getItem('accessToken')).to.be.null
        expect(win.localStorage.getItem('refreshToken')).to.be.null
      })
    })

    it('should handle token expiration gracefully', () => {
      cy.login('test@example.com', 'TestPass123!')
      
      // Simulate expired token
      cy.window().then((win) => {
        win.localStorage.setItem('accessToken', 'expired.token.here')
      })
      
      // Try to access protected route
      cy.visit('/appointments')
      
      // Should redirect to login
      cy.url().should('include', '/login')
      cy.get('[data-testid="session-expired-message"]').should('be.visible')
    })
  })

  describe('Navigation', () => {
    beforeEach(() => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
    })

    it('should navigate between authenticated pages', () => {
      // Start on dashboard
      cy.url().should('include', '/dashboard')
      
      // Navigate to appointments
      cy.get('[data-testid="nav-appointments"]').click()
      cy.url().should('include', '/appointments')
      
      // Navigate to doctors
      cy.get('[data-testid="nav-doctors"]').click()
      cy.url().should('include', '/doctors')
      
      // Navigate to profile
      cy.get('[data-testid="nav-profile"]').click()
      cy.url().should('include', '/profile')
    })

    it('should show correct navigation items for patient role', () => {
      cy.get('[data-testid="navigation"]').within(() => {
        cy.get('[data-testid="nav-dashboard"]').should('be.visible')
        cy.get('[data-testid="nav-appointments"]').should('be.visible')
        cy.get('[data-testid="nav-doctors"]').should('be.visible')
        cy.get('[data-testid="nav-profile"]').should('be.visible')
        
        // Admin-only items should not be visible
        cy.get('[data-testid="nav-admin"]').should('not.exist')
      })
    })
  })

  describe('Accessibility', () => {
    it('should be accessible on login page', () => {
      cy.visit('/login')
      cy.checkAccessibility()
    })

    it('should be accessible on registration page', () => {
      cy.visit('/register')
      cy.checkAccessibility()
    })

    it('should be accessible on dashboard', () => {
      cy.apiRegister({ email: 'test@example.com', password: 'TestPass123!' })
      cy.login('test@example.com', 'TestPass123!')
      cy.checkAccessibility()
    })
  })
})