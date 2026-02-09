import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button Component', () => {
    it('renders correctly with children', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled Button</Button>);
        const button = screen.getByText('Disabled Button');
        expect(button).toBeDisabled();
    });

    it('shows loading state and is disabled when isLoading is true', () => {
        render(<Button isLoading>Loading Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(screen.getByText('Processando...')).toBeInTheDocument();
    });

    it('applies the correct variant class', () => {
        render(<Button variant="danger">Danger</Button>);
        const button = screen.getByText('Danger');
        // Using contain to avoid being too strict with full className string
        expect(button.className).toContain('bg-[var(--error)]');
    });
});
