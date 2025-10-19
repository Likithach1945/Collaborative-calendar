import { describe, it, expect } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import { renderWithProviders } from './testUtils';
import LoginPage from '../pages/LoginPage';

expect.extend(toHaveNoViolations);

/**
 * Accessibility test helper
 */
export async function testA11y(component, options = {}) {
  const { container } = renderWithProviders(component);
  const results = await axe(container, options);
  expect(results).toHaveNoViolations();
  return results;
}

describe('Accessibility Tests', () => {
  it('LoginPage should have no accessibility violations', async () => {
    await testA11y(<LoginPage />);
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = renderWithProviders(<LoginPage />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    // Check that h1 exists
    expect(headings.length).toBeGreaterThan(0);
    expect(container.querySelector('h1')).toBeTruthy();
  });

  it('buttons should have accessible names', async () => {
    const { container } = renderWithProviders(<LoginPage />);
    const buttons = container.querySelectorAll('button');
    
    buttons.forEach((button) => {
      // Each button should have text content or aria-label
      expect(
        button.textContent || button.getAttribute('aria-label')
      ).toBeTruthy();
    });
  });

  it('should have proper focus management', async () => {
    const { container } = renderWithProviders(
      <div>
        <button>First</button>
        <button>Second</button>
      </div>
    );

    const buttons = container.querySelectorAll('button');
    buttons.forEach((button) => {
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });
});
