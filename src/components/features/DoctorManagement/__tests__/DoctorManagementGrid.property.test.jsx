/**
 * Property-Based Tests for Doctor Management Grid
 * Feature: admin-interface-modernization
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import fc from 'fast-check';
import DoctorManagementGrid from '../DoctorManagementGrid';

// Test wrapper with required providers
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

// Arbitrary generator for doctor data
const doctorArbitrary = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  avatarUrl: fc.option(fc.webUrl(), { nil: null }),
  specialty: fc.constantFrom(
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Psychiatry',
    'General Medicine'
  ),
  experienceYears: fc.integer({ min: 1, max: 50 }),
  consultationFee: fc.integer({ min: 200, max: 5000 }),
  location: fc.option(
    fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'),
    { nil: null }
  ),
  rating: fc.option(fc.double({ min: 0, max: 5, noNaN: true }), { nil: null }),
  isVerified: fc.boolean(),
  isAvailable: fc.boolean(),
  user: fc.record({
    firstName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[A-Za-z]+$/.test(s)),
    lastName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => /^[A-Za-z]+$/.test(s)),
    email: fc.emailAddress(),
  }),
});

describe('DoctorManagementGrid Property Tests', () => {
  /**
   * **Feature: admin-interface-modernization, Property 4: Doctor card completeness**
   * **Validates: Requirements 3.2**
   * 
   * Property: For any doctor displayed in the management interface, the system should show
   * profile image, rating, verification badge, and specialty information.
   */
  describe('Property 4: Doctor card completeness', () => {
    it('should display all required doctor information for any doctor in grid view', () => {
      fc.assert(
        fc.property(
          fc.array(doctorArbitrary, { minLength: 1, maxLength: 10 }),
          (doctors) => {
            // Render the component with generated doctors
            const mockHandlers = {
              selectedDoctors: [],
              onSelectDoctor: vi.fn(),
              onSelectAll: vi.fn(),
              onDoctorAction: vi.fn(),
              viewMode: 'grid',
              onViewModeChange: vi.fn(),
            };

            const { container } = render(
              <TestWrapper>
                <DoctorManagementGrid
                  doctors={doctors}
                  {...mockHandlers}
                />
              </TestWrapper>
            );

            // For each doctor, verify all required information is displayed
            doctors.forEach((doctor) => {
              const fullName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
              
              // 1. Profile image (avatar) should be present
              // Check for avatar by looking for the doctor's name or initials
              const avatarElements = container.querySelectorAll('[class*="MuiAvatar"]');
              expect(avatarElements.length).toBeGreaterThan(0);

              // 2. Doctor name should be displayed
              expect(screen.getByText(fullName)).toBeInTheDocument();

              // 3. Specialty should be displayed
              expect(screen.getByText(doctor.specialty)).toBeInTheDocument();

              // 4. Verification badge should be present
              const verificationText = doctor.isVerified ? 'Verified' : 'Pending';
              expect(screen.getByText(verificationText)).toBeInTheDocument();

              // 5. Rating should be displayed if present
              if (doctor.rating !== null && doctor.rating !== undefined) {
                // Rating component should be rendered
                const ratingElements = container.querySelectorAll('[class*="MuiRating"]');
                expect(ratingElements.length).toBeGreaterThan(0);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display all required doctor information for any doctor in table view', () => {
      fc.assert(
        fc.property(
          fc.array(doctorArbitrary, { minLength: 1, maxLength: 10 }),
          (doctors) => {
            // Render the component with generated doctors in table view
            const mockHandlers = {
              selectedDoctors: [],
              onSelectDoctor: vi.fn(),
              onSelectAll: vi.fn(),
              onDoctorAction: vi.fn(),
              viewMode: 'table',
              onViewModeChange: vi.fn(),
            };

            const { container } = render(
              <TestWrapper>
                <DoctorManagementGrid
                  doctors={doctors}
                  {...mockHandlers}
                />
              </TestWrapper>
            );

            // For each doctor, verify all required information is displayed
            doctors.forEach((doctor) => {
              const fullName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
              
              // 1. Profile image (avatar) should be present in table
              const avatarElements = container.querySelectorAll('[class*="MuiAvatar"]');
              expect(avatarElements.length).toBeGreaterThan(0);

              // 2. Doctor name should be displayed
              expect(screen.getByText(fullName)).toBeInTheDocument();

              // 3. Email should be displayed
              expect(screen.getByText(doctor.user.email)).toBeInTheDocument();

              // 4. Specialty should be displayed
              expect(screen.getByText(doctor.specialty)).toBeInTheDocument();

              // 5. Verification badge should be present
              const verificationText = doctor.isVerified ? 'Verified' : 'Pending';
              expect(screen.getByText(verificationText)).toBeInTheDocument();

              // 6. Rating should be displayed
              if (doctor.rating !== null && doctor.rating !== undefined) {
                const ratingElements = container.querySelectorAll('[class*="MuiRating"]');
                expect(ratingElements.length).toBeGreaterThan(0);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should always display verification status regardless of verification state', () => {
      fc.assert(
        fc.property(
          fc.array(doctorArbitrary, { minLength: 1, maxLength: 5 }),
          (doctors) => {
            const mockHandlers = {
              selectedDoctors: [],
              onSelectDoctor: vi.fn(),
              onSelectAll: vi.fn(),
              onDoctorAction: vi.fn(),
              viewMode: 'grid',
              onViewModeChange: vi.fn(),
            };

            render(
              <TestWrapper>
                <DoctorManagementGrid
                  doctors={doctors}
                  {...mockHandlers}
                />
              </TestWrapper>
            );

            // Every doctor must have either "Verified" or "Pending" badge
            doctors.forEach((doctor) => {
              const expectedText = doctor.isVerified ? 'Verified' : 'Pending';
              const badges = screen.getAllByText(expectedText);
              expect(badges.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display specialty information for all doctors', () => {
      fc.assert(
        fc.property(
          fc.array(doctorArbitrary, { minLength: 1, maxLength: 5 }),
          (doctors) => {
            const mockHandlers = {
              selectedDoctors: [],
              onSelectDoctor: vi.fn(),
              onSelectAll: vi.fn(),
              onDoctorAction: vi.fn(),
              viewMode: 'grid',
              onViewModeChange: vi.fn(),
            };

            render(
              <TestWrapper>
                <DoctorManagementGrid
                  doctors={doctors}
                  {...mockHandlers}
                />
              </TestWrapper>
            );

            // Every doctor must have their specialty displayed
            doctors.forEach((doctor) => {
              expect(screen.getByText(doctor.specialty)).toBeInTheDocument();
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should display profile information (name and avatar) for all doctors', () => {
      fc.assert(
        fc.property(
          fc.array(doctorArbitrary, { minLength: 1, maxLength: 5 }),
          (doctors) => {
            const mockHandlers = {
              selectedDoctors: [],
              onSelectDoctor: vi.fn(),
              onSelectAll: vi.fn(),
              onDoctorAction: vi.fn(),
              viewMode: 'table',
              onViewModeChange: vi.fn(),
            };

            const { container } = render(
              <TestWrapper>
                <DoctorManagementGrid
                  doctors={doctors}
                  {...mockHandlers}
                />
              </TestWrapper>
            );

            // Every doctor must have their name and avatar displayed
            doctors.forEach((doctor) => {
              const fullName = `Dr. ${doctor.user.firstName} ${doctor.user.lastName}`;
              
              // Name should be present
              expect(screen.getByText(fullName)).toBeInTheDocument();
              
              // Avatar should be present (check for MuiAvatar class)
              const avatars = container.querySelectorAll('[class*="MuiAvatar"]');
              expect(avatars.length).toBeGreaterThanOrEqual(doctors.length);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
