import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        // App already contains HashRouter, so no need to wrap it
        render(<App />);
        // Check for dashboard link or title
        // expect(screen.getByText(/Generator Rencana Pembelajaran Mendalam/i)).toBeInTheDocument();
    });
});
