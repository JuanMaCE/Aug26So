import React, { useState } from 'react'
import './App.css'

interface FormData {
  nombre: string
  apellidos: string
  email: string
  edad: string
  password: string
}

interface FormErrors {
  nombre?: string
  apellidos?: string
  email?: string
  edad?: string
  password?: string
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    apellidos: '',
    email: '',
    edad: '',
    password: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredUser, setRegisteredUser] = useState<FormData | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', class: '' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1

    switch (score) {
      case 1:
        return { score: 1, label: 'Débil', class: 'active-weak' }
      case 2:
        return { score: 2, label: 'Regular', class: 'active-fair' }
      case 3:
        return { score: 3, label: 'Buena', class: 'active-good' }
      case 4:
        return { score: 4, label: 'Fuerte', class: 'active-strong' }
      default:
        return { score: 0, label: '', class: '' }
    }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // Nombre validation
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    // Apellidos validation
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios'
    } else if (formData.apellidos.trim().length < 2) {
      newErrors.apellidos = 'Los apellidos deben tener al menos 2 caracteres'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio'
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Ingresa un correo electrónico válido'
    }

    // Edad validation
    const edadNum = Number(formData.edad)
    if (!formData.edad.trim()) {
      newErrors.edad = 'La edad es obligatoria'
    } else if (isNaN(edadNum) || edadNum <= 0 || edadNum > 120 || !Number.isInteger(edadNum)) {
      newErrors.edad = 'Ingresa una edad válida (1 - 120)'
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error on change if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
    if (serverError) {
      setServerError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.nombre.trim(),
          secondName: formData.apellidos.trim(),
          email: formData.email.trim(),
          age: Number(formData.edad),
          password: formData.password,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || data?.message || 'Error al registrar el usuario')
      }

      setRegisteredUser({ ...formData })
      setIsRegistered(true)
    } catch (err: unknown) {
      console.error('Error al registrar usuario:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Error de conexión con el servidor'
      setServerError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setFormData({
      nombre: '',
      apellidos: '',
      email: '',
      edad: '',
      password: '',
    })
    setErrors({})
    setServerError(null)
    setShowPassword(false)
    setIsRegistered(false)
    setRegisteredUser(null)
  }

  return (
    <main className="app-container">
      <div className="register-card">
        {!isRegistered ? (
          <>
            {/* Header */}
            <div className="card-header">
              <div className="brand-badge" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M19 8v6m3-3h-6" />
                </svg>
              </div>
              <h1 className="card-title">Crear nueva cuenta</h1>
              <p className="card-subtitle">Ingresa tus datos para registrarte en la plataforma</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="registration-form" noValidate>
              {serverError && (
                <div className="server-error-banner" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              {/* Nombre y Apellidos */}
              <div className="form-row">
                {/* Nombre */}
                <div className="form-group">
                  <label htmlFor="nombre" className="form-label">
                    Nombre <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="nombre"
                      name="nombre"
                      type="text"
                      placeholder="Ej. Juan"
                      className={`input-control ${errors.nombre ? 'has-error' : ''}`}
                      value={formData.nombre}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoComplete="given-name"
                    />
                  </div>
                  {errors.nombre && (
                    <span className="error-message">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.nombre}
                    </span>
                  )}
                </div>

                {/* Apellidos */}
                <div className="form-group">
                  <label htmlFor="apellidos" className="form-label">
                    Apellidos <span className="required-star">*</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="apellidos"
                      name="apellidos"
                      type="text"
                      placeholder="Ej. Pérez Gómez"
                      className={`input-control ${errors.apellidos ? 'has-error' : ''}`}
                      value={formData.apellidos}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      autoComplete="family-name"
                    />
                  </div>
                  {errors.apellidos && (
                    <span className="error-message">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {errors.apellidos}
                    </span>
                  )}
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    className={`input-control ${errors.email ? 'has-error' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Edad */}
              <div className="form-group">
                <label htmlFor="edad" className="form-label">
                  Edad <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                  </span>
                  <input
                    id="edad"
                    name="edad"
                    type="number"
                    min="1"
                    max="120"
                    placeholder="Ej. 25"
                    className={`input-control ${errors.edad ? 'has-error' : ''}`}
                    value={formData.edad}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.edad && (
                  <span className="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.edad}
                  </span>
                )}
              </div>

              {/* Contraseña */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña <span className="required-star">*</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    className={`input-control ${errors.password ? 'has-error' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {errors.password}
                  </span>
                )}

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength-container">
                    <div className="strength-bars">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`strength-bar ${
                            passwordStrength.score >= level ? passwordStrength.class : ''
                          }`}
                        />
                      ))}
                    </div>
                    <div className="strength-text">
                      <span>Seguridad:</span>
                      <span>{passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <span>Registrar</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Confirmation / Success State */
          <div className="success-card">
            <div className="success-icon-wrapper">
              <div className="success-icon-bg" />
              <svg className="success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>

            <h2 className="success-title">¡Registro Exitoso!</h2>

            {/* Notification Banner */}
            <div className="validation-notice-banner">
              <div className="notice-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <p className="notice-text">
                <strong>Te estaremos enviando un correo de validación de tu cuenta</strong> a{' '}
                <span className="notice-highlight">{registeredUser?.email}</span>. Por favor revisa tu bandeja de entrada o spam para activar tu usuario.
              </p>
            </div>

            {/* User Data Summary */}
            <div className="user-summary-box">
              <div className="summary-title">Resumen de Registro</div>
              <div className="summary-row">
                <span className="summary-label">Nombre completo:</span>
                <span className="summary-value">
                  {registeredUser?.nombre} {registeredUser?.apellidos}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Correo registrado:</span>
                <span className="summary-value">{registeredUser?.email}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Edad:</span>
                <span className="summary-value">{registeredUser?.edad} años</span>
              </div>
            </div>

            {/* Reset / Register Another Button */}
            <button type="button" className="btn-reset" onClick={handleReset}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              <span>Registrar a otro usuario</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default App

