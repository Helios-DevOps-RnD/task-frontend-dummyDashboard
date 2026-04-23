# Unit Tests Structure

## Overview

All unit tests for the Dashboard application are organized in this `tests/unit` folder. This keeps test files separate from end-to-end tests and maintains a clean project structure.

## Files in This Folder

### Test Files

- **page.test.js** - Tests for the Home/Dashboard component
  - 40+ test cases
  - Covers CRUD operations, file uploads, data fetching
  - Tests error handling and loading states

- **layout.test.js** - Tests for the RootLayout component
  - 5 test cases
  - Verifies HTML structure, metadata, and styling

- **utils.test.js** - Tests for utility functions
  - 20+ test cases
  - Tests date formatting, validation, error handling

### Configuration Files

- **jest.config.js** - Jest configuration for this test suite
  - Configured for Next.js
  - Sets up jsdom environment
  - Defines test patterns and coverage collection

- **jest.setup.js** - Jest setup file
  - Imports testing library matchers
  - Initializes test environment

### Utilities

- **testUtils.js** - Shared testing utilities
  - Mock data for all API endpoints
  - Helper functions for common test patterns
  - Mock file creation utilities

### Documentation

- **README.md** - Comprehensive testing guide
  - How to run tests
  - Testing patterns and examples
  - Best practices and troubleshooting

- **STRUCTURE.md** - This file
  - Overview of folder structure
  - File descriptions

## Running Tests

From the project root:

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- page.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="Create User"
```

## Adding New Tests

1. Create a new `.test.js` file in this folder
2. Import testing utilities from `testUtils.js`
3. Follow the existing test structure
4. Use mock data from `testUtils.js`
5. Run tests to verify

Example:
```javascript
import { render, screen } from '@testing-library/react'
import { mockAxiosResponses } from './testUtils'

describe('My Feature', () => {
  it('should do something', () => {
    // Your test here
  })
})
```

## Test Coverage

Current coverage includes:
- Dashboard component (40+ tests)
- Layout component (5 tests)
- Utility functions (20+ tests)
- Total: 65+ test cases

Target coverage: >80% for all metrics

## Key Testing Patterns

### Mocking API Calls
```javascript
import axios from 'axios'
jest.mock('axios')

axios.get.mockResolvedValueOnce({ data: { data: [...] } })
```

### Testing User Interactions
```javascript
import userEvent from '@testing-library/user-event'

await userEvent.type(input, 'text')
fireEvent.click(button)
```

### Async Operations
```javascript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(element).toBeInTheDocument()
})
```

## Troubleshooting

### Tests not found
- Ensure files end with `.test.js`
- Check jest.config.js testMatch pattern

### Import errors
- Verify relative paths are correct
- Check module aliases in jest.config.js

### Mock not working
- Ensure mock is defined before component render
- Check jest.mock() is at top of file

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
