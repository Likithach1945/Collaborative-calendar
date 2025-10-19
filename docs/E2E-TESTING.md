# End-to-End Testing Guide

## Overview

This document provides guidance for implementing end-to-end (E2E) tests for the Calendar Application using Playwright.

## Setup Playwright

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

## Test Structure

Create `tests/e2e/` directory:

```javascript
// tests/e2e/calendar-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('Calendar Application E2E', () => {
  
  test('full scheduling flow', async ({ page }) => {
    // 1. Login
    await page.goto('http://localhost:5173/login');
    await page.click('text=Login with Google');
    // Note: OAuth flow needs to be mocked or use test credentials
    
    // 2. Navigate to Calendar
    await expect(page).toHaveURL(/.*calendar/);
    
    // 3. Create Event
    await page.click('button:has-text("New Event")');
    await page.fill('input[name="title"]', 'Team Meeting');
    await page.fill('textarea[name="description"]', 'Quarterly planning');
    await page.fill('input[name="participants"]', 'colleague@example.com');
    await page.click('button:has-text("Create Event")');
    
    // 4. Verify event created
    await expect(page.locator('text=Team Meeting')).toBeVisible();
    
    // 5. Check Availability
    await page.goto('http://localhost:5173/availability');
    await page.fill('input[name="participantEmails"]', 'colleague@example.com');
    await page.click('button:has-text("Check Availability")');
    
    // 6. Verify suggestions appear
    await expect(page.locator('text=Suggested Times')).toBeVisible();
    
    // 7. Navigate to Invitations
    await page.goto('http://localhost:5173/invitations');
    
    // 8. Respond to invitation
    await page.click('button:has-text("Accept")');
    await expect(page.locator('text=Accepted')).toBeVisible();
    
    // 9. Propose new time
    await page.click('button:has-text("Propose New Time")');
    // Fill in proposed time
    await page.click('button:has-text("Submit Proposal")');
    await expect(page.locator('text=Proposal submitted')).toBeVisible();
  });
  
  test('invitation response flow', async ({ page }) => {
    // Test invitation accept/decline functionality
  });
  
  test('time proposal workflow', async ({ page }) => {
    // Test proposal creation and acceptance
  });
});
```

## Configuration

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/calendar-flow.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## OAuth Testing Challenge

Since the app uses Google OAuth, E2E testing requires special handling:

### Option 1: Mock OAuth (Recommended for E2E)
```javascript
// Mock the OAuth callback
await page.route('**/auth/callback/google**', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ accessToken: 'mock-token', user: { email: 'test@example.com' } })
  });
});
```

### Option 2: Test Credentials
- Create a test Google account
- Use Playwright's `storageState` to reuse authentication

### Option 3: Bypass Auth in Test Environment
```java
// Add test-only endpoint (NOT for production)
@Profile("test")
@RestController
public class TestAuthController {
    @PostMapping("/api/test/auth")
    public AuthResponse testLogin() {
        // Return test JWT
    }
}
```

## Best Practices

1. **Use Page Objects**
```javascript
// pages/LoginPage.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.loginButton = page.locator('text=Login with Google');
  }
  
  async login() {
    await this.loginButton.click();
  }
}
```

2. **Test Data Management**
```javascript
import { test as base } from '@playwright/test';

const test = base.extend({
  testEvent: async ({ request }, use) => {
    // Create test event via API
    const response = await request.post('/api/v1/events', {
      data: { title: 'Test Event', /* ... */ }
    });
    const event = await response.json();
    
    await use(event);
    
    // Cleanup
    await request.delete(`/api/v1/events/${event.id}`);
  }
});
```

3. **Visual Regression Testing**
```javascript
await expect(page).toHaveScreenshot('calendar-page.png');
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

**Timeout Issues:**
```javascript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ...
});
```

**Debugging Selectors:**
```bash
npx playwright codegen http://localhost:5173
```

**Network Issues:**
```javascript
// Wait for specific network requests
await page.waitForResponse(resp => 
  resp.url().includes('/api/v1/events') && resp.status() === 200
);
```

## Future Enhancements

- [ ] Add visual regression tests
- [ ] Test mobile responsiveness
- [ ] Performance testing with Lighthouse
- [ ] Load testing with k6 or Artillery
- [ ] Accessibility testing with axe-playwright

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Authentication Guide](https://playwright.dev/docs/auth)
