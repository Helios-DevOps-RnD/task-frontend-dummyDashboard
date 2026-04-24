# Unit Tests Documentation

This directory contains comprehensive unit tests for the Dashboard application.

## Test Files

### `page.test.js`
Main test suite for the Home/Dashboard component. Covers:
- Component rendering and UI elements
- User CRUD operations (Create, Read, Update, Delete)
- Firebase file operations (Upload, Get, List)
- Data fetching operations (Users, Policies, Devices)
- Form validation
- Loading states
- Error handling

**Test Coverage:**
- 40+ test cases
- API integration with axios mocking
- User interactions with React Testing Library
- Error scenarios and edge cases

### `layout.test.js`
Tests for the RootLayout component. Covers:
- HTML structure rendering
- Language attribute
- Children content rendering
- Font class application
- Metadata export

### `utils.test.js`
Tests for utility functions and helpers. Covers:
- Date formatting
- API URL construction
- Form validation (email, username, password)
- Data transformation
- Error handling
- File upload validation
- State management helpers

### `testUtils.js`
Shared testing utilities and mock data. Provides:
- Custom render function with providers
- Mock axios responses for all API endpoints
- Mock error responses
- Helper functions for common testing patterns
- Mock file creation utilities
- Form interaction helpers

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- page.test.js
```

### Run tests matching a pattern
```bash
npm test -- --testNamePattern="Create User"
```

## Test Structure

Each test file follows this structure:

```javascript
describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  describe('Feature Group', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

## Mocking

### Axios Mocking
All API calls are mocked using Jest:

```javascript
jest.mock('axios')

// Mock successful response
axios.get.mockResolvedValueOnce({ data: { data: [...] } })

// Mock error response
axios.get.mockRejectedValueOnce({ response: { status: 404 } })
```

### Alert Mocking
Global alert function is mocked to verify user notifications:

```javascript
global.alert = jest.fn()
expect(global.alert).toHaveBeenCalledWith('Expected message')
```

## Common Testing Patterns

### Testing API Calls
```javascript
it('should fetch users', async () => {
  axios.get.mockResolvedValueOnce({ data: { data: mockUsers } })
  render(<Home />)
  
  fireEvent.click(screen.getByRole('button', { name: /Load Data Users/i }))
  
  await waitFor(() => {
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/api/users'))
  })
})
```

### Testing Form Submission
```javascript
it('should create user', async () => {
  axios.post.mockResolvedValueOnce({ data: { success: true } })
  render(<Home />)
  
  const inputs = screen.getAllByPlaceholderText(/Username|Full Name|Email|Password/)
  await userEvent.type(inputs[0], 'testuser')
  // ... fill other inputs
  
  fireEvent.click(screen.getByRole('button', { name: /Create User/i }))
  
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalled()
  })
})
```

### Testing Error Handling
```javascript
it('should handle error', async () => {
  axios.get.mockRejectedValueOnce({ response: { status: 404 } })
  render(<Home />)
  
  fireEvent.click(screen.getByRole('button', { name: /Search/i }))
  
  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith('User tidak ditemukan')
  })
})
```

### Testing File Upload
```javascript
it('should upload file', async () => {
  axios.post.mockResolvedValueOnce({ data: { file_url: 'url' } })
  render(<Home />)
  
  const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
  const fileInput = screen.getByRole('textbox', { hidden: true })
  
  fireEvent.change(fileInput, { target: { files: [file] } })
  fireEvent.click(screen.getByRole('button', { name: /Upload/i }))
  
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/upload'),
      expect.any(FormData)
    )
  })
})
```

## Test Data

Mock data is provided in `testUtils.js`:

```javascript
mockAxiosResponses.users.success      // Array of users
mockAxiosResponses.policies.success   // Array of policies
mockAxiosResponses.devices.success    // Array of devices
mockAxiosResponses.files.success      // Array of file names

mockAxiosErrors.notFound              // 404 error
mockAxiosErrors.serverError           // 500 error
```

## Best Practices

1. **Use semantic queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
2. **Test user behavior**: Focus on what users do, not implementation details
3. **Use `waitFor` for async**: Always wait for async operations to complete
4. **Mock external dependencies**: Mock axios, localStorage, etc.
5. **Clear mocks between tests**: Use `jest.clearAllMocks()` in `beforeEach`
6. **Test error cases**: Include tests for error scenarios
7. **Keep tests focused**: One assertion per test when possible
8. **Use descriptive names**: Test names should clearly describe what's being tested

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
npm run test:coverage
```

## Debugging Tests

### Run single test
```bash
npm test -- --testNamePattern="should create user"
```

### Debug mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Print debug info
```javascript
import { screen, debug } from '@testing-library/react'

debug() // Prints entire DOM
screen.debug(element) // Prints specific element
```

## Continuous Integration

Tests are configured to run in CI environments. Ensure:
- All tests pass before committing
- Coverage thresholds are met
- No console errors or warnings

## Adding New Tests

When adding new features:

1. Create test file in `__tests__` directory
2. Follow existing test structure
3. Use mock data from `testUtils.js`
4. Add descriptive test names
5. Include both success and error cases
6. Update this README if adding new patterns

## Troubleshooting

### Tests timeout
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

### Mock not working
- Ensure mock is defined before component render
- Check mock is called with correct parameters
- Verify axios is properly mocked

### Element not found
- Use `screen.debug()` to see rendered DOM
- Check element is rendered conditionally
- Verify correct query selector

### Async issues
- Always use `waitFor` for async operations
- Check promise is properly resolved
- Verify mock is set up before action

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
