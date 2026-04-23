import { render } from '@testing-library/react'

/**
 * Custom render function that includes common providers
 * Can be extended to include Redux, Theme providers, etc.
 */
export function renderWithProviders(ui, options = {}) {
  return render(ui, { ...options })
}

/**
 * Mock axios responses for common API calls
 */
export const mockAxiosResponses = {
  users: {
    success: {
      data: {
        data: [
          {
            id: 1,
            username: 'testuser1',
            full_name: 'Test User 1',
            email_address: 'test1@example.com',
            password: 'hashed_password',
            tenant_id: 'tenant1',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
            type: 'user',
            status_ad: 'active',
            custom_attribute_1: null,
            custom_attribute_2: null,
            custom_attribute_3: null,
            json_string_attribute: null,
          },
        ],
      },
    },
    empty: {
      data: {
        data: [],
      },
    },
    single: {
      data: {
        data: {
          id: 1,
          username: 'testuser',
          full_name: 'Test User',
          email_address: 'test@example.com',
        },
      },
    },
  },
  policies: {
    success: {
      data: {
        data: [
          {
            id: 1,
            tenant_id: 'tenant1',
            title_name: 'Test Policy',
            description: 'Test Description',
            apps_bundle_id: 'bundle1',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
            geofencing_id: 'geo1',
            rules_type: 'allow',
            execute_out_of_geofencing: false,
            notification: true,
            message: 'Test message',
          },
        ],
      },
    },
    empty: {
      data: {
        data: [],
      },
    },
  },
  devices: {
    success: {
      data: {
        data: [
          {
            id: 1,
            id_fcm: 'fcm_token_123',
            serial_num: 'SN123456',
            model: 'Model X',
            status: 'active',
            licence_id: 'lic1',
            tenant_id: 'tenant1',
            create_at: '2024-01-01T00:00:00Z',
            update_at: '2024-01-01T00:00:00Z',
            user_id: 1,
            enterprise_device_id: 'ent_dev_1',
            serial_number_manufacture: 'MFG123',
            enterprise_policy_name: 'Policy1',
            enterprise_enrollment_time: '2024-01-01T00:00:00Z',
          },
        ],
      },
    },
    empty: {
      data: {
        data: [],
      },
    },
  },
  files: {
    success: {
      data: {
        data: ['file1.pdf', 'file2.pdf', 'file3.jpg'],
      },
    },
    empty: {
      data: {
        data: [],
      },
    },
    fileUrl: {
      data: {
        file_url: 'https://firebase.com/files/test.pdf',
      },
    },
  },
}

/**
 * Mock error responses
 */
export const mockAxiosErrors = {
  notFound: {
    response: {
      status: 404,
      data: {
        message: 'Resource not found',
      },
    },
  },
  unauthorized: {
    response: {
      status: 401,
      data: {
        message: 'Unauthorized',
      },
    },
  },
  badRequest: {
    response: {
      status: 400,
      data: {
        message: 'Bad request',
      },
    },
  },
  serverError: {
    response: {
      status: 500,
      data: {
        message: 'Internal server error',
      },
    },
  },
  networkError: {
    message: 'Network Error',
  },
}

/**
 * Wait for async operations
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0))

/**
 * Create mock file for upload testing
 */
export function createMockFile(name = 'test.pdf', type = 'application/pdf', size = 1024) {
  const blob = new Blob(['a'.repeat(size)], { type })
  return new File([blob], name, { type })
}

/**
 * Create mock FormData for file upload testing
 */
export function createMockFormData(file) {
  const formData = new FormData()
  formData.append('file', file)
  return formData
}

/**
 * Assert API call was made with correct parameters
 */
export function assertApiCall(mockFn, method, url, data = null) {
  if (data) {
    expect(mockFn).toHaveBeenCalledWith(expect.stringContaining(url), data)
  } else {
    expect(mockFn).toHaveBeenCalledWith(expect.stringContaining(url))
  }
}

/**
 * Get all form inputs by section
 */
export function getFormInputsBySection(container, sectionTitle) {
  const section = container.querySelector(`[data-testid="${sectionTitle}"]`)
  return section ? section.querySelectorAll('input') : []
}

/**
 * Simulate form submission
 */
export async function submitForm(button, userEvent) {
  await userEvent.click(button)
}

/**
 * Check if element has loading state
 */
export function isLoading(element) {
  return element.hasAttribute('disabled') || element.textContent.includes('Mengunggah')
}

/**
 * Extract table data
 */
export function extractTableData(table) {
  const rows = table.querySelectorAll('tbody tr')
  return Array.from(rows).map((row) => {
    const cells = row.querySelectorAll('td')
    return Array.from(cells).map((cell) => cell.textContent)
  })
}

/**
 * Mock environment variables
 */
export function mockEnv(vars) {
  const original = { ...process.env }
  Object.assign(process.env, vars)
  return () => {
    process.env = original
  }
}
