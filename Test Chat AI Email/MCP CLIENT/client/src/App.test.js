import { render, screen } from '@testing-library/react';
import App from './App';

test('renders chatbot header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Chatbot MCP/i);
  expect(headerElement).toBeInTheDocument();
});
