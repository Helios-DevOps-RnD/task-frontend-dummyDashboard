# Unit Testing Setup Guide

## Overview

A comprehensive unit testing suite has been created for the Dashboard application using Jest and React Testing Library. All test files are organized in the `tests/unit` folder.

## Project Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── dashboard.e2e.spec.js
│   ├── dashboard.ui.spec.js
│   └── pages/
│       └── DashboardPage.js
└── unit/                         # Unit tests (NEW)
    ├── page.test.js              # Dashboard component tests
    ├── layout.test.js            # Layout component tests
    ├── utils.test.js             # Utility function tests
    ├── testUtils.js              # Shared test utilities
    ├── jest.config.js            # Jest configuration
    ├── jest.setup.js             # Jest setup
    └── README.md                 # Testing documentation
```

## What Was Added

### 1. Dependencies (package.json)
Added testing libraries:
- `jest` - Testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom Jest matchers
- `@testing-library/user-event` - User interaction simulation
- `jest-environment-jsdom` - DOM environment for Jest

### 2. Configuration Files

#### `tests/unit/jest.config.js`
- Configures Jest for Next.js
- Sets up jsdom environment
- Configures module path aliases
- Defines test file patterns
- Sets up coverage collection

#### `tests/unit/jest.setup.js`
- Imports Jest DOM matchers
- Initializes testing environment

### 3. Test Files

#### `tests/unit/page.test.js` (40+ tests)
Comprehensive tests for the Home/Dashboard component:
- **Component Rendering**: Verifies all UI sections render correctly
- **User CRUD Operations**: Tests create, read, update, delete functionality
- **Firebase Operations**: Tests file upload, retrieval, and listing
- **Data Fetching**: Tests fetching users, policies, and devices
- **Form Validation**: Verifies form field requirements and types
- **Error Handling**: Tests error scenarios and user notifications
- **Loading States**: Tests loading indicators during operations

#### `tests/unit/layout.test.js` (5 tests)
Tests for the RootLayout component:
- HTML structure rendering
- Language attribute
- Children content
- Font styling
- Metadata export

#### `tests/unit/utils.test.js` (20+ tests)
Tests for utility functions:
- Date formatting
- API URL construction
- Form validation (email, username, password)
- Data transformation
- Error handling
- File upload validation
- State management helpers

#### `tests/unit/testUtils.js`
Shared testing utilities:
- Mock axios responses for all endpoints
- Mock error responses
- Helper functions for common patterns
- Mock file creation utilities
- Form interaction helpers

#### `tests/unit/README.md`
Comprehensive testing documentation:
- Test file descriptions
- Running tests commands
- Testing patterns and examples
- Mocking strategies
- Best practices
- Troubleshooting guide

## Installation

Install dependencies:
```bash
npm install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (for development)
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

## Test Coverage

The test suite covers:

### Page Component (Home/Dashboard)
- ✅ Component rendering (all sections visible)
- ✅ User creation with validation
- ✅ User search by ID
- ✅ User update functionality
- ✅ User deletion
- ✅ File upload to Firebase
- ✅ File retrieval from Firebase
- ✅ File listing from Firebase
- ✅ Fetching users, policies, devices
- ✅ Error handling for all operations
- ✅ Form validation
- ✅ Loading states
- ✅ Date formatting
- ✅ Empty state handling

### Layout Component
- ✅ HTML structure
- ✅ Language attribute
- ✅ Children rendering
- ✅ Font application
- ✅ Metadata

### Utility Functions
- ✅ Date formatting with null handling
- ✅ API URL construction
- ✅ Email validation
- ✅ Username validation
- ✅ Password validation
- ✅ File upload validation
- ✅ Error message extraction
- ✅ State management helpers

## Key Features

### Comprehensive Mocking
- All axios calls are mocked
- Global alert function is mocked
- Mock data provided for all API endpoints

### User-Centric Testing
- Tests focus on user interactions
- Uses semantic queries (getByRole, getByPlaceholderText)
- Tests real user workflows

### Error Scenarios
- Tests for network errors
- Tests for validation errors
- Tests for server errors
- Tests for missing data

### Async Handling
- Proper use of waitFor for async operations
- Handles form submissions
- Handles API calls

## Test Structure Example

```javascript
describe('Feature Group', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should do something', async () => {
    // Arrange
    axios.get.mockResolvedValueOnce({ data: { data: [...] } })
    render(<Home />)

    // Act
    fireEvent.click(screen.getByRole('button', { name: /Load/i }))

    // Assert
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled()
    })
  })
})
```

## Next Steps

1. **Run tests**: `npm test`
2. **Check coverage**: `npm run test:coverage`
3. **Add more tests**: Create new test files in `tests/unit/`
4. **Integrate with CI/CD**: Add test command to your CI pipeline
5. **Monitor coverage**: Aim for >80% coverage

## CI/CD Integration

Add to your CI pipeline:
```bash
npm test -- --coverage --watchAll=false
```

## Troubleshooting

### Tests not running
- Ensure dependencies are installed: `npm install`
- Check Node version compatibility (Node 14+)

### Mock not working
- Verify mock is defined before component render
- Check axios is properly mocked at top of test file

### Element not found
- Use `screen.debug()` to see rendered DOM
- Check element is rendered conditionally
- Verify correct query selector

### Timeout errors
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)

## Summary

A complete unit testing setup has been created with:
- **65+ test cases** covering all major functionality
- **Jest + React Testing Library** for robust component testing
- **Mock utilities** for consistent test data
- **Comprehensive documentation** for maintaining tests
- **CI/CD ready** configuration
- **Organized in `tests/unit` folder** for better project structure

Start testing with `npm test`!
