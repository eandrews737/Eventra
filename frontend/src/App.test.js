import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Eventra app', () => {
  render(<App />);
  const appElement = screen.getByText(/Eventra/i);
  expect(appElement).toBeInTheDocument();
});
