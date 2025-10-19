import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Run cleanup after each test
afterEach(() => {
  cleanup();
});

// Setup axe for accessibility testing
if (typeof window !== 'undefined') {
  const axe = require('@axe-core/react');
  const React = require('react');
  const ReactDOM = require('react-dom');
  
  axe(React, ReactDOM, 1000);
}
