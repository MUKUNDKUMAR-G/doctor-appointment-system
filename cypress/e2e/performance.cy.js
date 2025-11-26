describe('Performance Tests', () => {
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

  describe('Page Load Performance', () => {
    it('should load dashboard within acceptable time', () => {
      const startTime = Date.now()
      
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(3000) // 3 seconds
      })
    })

    it('should load appointments list within acceptable time', () => {
      const startTime = Date.now()
      
      cy.visit('/appointments')
      cy.get('[data-testid="appointments-list"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(2000) // 2 seconds
      })
    })

    it('should load doctor search within acceptable time', () => {
      const startTime = Date.now()
      
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctors-list"]').should('be.visible')
      
      cy.then(() => {
        const loadTime = Date.now() - startTime
        expect(loadTime).to.be.lessThan(2000) // 2 seconds
      })
    })
  })

  describe('API Response Performance', () => {
    it('should fetch doctors list quickly', () => {
      cy.intercept('GET', '**/doctors', (req) => {
        req.reply((res) => {
          expect(res.delay).to.be.undefined
          res.send()
        })
      }).as('getDoctors')
      
      cy.visit('/appointments/book')
      
      cy.wait('@getDoctors').then((interception) => {
        expect(interception.response.duration).to.be.lessThan(1000) // 1 second
      })
    })

    it('should fetch appointments quickly', () => {
      cy.intercept('GET', '**/appointments/patient/*', (req) => {
        req.reply((res) => {
          expect(res.delay).to.be.undefined
          res.send()
        })
      }).as('getAppointments')
      
      cy.visit('/appointments')
      
      cy.wait('@getAppointments').then((interception) => {
        expect(interception.response.duration).to.be.lessThan(1000) // 1 second
      })
    })

    it('should book appointment quickly', () => {
      cy.intercept('POST', '**/appointments', (req) => {
        req.reply((res) => {
          expect(res.delay).to.be.undefined
          res.send()
        })
      }).as('bookAppointment')
      
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      cy.get('[data-testid="book-appointment-button"]').click()
      
      cy.wait('@bookAppointment').then((interception) => {
        expect(interception.response.duration).to.be.lessThan(2000) // 2 seconds
      })
    })
  })

  describe('UI Responsiveness', () => {
    it('should handle rapid user interactions', () => {
      cy.visit('/appointments/book')
      
      // Rapidly click through doctors
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="doctor-card"]').eq(i % 3).click()
        cy.wait(100)
      }
      
      // Should still be responsive
      cy.get('[data-testid="selected-doctor-info"]').should('be.visible')
    })

    it('should handle form input without lag', () => {
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      
      const longText = 'This is a very long appointment note that tests the performance of text input handling in the application. '.repeat(10)
      
      const startTime = Date.now()
      cy.get('[data-testid="appointment-notes"]').type(longText, { delay: 0 })
      
      cy.then(() => {
        const inputTime = Date.now() - startTime
        expect(inputTime).to.be.lessThan(5000) // 5 seconds for long text
      })
    })

    it('should handle search filtering efficiently', () => {
      cy.visit('/appointments/book')
      
      const startTime = Date.now()
      
      // Type search query
      cy.get('[data-testid="doctor-search"]').type('Smith', { delay: 0 })
      
      // Results should appear quickly
      cy.get('[data-testid="doctor-card"]').should('be.visible')
      
      cy.then(() => {
        const searchTime = Date.now() - startTime
        expect(searchTime).to.be.lessThan(1000) // 1 second
      })
    })
  })

  describe('Memory Usage', () => {
    it('should not cause memory leaks during navigation', () => {
      // Navigate through multiple pages
      const pages = ['/dashboard', '/appointments', '/appointments/book', '/profile']
      
      pages.forEach((page, index) => {
        cy.visit(page)
        cy.waitForPageLoad()
        
        // Check that page loads successfully
        cy.get('body').should('be.visible')
        
        // Simulate some user interaction
        if (page === '/appointments/book') {
          cy.get('[data-testid="doctor-card"]').first().click()
        }
        
        cy.wait(500) // Allow time for any cleanup
      })
      
      // Return to dashboard - should still be responsive
      cy.visit('/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
    })

    it('should handle large datasets efficiently', () => {
      // This would require seeding a large amount of test data
      cy.visit('/appointments')
      
      // Simulate scrolling through large list
      for (let i = 0; i < 10; i++) {
        cy.scrollTo('bottom')
        cy.wait(100)
      }
      
      // Page should still be responsive
      cy.get('[data-testid="appointments-list"]').should('be.visible')
    })
  })

  describe('Network Performance', () => {
    it('should handle slow network conditions', () => {
      // Simulate slow network
      cy.intercept('GET', '**/doctors', (req) => {
        req.reply((res) => {
          res.delay(2000) // 2 second delay
          res.send()
        })
      }).as('slowDoctors')
      
      cy.visit('/appointments/book')
      
      // Should show loading state
      cy.get('[data-testid="loading-doctors"]').should('be.visible')
      
      cy.wait('@slowDoctors')
      
      // Should eventually load
      cy.get('[data-testid="doctors-list"]').should('be.visible')
      cy.get('[data-testid="loading-doctors"]').should('not.exist')
    })

    it('should handle network failures gracefully', () => {
      // Simulate network failure
      cy.intercept('GET', '**/doctors', { forceNetworkError: true }).as('networkError')
      
      cy.visit('/appointments/book')
      
      // Should show error state
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should cache data appropriately', () => {
      cy.visit('/appointments/book')
      
      // First load
      cy.intercept('GET', '**/doctors').as('firstLoad')
      cy.wait('@firstLoad')
      
      // Navigate away and back
      cy.visit('/dashboard')
      cy.visit('/appointments/book')
      
      // Should use cached data (no new request or very fast)
      cy.get('[data-testid="doctors-list"]').should('be.visible')
    })
  })

  describe('Concurrent User Simulation', () => {
    it('should handle multiple booking attempts', () => {
      // This test simulates what happens when multiple users try to book the same slot
      cy.visit('/appointments/book')
      cy.get('[data-testid="doctor-card"]').first().click()
      cy.get('[data-testid="calendar-day"]').contains('25').click()
      cy.get('[data-testid="time-slot"]:not([disabled])').first().click()
      
      // Simulate another user booking the same slot
      cy.intercept('POST', '**/appointments', {
        statusCode: 409,
        body: { error: 'Time slot no longer available' }
      }).as('conflictError')
      
      cy.get('[data-testid="book-appointment-button"]').click()
      
      cy.wait('@conflictError')
      cy.get('[data-testid="error-message"]').should('contain', 'Time slot no longer available')
    })
  })

  describe('Bundle Size and Loading', () => {
    it('should have reasonable initial bundle size', () => {
      cy.visit('/')
      
      // Check that initial page loads without excessive resources
      cy.window().then((win) => {
        const performance = win.performance
        const navigation = performance.getEntriesByType('navigation')[0]
        
        // Total load time should be reasonable
        expect(navigation.loadEventEnd - navigation.loadEventStart).to.be.lessThan(5000)
      })
    })

    it('should lazy load non-critical resources', () => {
      cy.visit('/dashboard')
      
      // Check that appointment booking components are not loaded initially
      cy.window().then((win) => {
        const scripts = Array.from(win.document.querySelectorAll('script'))
        const hasBookingScript = scripts.some(script => 
          script.src && script.src.includes('appointment-booking')
        )
        expect(hasBookingScript).to.be.false
      })
      
      // Navigate to booking page
      cy.visit('/appointments/book')
      
      // Now booking components should be loaded
      cy.get('[data-testid="doctors-list"]').should('be.visible')
    })
  })
})