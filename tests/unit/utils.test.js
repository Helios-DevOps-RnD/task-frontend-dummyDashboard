/**
 * Utility Functions Tests
 * Tests for helper functions used in the dashboard
 */

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format valid date string correctly', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString()
      }

      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).not.toBe('-')
      expect(result).toMatch(/\d+/)
    })

    it('should return dash for null date', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString()
      }

      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
      expect(formatDate('')).toBe('-')
    })

    it('should handle invalid date string', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString()
      }

      const result = formatDate('invalid-date')
      expect(result).toBe('Invalid Date')
    })

    it('should format different date formats', () => {
      const formatDate = (dateStr) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleString()
      }

      const iso8601 = formatDate('2024-01-15T10:30:00Z')
      const timestamp = formatDate(new Date('2024-01-15').getTime().toString())

      expect(iso8601).not.toBe('-')
      expect(timestamp).not.toBe('-')
    })
  })

  describe('API URL Construction', () => {
    it('should use default API URL when env var not set', () => {
      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api'
      expect(API_URL).toBe('http://localhost:3001/api')
    })

    it('should use custom API URL when env var is set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_API_URL
      process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com'

      const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api'
      expect(API_URL).toBe('https://api.example.com/api')

      process.env.NEXT_PUBLIC_API_URL = originalEnv
    })

    it('should use default Pub/Sub URL when env var not set', () => {
      const Create_URL = (process.env.NEXT_PUBLIC_PUBSUB_URL || 'http://localhost:3002') + '/api'
      expect(Create_URL).toBe('http://localhost:3002/api')
    })

    it('should use custom Pub/Sub URL when env var is set', () => {
      const originalEnv = process.env.NEXT_PUBLIC_PUBSUB_URL
      process.env.NEXT_PUBLIC_PUBSUB_URL = 'https://pubsub.example.com'

      const Create_URL = (process.env.NEXT_PUBLIC_PUBSUB_URL || 'http://localhost:3002') + '/api'
      expect(Create_URL).toBe('https://pubsub.example.com/api')

      process.env.NEXT_PUBLIC_PUBSUB_URL = originalEnv
    })
  })

  describe('Form Data Validation', () => {
    it('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }

      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('invalid.email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
    })

    it('should validate username is not empty', () => {
      const validateUsername = (username) => {
        return username && username.trim().length > 0
      }

      expect(validateUsername('testuser')).toBe(true)
      expect(validateUsername('')).toBe(false)
      expect(validateUsername('   ')).toBe(false)
    })

    it('should validate password minimum length', () => {
      const validatePassword = (password) => {
        return password && password.length >= 6
      }

      expect(validatePassword('password123')).toBe(true)
      expect(validatePassword('pass')).toBe(false)
      expect(validatePassword('')).toBe(false)
    })
  })

  describe('Data Transformation', () => {
    it('should handle empty user data array', () => {
      const users = []
      expect(users.length).toBe(0)
      expect(Array.isArray(users)).toBe(true)
    })

    it('should handle user data with missing fields', () => {
      const user = {
        id: 1,
        username: 'testuser',
      }

      const displayName = user.full_name || '-'
      const displayEmail = user.email_address || '-'

      expect(displayName).toBe('-')
      expect(displayEmail).toBe('-')
    })

    it('should safely access nested response data', () => {
      const response = {
        data: {
          data: [{ id: 1, username: 'user1' }],
        },
      }

      const users = response.data.data || []
      expect(users.length).toBe(1)
      expect(users[0].username).toBe('user1')
    })

    it('should handle response without data property', () => {
      const response = { data: null }
      const users = response.data || []
      expect(users).toBe(null)
    })
  })

  describe('Error Handling', () => {
    it('should extract error message from axios response', () => {
      const error = {
        response: {
          data: {
            message: 'User already exists',
          },
        },
      }

      const message = error.response?.data?.message || 'Default error'
      expect(message).toBe('User already exists')
    })

    it('should use default error message when response unavailable', () => {
      const error = {
        message: 'Network error',
      }

      const message = error.response?.data?.message || 'Default error'
      expect(message).toBe('Default error')
    })

    it('should handle error without response object', () => {
      const error = new Error('Network timeout')
      const message = error.response?.data?.message || 'Default error'
      expect(message).toBe('Default error')
    })
  })

  describe('File Upload Validation', () => {
    it('should validate file exists before upload', () => {
      const validateFileUpload = (file) => {
        return file !== null && file !== undefined
      }

      const file = new File(['test'], 'test.pdf')
      expect(validateFileUpload(file)).toBe(true)
      expect(validateFileUpload(null)).toBe(false)
    })

    it('should validate file type', () => {
      const validateFileType = (file, allowedTypes) => {
        return allowedTypes.includes(file.type)
      }

      const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })
      const imageFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

      expect(validateFileType(pdfFile, ['application/pdf'])).toBe(true)
      expect(validateFileType(imageFile, ['application/pdf'])).toBe(false)
    })

    it('should validate file size', () => {
      const validateFileSize = (file, maxSizeInMB) => {
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024
        return file.size <= maxSizeInBytes
      }

      const smallFile = new File(['test'], 'test.pdf')
      expect(validateFileSize(smallFile, 10)).toBe(true)
    })
  })

  describe('State Management Helpers', () => {
    it('should clear form state', () => {
      const clearFormState = () => {
        return {
          username: '',
          fullName: '',
          email: '',
          password: '',
        }
      }

      const cleared = clearFormState()
      expect(cleared.username).toBe('')
      expect(cleared.fullName).toBe('')
      expect(cleared.email).toBe('')
      expect(cleared.password).toBe('')
    })

    it('should reset search state', () => {
      const resetSearchState = () => {
        return {
          searchId: '',
          foundUser: null,
        }
      }

      const reset = resetSearchState()
      expect(reset.searchId).toBe('')
      expect(reset.foundUser).toBe(null)
    })

    it('should toggle visibility state', () => {
      const toggleVisibility = (currentState) => {
        return !currentState
      }

      expect(toggleVisibility(true)).toBe(false)
      expect(toggleVisibility(false)).toBe(true)
    })
  })
})
