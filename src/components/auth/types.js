/**
 * Type definitions for Modern Authentication UI components
 * These are JSDoc type definitions for use in JavaScript files
 */

/**
 * @typedef {Object} AnimatedBackgroundProps
 * @property {'gradient' | 'particles' | 'geometric' | 'combined'} [variant='combined'] - Background animation variant
 * @property {'low' | 'medium' | 'high'} [intensity='medium'] - Animation intensity level
 * @property {string[]} [colors] - Array of colors for gradient
 * @property {boolean} [enableParallax=true] - Enable mouse parallax effect
 * @property {number} [particleCount=50] - Number of particles to render
 * @property {boolean} [reduceMotion=false] - Reduce motion for accessibility
 */

/**
 * @typedef {Object} GlassmorphicCardProps
 * @property {React.ReactNode} children - Card content
 * @property {number} [blur=20] - Backdrop blur amount in pixels
 * @property {number} [opacity=0.7] - Background opacity (0-1)
 * @property {number} [borderRadius=16] - Border radius in pixels
 * @property {number} [padding=32] - Padding in pixels
 * @property {number} [maxWidth=450] - Maximum width in pixels
 * @property {number} [elevation=2] - Shadow elevation level
 */

/**
 * @typedef {Object} AnimatedFormFieldProps
 * @property {string} label - Field label
 * @property {string} type - Input type (text, email, password, etc.)
 * @property {string} value - Current field value
 * @property {(value: string) => void} onChange - Change handler
 * @property {string} [error] - Error message
 * @property {boolean} [touched=false] - Whether field has been touched
 * @property {React.ReactNode} [icon] - Start adornment icon
 * @property {React.ReactNode} [endAdornment] - End adornment element
 * @property {string} [autoComplete] - Autocomplete attribute
 * @property {boolean} [required=false] - Whether field is required
 * @property {boolean} [disabled=false] - Whether field is disabled
 * @property {() => void} [onFocus] - Focus handler
 * @property {() => void} [onBlur] - Blur handler
 * @property {number} [animationDelay=0] - Stagger animation delay in ms
 */

/**
 * @typedef {Object} PasswordRequirement
 * @property {string} label - Requirement description
 * @property {(password: string) => boolean} test - Test function
 * @property {boolean} [met] - Whether requirement is met
 */

/**
 * @typedef {Object} PasswordStrengthIndicatorProps
 * @property {string} password - Password to evaluate
 * @property {PasswordRequirement[]} [requirements] - Custom requirements
 * @property {boolean} [showRequirements=true] - Show requirement checklist
 */

/**
 * @typedef {Object} PasswordStrengthResult
 * @property {number} score - Strength score (0-100)
 * @property {'weak' | 'medium' | 'strong'} strength - Strength level
 * @property {PasswordRequirement[]} requirements - Requirements with met status
 * @property {number} percentage - Percentage of requirements met
 */

/**
 * @typedef {'PATIENT' | 'DOCTOR' | 'ADMIN'} UserRole
 */

/**
 * @typedef {Object} RoleOption
 * @property {UserRole} value - Role value
 * @property {string} label - Display label
 * @property {React.ReactNode} icon - Role icon
 * @property {string} description - Role description
 * @property {string} color - Theme color for role
 */

/**
 * @typedef {Object} RoleSelectorProps
 * @property {UserRole} value - Selected role
 * @property {(role: UserRole) => void} onChange - Change handler
 * @property {RoleOption[]} roles - Available roles
 */

/**
 * @typedef {Object} LoginFormState
 * @property {string} email - Email address
 * @property {string} password - Password
 * @property {boolean} showPassword - Show password toggle
 * @property {boolean} isLoading - Loading state
 * @property {Record<string, string>} errors - Field errors
 * @property {Record<string, boolean>} touched - Touched fields
 */

/**
 * @typedef {Object} RegisterFormState
 * @property {string} firstName - First name
 * @property {string} lastName - Last name
 * @property {string} email - Email address
 * @property {string} phoneNumber - Phone number
 * @property {string} password - Password
 * @property {string} confirmPassword - Password confirmation
 * @property {UserRole} role - User role
 * @property {boolean} showPassword - Show password toggle
 * @property {boolean} showConfirmPassword - Show confirm password toggle
 * @property {number} passwordStrength - Password strength (0-100)
 * @property {boolean} isLoading - Loading state
 * @property {Record<string, string>} errors - Field errors
 * @property {Record<string, boolean>} touched - Touched fields
 */

/**
 * @typedef {Object} ModernLoginFormProps
 * @property {() => void} onSwitchToRegister - Switch to register handler
 * @property {() => void} onLoginSuccess - Login success handler
 * @property {string} [initialEmail] - Initial email value
 */

/**
 * @typedef {Object} ModernRegisterFormProps
 * @property {() => void} onSwitchToLogin - Switch to login handler
 * @property {() => void} onRegisterSuccess - Register success handler
 * @property {UserRole} [initialRole] - Initial role value
 */

/**
 * @typedef {Object} Particle
 * @property {string} id - Unique particle ID
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} size - Particle size
 * @property {string} color - Particle color
 * @property {{x: number, y: number}} velocity - Velocity vector
 * @property {number} opacity - Opacity (0-1)
 */

/**
 * @typedef {Object} ParticleSystemProps
 * @property {number} count - Number of particles
 * @property {string[]} colors - Particle colors
 * @property {{min: number, max: number}} size - Size range
 * @property {{min: number, max: number}} speed - Speed range
 * @property {{min: number, max: number}} opacity - Opacity range
 */

/**
 * @typedef {Object} ValidationRule
 * @property {(value: string) => boolean} test - Validation test function
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} FieldValidation
 * @property {boolean} [required] - Field is required
 * @property {number} [minLength] - Minimum length
 * @property {number} [maxLength] - Maximum length
 * @property {RegExp} [pattern] - Pattern to match
 * @property {ValidationRule[]} [custom] - Custom validation rules
 */

/**
 * @typedef {Record<string, FieldValidation>} FormValidation
 */

/**
 * @typedef {Object} AuthFormSwitcherProps
 * @property {'login' | 'register'} [initialMode='login'] - Initial form mode
 * @property {() => void} [onLoginSuccess] - Login success handler
 * @property {() => void} [onRegisterSuccess] - Register success handler
 */

/**
 * @typedef {Object} PreservedFormData
 * @property {string} email - Preserved email address
 * @property {UserRole} role - Preserved role selection
 */

export {};
