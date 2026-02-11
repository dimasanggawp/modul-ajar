import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        // You might want to check for something specific, e.g., a header or title
        // expect(screen.getByText(/Modul Ajar Generator/i)).toBeInTheDocument();
    });
});
