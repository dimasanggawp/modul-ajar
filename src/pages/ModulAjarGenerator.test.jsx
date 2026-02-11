import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ModulAjarGenerator from './ModulAjarGenerator';
import { BrowserRouter } from 'react-router-dom';
import * as groqParams from '../lib/groq';

// Mock child components
vi.mock('../components/ModulAjarForm', () => ({
    default: ({ onGenerate }) => (
        <button onClick={() => onGenerate({ topic: 'test' })}>Generate Module</button>
    ),
}));

vi.mock('../components/ModulAjarDisplay', () => ({
    default: ({ content, onReset }) => (
        <div>
            <div data-testid="module-content">{JSON.stringify(content)}</div>
            <button onClick={onReset}>Reset</button>
        </div>
    ),
}));

// Mock API call
vi.mock('../lib/groq', () => ({
    generateStandardModule: vi.fn(),
}));

describe('ModulAjarGenerator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the generator page', () => {
        render(
            <BrowserRouter>
                <ModulAjarGenerator />
            </BrowserRouter>
        );
        expect(screen.getByText(/Generator Modul Ajar/i)).toBeInTheDocument();
        expect(screen.getByText('Generate Module')).toBeInTheDocument();
    });

    it('handles successful generation', async () => {
        const mockContent = { title: 'Test Module' };
        groqParams.generateStandardModule.mockResolvedValue(mockContent);

        render(
            <BrowserRouter>
                <ModulAjarGenerator />
            </BrowserRouter>
        );

        screen.getByText('Generate Module').click();

        await waitFor(() => {
            expect(screen.getByTestId('module-content')).toHaveTextContent(JSON.stringify(mockContent));
        });
    });

    it('handles generation error', async () => {
        const errorMessage = 'API Error';
        groqParams.generateStandardModule.mockRejectedValue(new Error(errorMessage));

        render(
            <BrowserRouter>
                <ModulAjarGenerator />
            </BrowserRouter>
        );

        screen.getByText('Generate Module').click();

        await waitFor(() => {
            expect(screen.getByText(/Gagal membuat modul ajar/i)).toBeInTheDocument();
            expect(screen.getByText(/Detail: API Error/i)).toBeInTheDocument();
        });
    });
});
